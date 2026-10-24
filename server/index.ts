import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { randomUUID } from "crypto";
import helmet from "helmet";
import { ZodError } from "zod";

import connectDb from "./config/db.ts";
import env from "./config/env.ts";
import authRouter from "./routes/auth.Routes.ts";
import userRouter from "./routes/user.Routes.ts";
import contentRouter from "./routes/content.Routes.ts";
import { metricsMiddleware, metricsHandler } from "./services/metrics.service.ts";
import { startViewBufferWorker } from "./services/viewBuffer.service.ts";
import { createTranscodeWorker } from "./queues/videoQueue.ts";
import { apiLimiter } from "./middleware/rateLimit.ts";
import logger from "./services/logger.service.ts";

const PORT = env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === "production";
const IS_TEST = process.env.NODE_ENV === "test";

const app = express();

// ── Reverse Proxy Awareness ────────────────────────────────────
// Accurately resolves client IP & secure cookies behind Render, Railway, Nginx, or Docker
app.set("trust proxy", 1);

const allowedOrigins: string[] = env.CLIENT_URL
  ? env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

// ── Security Headers (Helmet) ──────────────────────────────────
app.use(
  helmet({
    // Disable HTML CSP since this is a pure JSON REST API.
    // Default CSP includes "upgrade-insecure-requests" which can break local HTTP development.
    contentSecurityPolicy: false,
    // Allow cross-origin requests from the React client (localhost:5173 / Vercel)
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Allow OAuth / Firebase Google Auth popups
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// ── Request Correlation & Observability ────────────────────────
app.use((req, res, next) => {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);

  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (!IS_TEST) {
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms [${requestId}]`
      );
    }
  });
  next();
});

// ── RED Telemetry Middleware ──────────────────────────────────
app.use(metricsMiddleware);

// ── CORS Configuration ─────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow localhost ONLY outside production (dev & test)
      if (
        !IS_PROD &&
        (/^http:\/\/localhost(:\d+)?$/.test(origin) ||
          /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin))
      ) {
        return callback(null, true);
      }

      // Allow Vercel preview environments outside production
      if (!IS_PROD && (origin.endsWith(".vercel.app") || origin === "https://vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "x-request-id"],
  })
);

// ── Body Parser with Payload Limit (Prevent DoS) ───────────────
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ── Health Check & Base Routes ─────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dbConnected: mongoose.connection.readyState === 1,
  });
});

app.get("/metrics", metricsHandler);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Vision backend is running",
    version: "2.0.0-ts",
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// ── Application Routes (Protected by Distributed Sliding Rate Limiter) ──
app.use("/api/v1", apiLimiter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);

// ── Centralized Error Handler (Structured Pino Logging) ────────
interface AppError extends Error {
  statusCode?: number;
  status?: number;
  isOperational?: boolean;
  errors?: unknown;
}

app.use((err: Error | AppError | ZodError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  const requestId = req.headers["x-request-id"] as string | undefined;

  // ── Global Zod Validation Error Interceptor ───────────────────
  if (err instanceof ZodError) {
    const validationErrors = err.flatten().fieldErrors;

    logger.warn(
      {
        method: req.method,
        url: req.originalUrl || req.url,
        requestId,
        statusCode: 400,
        validationErrors,
      },
      "Client validation failed"
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationErrors,
      requestId,
    });
  }

  // ── General Server / Application Error Handler ────────────────
  const appErr = err as AppError;
  const statusCode = appErr.statusCode || appErr.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  logger.error(
    {
      method: req.method,
      url: req.originalUrl || req.url,
      requestId,
      statusCode,
      err: {
        message: appErr.message,
        stack: appErr.stack,
        ...(appErr.errors ? { errors: appErr.errors } : {}),
      },
    },
    "Request failed with error"
  );

  const safeMessage =
    isProduction && statusCode === 500
      ? "Internal server error"
      : appErr.message || "An unexpected error occurred";

  return res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(appErr.errors ? { errors: appErr.errors } : {}),
    ...(!isProduction && { stack: appErr.stack }),
    requestId,
  });
});

export default app;

// ── Fail-Fast Server Startup ───────────────────────────────────
if (!IS_TEST && process.argv[1] && (process.argv[1].endsWith("index.ts") || process.argv[1].endsWith("index.js"))) {
  connectDb()
    .then(() => {
      startViewBufferWorker();
      createTranscodeWorker();
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect to database. Exiting...", err);
      process.exit(1);
    });
}
