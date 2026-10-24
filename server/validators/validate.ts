import type { ZodTypeAny } from "zod";
import type { NextFunction, Request, Response } from "express";

/**
 * Reusable Zod middleware — validates the request boundary before business logic runs.
 * On validation failure, passes the ZodError to next(err) for centralized handling.
 */
export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;
    next();
  };

export const validateQuery =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(result.error);
    }

    Object.defineProperty(req, "query", {
      value: result.data,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    next();
  };

export const validateParams =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return next(result.error);
    }

    Object.defineProperty(req, "params", {
      value: result.data,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    next();
  };

export default validate;
