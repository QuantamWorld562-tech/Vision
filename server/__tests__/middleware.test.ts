import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { validate, validateQuery, validateParams } from "../validators/validate.ts";
import { slidingRateLimit } from "../middleware/slidingRateLimit.ts";
import { closeRedisClient } from "../services/cache.service.ts";
import type { Request, Response, NextFunction } from "express";

interface MockResponse extends Partial<Response> {
  statusCode: number;
  body: any;
}

function createMockRes(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this as unknown as Response;
    },
    json(data: any) {
      this.body = data;
      return this as unknown as Response;
    },
  };
  return res;
}

test("validate middleware passes on valid body and calls next()", () => {
  const schema = z.object({ title: z.string().min(3) });
  const middleware = validate(schema);

  const req = { body: { title: "Hello World" } } as Request;
  const res = createMockRes();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  middleware(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(req.body.title, "Hello World");
});

test("validate middleware blocks invalid body and forwards ZodError to next", () => {
  const schema = z.object({ title: z.string().min(3) });
  const middleware = validate(schema);

  const req = { body: { title: "Hi" } } as Request;
  const res = createMockRes();
  let receivedError: unknown = null;
  const next: NextFunction = (err?: unknown) => {
    receivedError = err;
  };

  middleware(req, res, next);

  assert.ok(receivedError instanceof z.ZodError);
  assert.ok((receivedError as z.ZodError).flatten().fieldErrors.title);
});

test("validateQuery middleware transforms and attaches parsed query", () => {
  const schema = z.object({
    page: z.string().transform((v) => parseInt(v, 10)),
  });
  const middleware = validateQuery(schema);

  const req = { query: { page: "5" } } as unknown as Request;
  const res = createMockRes();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  middleware(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(req.query.page, 5);
});

test("validateParams middleware validates route parameters", () => {
  const schema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  });
  const middleware = validateParams(schema);

  const req = { params: { id: "507f1f77bcf86cd799439011" } } as unknown as Request;
  const res = createMockRes();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  middleware(req, res, next);

  assert.equal(nextCalled, true);
});

test("slidingRateLimit passes through in test environment", async () => {
  const limiter = slidingRateLimit({ windowMs: 60000, maxRequests: 5 });
  const req = { ip: "127.0.0.1", socket: {} } as unknown as Request;
  const res = createMockRes();
  let nextCalled = false;

  await limiter(req, res as unknown as Response, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test("slidingRateLimit fails open when Redis client is null in non-test mode", async () => {
  const prevEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  try {
    const limiter = slidingRateLimit({ windowMs: 60000, maxRequests: 5 });
    const req = { ip: "127.0.0.1", socket: {} } as unknown as Request;
    const res = createMockRes();
    let nextCalled = false;

    await limiter(req, res as unknown as Response, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  } finally {
    process.env.NODE_ENV = prevEnv;
    await closeRedisClient();
  }
});
