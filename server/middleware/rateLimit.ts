import type { RequestHandler } from "express";
import { slidingRateLimit } from "./slidingRateLimit.ts";

/**
 * Sensitive Authentication Limiter:
 * 10 attempts per 15 minutes per IP.
 */
export const authLimiter: RequestHandler = slidingRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  prefix: "auth",
  message: "Too many attempts. Please try again in 15 minutes.",
});

/**
 * OTP Request Limiter:
 * 5 attempts per 10 minutes per IP.
 */
export const otpLimiter: RequestHandler = slidingRateLimit({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  prefix: "otp",
  message: "Too many otp requests. Please wait before retrying.",
});

/**
 * Global API Limiter:
 * 100 requests per 1 minute per IP across standard API routes.
 */
export const apiLimiter: RequestHandler = slidingRateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  prefix: "api",
  message: "Too many requests. Please slow down.",
});

export { slidingRateLimit };
