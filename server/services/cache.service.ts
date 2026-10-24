import { createClient } from "redis";
import env from "../config/env.ts";

type RedisClientType = ReturnType<typeof createClient>;

let redisClient: RedisClientType | null = null;
let isConnecting = false;

/**
 * Returns a connected Redis client instance (singleton).
 * Provides graceful fallback if Redis is unavailable.
 */
export const getRedisClient = async (): Promise<RedisClientType | null> => {
  if (redisClient?.isOpen) return redisClient;

  if (!redisClient) {
    redisClient = createClient({
      url: env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) return new Error("Redis retry limit exceeded");
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on("error", (err) => {
      // Warning level log to prevent unhandled process rejection
      if (process.env.NODE_ENV !== "test") {
        console.warn("⚠️ [Redis Connection Warning]:", err.message);
      }
    });
  }

  if (!redisClient.isOpen && !isConnecting) {
    isConnecting = true;
    try {
      await redisClient.connect();
    } catch {
      // Fail-open: Redis is offline, continue with database
      return null;
    } finally {
      isConnecting = false;
    }
  }

  return redisClient.isOpen ? redisClient : null;
};

/**
 * Gracefully closes the Redis client connection (useful for shutdown & tests).
 */
export const closeRedisClient = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.disconnect().catch(() => {});
    redisClient = null;
  }
};

/**
 * Two-tier Cache-Aside helper.
 * 1. Checks Redis cache.
 * 2. On miss, calls fetchFn() to retrieve fresh data from MongoDB.
 * 3. Sets value in Redis with a +/- 15% TTL jitter to prevent cache stampedes.
 * 4. Fails open on Redis errors to prevent API outages.
 */
export const getOrSetCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> => {
  try {
    const client = await getRedisClient();
    if (!client) return await fetchFn();

    const cached = await client.get(key);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }

    const freshData = await fetchFn();

    if (freshData !== undefined && freshData !== null) {
      const jitter = Math.floor(ttlSeconds * 0.15 * (Math.random() * 2 - 1));
      const finalTtl = Math.max(10, ttlSeconds + jitter);
      await client.setEx(key, finalTtl, JSON.stringify(freshData));
    } else {
      // Cache penetration guard: cache null for 30s
      await client.setEx(key, 30, JSON.stringify(null));
    }

    return freshData;
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[Cache-Aside Error on key ${key}]: Falling back to DB`, err);
    }
    return await fetchFn();
  }
};

/**
 * Invalidates a specific cache key on data mutations (write path).
 */
export const invalidateCache = async (key: string): Promise<void> => {
  try {
    const client = await getRedisClient();
    if (client) {
      await client.del(key);
    }
  } catch (err) {
    console.warn(`[Cache Invalidation Error for key ${key}]:`, err);
  }
};

/**
 * Safely invalidates cache keys matching a pattern using SCAN (non-blocking).
 */
export const invalidatePattern = async (pattern: string): Promise<void> => {
  try {
    const client = await getRedisClient();
    if (!client) return;

    let cursor = "0";
    do {
      const reply = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = reply.cursor;
      if (reply.keys.length > 0) {
        await client.del(reply.keys);
      }
    } while (cursor !== "0");
  } catch (err) {
    console.warn(`[Cache Invalidation Pattern Error for ${pattern}]:`, err);
  }
};
