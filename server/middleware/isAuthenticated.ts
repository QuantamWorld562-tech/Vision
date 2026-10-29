import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import env from "../config/env.ts";

interface VisionJwtPayload extends JwtPayload {
  userId: string;
}

const extractToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  return req.cookies?.token || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined);
};

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(token, env.SECRET_KEY) as VisionJwtPayload;

    if (!decode || !decode.userId) {
      return res.status(401).json({
        message: "Invalid Token",
        success: false,
      });
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid or expired token", success: false });
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      const decode = jwt.verify(token, env.SECRET_KEY) as VisionJwtPayload;
      if (decode?.userId) {
        req.id = decode.userId;
      }
    }
  } catch {
    // If token is invalid or expired, continue as guest
  }
  next();
};

export default isAuthenticated;
