import type { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../services/cache.service.ts";

interface SlidingWindowOptions {
  windowMs: number;
  maxRequests: number;
  prefix?: string;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * Distributed Sliding-Window Rate Limiter using Redis Sorted Sets (ZSET).
 * Ensures global rate limits across multi-container deployments.
 */
export const slidingRateLimit = (options: SlidingWindowOptions) => {
  const {
    windowMs,
    maxRequests,
    prefix = "global",
    message = "Too many requests. Please try again later.",
    keyGenerator = (req: Request) => req.ip || req.socket.remoteAddress || "anonymous",
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // In test environment, bypass to avoid external dependency
    if (process.env.NODE_ENV === "test") {
      return next();
    }

    try {
      const client = await getRedisClient();
      if (!client) {
        // Fail-open: Redis is offline, allow request
        return next();
      }

      const identifier = keyGenerator(req);
      const key = `vision:ratelimit:${prefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Execute atomic pipeline in Redis
      const multi = client.multi();
      multi.zRemRangeByScore(key, 0, windowStart);
      multi.zCard(key);
      multi.zAdd(key, [{ score: now, value: `${now}-${Math.random()}` }]);
      multi.expire(key, Math.ceil(windowMs / 1000));

      const results = await multi.exec();
      const requestCount = (results[1] as unknown as number) || 0;

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - requestCount - 1));

      if (requestCount >= maxRequests) {
        const retryAfterSeconds = Math.ceil(windowMs / 1000);
        res.setHeader("Retry-After", retryAfterSeconds);

        res.status(429).json({
          success: false,
          message,
          retryAfter: retryAfterSeconds,
        });
        return;
      }

      next();
    } catch (err) {
      // Fail-open strategy
      next();
    }
  };
};
