import client from "prom-client";
import type { Request, Response, NextFunction } from "express";

// Initialize standard Prometheus registry
export const register = new client.Registry();

// Enable standard Node.js process metrics (memory, CPU, event loop lag, GC)
client.collectDefaultMetrics({ register, prefix: "vision_" });

// ── RED Metrics ────────────────────────────────────────────────

// 1. Rate: Total HTTP Requests Counter
export const httpRequestCounter = new client.Counter({
  name: "vision_http_requests_total",
  help: "Total number of HTTP requests processed by Vision backend",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// 2. Duration: HTTP Request Latency Histogram
export const httpRequestDurationHistogram = new client.Histogram({
  name: "vision_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// 3. Active in-flight requests gauge
export const activeRequestsGauge = new client.Gauge({
  name: "vision_active_requests",
  help: "Number of active in-flight requests currently being handled",
  registers: [register],
});

/**
 * Express middleware to observe RED metrics for every request.
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.path === "/metrics") {
    return next();
  }

  activeRequestsGauge.inc();
  const start = process.hrtime();

  res.on("finish", () => {
    activeRequestsGauge.dec();
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;

    // Normalize route to avoid high cardinality labels (e.g. /watch/:id instead of raw id)
    const route = req.baseUrl ? `${req.baseUrl}${req.route?.path || ""}` : req.path || "unknown";

    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    });

    httpRequestDurationHistogram.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode.toString(),
      },
      durationSeconds
    );
  });

  next();
};

/**
 * Controller to serve Prometheus /metrics endpoint.
 */
export const metricsHandler = async (_req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Type", register.contentType);
  const metrics = await register.metrics();
  res.send(metrics);
};
