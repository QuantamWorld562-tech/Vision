import { getRedisClient } from "./cache.service.ts";
import { Video } from "../models/video.Model.ts";
import { Types } from "mongoose";

const BUFFER_KEY = "vision:views:buffer";
let flushTimer: NodeJS.Timeout | null = null;
let isFlushing = false;

/**
 * Records a video view with HyperLogLog deduplication.
 * Only unique viewers per 24h window increment the view buffer.
 */
export const recordUniqueView = async (
  videoId: string,
  userIdOrIp: string
): Promise<{ counted: boolean; reason?: string }> => {
  try {
    const client = await getRedisClient();
    if (!client) {
      // Fail-open: Direct update to DB if Redis is unavailable
      await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
      return { counted: true, reason: "direct_db_fallback" };
    }

    const today = new Date().toISOString().slice(0, 10);
    const hllKey = `vision:views:hll:${videoId}:${today}`;

    // HyperLogLog PFADD returns 1 if element is new, 0 if duplicate
    const isUnique = await client.pfAdd(hllKey, userIdOrIp);

    // Set 48-hour expiration on the daily HLL key
    await client.expire(hllKey, 172800);

    if (isUnique === 1) {
      await client.hIncrBy(BUFFER_KEY, videoId, 1);
      return { counted: true };
    }

    return { counted: false, reason: "duplicate_view" };
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[ViewBuffer Error for video ${videoId}]:`, error);
    }
    // Fail-open fallback: direct increment
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }).catch(() => {});
    return { counted: true, reason: "error_fallback" };
  }
};

/**
 * Flushes all accumulated buffered views to MongoDB via bulkWrite.
 */
export const flushViewBufferToDb = async (): Promise<number> => {
  if (isFlushing) return 0;
  isFlushing = true;

  try {
    const client = await getRedisClient();
    if (!client) return 0;

    // Atomically swap the buffer key using rename to prevent losing views incoming during flush
    const tempKey = `${BUFFER_KEY}:flush:${Date.now()}`;
    const exists = await client.exists(BUFFER_KEY);
    if (!exists) return 0;

    await client.rename(BUFFER_KEY, tempKey);
    const buffer = await client.hGetAll(tempKey);
    await client.del(tempKey);

    const videoIds = Object.keys(buffer);
    if (videoIds.length === 0) return 0;

    const bulkOps = videoIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(id) },
          update: { $inc: { views: parseInt(buffer[id], 10) || 0 } },
        },
      }));

    if (bulkOps.length > 0) {
      const result = await Video.bulkWrite(bulkOps);
      return result.modifiedCount;
    }

    return 0;
  } catch (error) {
    console.error("⚠️ Failed to flush view buffer to database:", error);
    return 0;
  } finally {
    isFlushing = false;
  }
};

/**
 * Starts the view buffer worker timer (runs every 30s).
 */
export const startViewBufferWorker = (intervalMs = 30000): void => {
  if (flushTimer) return;

  flushTimer = setInterval(() => {
    flushViewBufferToDb().catch(() => {});
  }, intervalMs);

  // Clean shutdown
  const gracefulExit = async () => {
    if (flushTimer) clearInterval(flushTimer);
    await flushViewBufferToDb();
  };

  process.once("SIGINT", gracefulExit);
  process.once("SIGTERM", gracefulExit);
};
