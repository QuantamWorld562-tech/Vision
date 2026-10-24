import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../index.ts";

test("GET /health returns healthy status and uptime", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, "Server is healthy");
  assert.ok(typeof res.body.uptime === "number");
});

test("GET /metrics exports Prometheus RED metrics", async () => {
  const res = await request(app).get("/metrics");
  assert.equal(res.status, 200);
  assert.ok(res.headers["content-type"].includes("text/plain"));
  assert.ok(res.text.includes("vision_http_requests_total"));
  assert.ok(res.text.includes("vision_http_request_duration_seconds"));
});

test("GET / returns running status and version", async () => {
  const res = await request(app).get("/");
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.version);
});

test("Central error handler catches errors and attaches requestId & stack in development", async () => {
  const prevEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  try {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://unauthorized-domain.com");

    assert.equal(res.status, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "CORS blocked for origin: http://unauthorized-domain.com");
    assert.ok(res.body.requestId);
    assert.ok(res.body.stack);
  } finally {
    process.env.NODE_ENV = prevEnv;
  }
});

test("Central error handler masks 500 error messages and omits stack in production", async () => {
  const prevEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://unauthorized-domain.com");

    assert.equal(res.status, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Internal server error");
    assert.equal(res.body.stack, undefined);
    assert.ok(res.body.requestId);
  } finally {
    process.env.NODE_ENV = prevEnv;
  }
});
