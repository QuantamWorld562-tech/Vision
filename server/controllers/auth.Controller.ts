import { User } from "../models/user.Model.ts";
import type { IUser } from "../models/user.Model.ts";
import bcrypt from "bcrypt";
import uploadOnCloudinary from "../config/cloudinary.ts";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendMail from "../config/sendMail.ts";
import env from "../config/env.ts";
import type { Request, Response } from "express";

/** Generate a 6-digit numeric OTP */
const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

/** Hash an OTP/token with sha256 */
const hashValue = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

/**
 * Cookie options — SameSite=None + Secure=true in production so the cookie
 * is sent cross-origin (Vercel frontend → Render backend).
 * In development both run on localhost so Strict is fine, but None works too.
 */
const accessCookieOptions = {
  httpOnly: true,
  sameSite: env.NODE_ENV === "production" ? "none" : "strict",
  secure: env.NODE_ENV === "production",
  maxAge: 15 * 60 * 1000,
} as const;

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: env.NODE_ENV === "production" ? "none" : "strict",
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as const;

const serializeUser = (user: IUser) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  return userObject;
};

const sendAuthResponse = (
  res: Response,
  user: IUser,
  tokens: { accessToken: string; refreshToken: string },
  message: string,
  statusCode = 200,
) => {
  return res
    .cookie("token", tokens.accessToken, accessCookieOptions)
    .cookie("refreshToken", tokens.refreshToken, refreshCookieOptions)
    .status(statusCode)
    .json({
      success: true,
      message,
      user: serializeUser(user),
    });
};

const issueTokens = async (user: IUser) => {
  const accessToken = jwt.sign({ userId: user._id }, env.SECRET_KEY, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    { userId: user._id },
    env.REFRESH_SECRET || env.SECRET_KEY,
    { expiresIn: "7d" },
  );

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return { accessToken, refreshToken };
};

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export const signUp = async (req: Request, res: Response) => {
  const { userName, email, password } = req.body as {
    userName: string;
    email: string;
    password: string;
  };

  const existUser = await User.findOne({ email });
  if (existUser) {
    return res.status(400).json({ success: false, message: "Email already in use" });
  }

  let photoUrl: string | undefined;
  if (req.file) photoUrl = await uploadOnCloudinary(req.file.path);

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    userName,
    email,
    password: hashPassword,
    photoUrl,
  });

  const tokens = await issueTokens(user);
  return sendAuthResponse(res, user, tokens, "Account created successfully", 201);
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const matchPassword = await bcrypt.compare(password, user.password!);
  if (!matchPassword) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const tokens = await issueTokens(user);
  return sendAuthResponse(res, user, tokens, `Welcome back ${user.userName}`);
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response) => {
  let userId = req.id;
  if (!userId && req.cookies?.refreshToken) {
    try {
      const decoded = jwt.verify(
        req.cookies.refreshToken,
        env.REFRESH_SECRET || env.SECRET_KEY,
      ) as jwt.JwtPayload & { userId: string };
      userId = decoded.userId;
    } catch {
      // ignore expired / invalid refresh token
    }
  }

  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  res.clearCookie("token", accessCookieOptions);
  res.clearCookie("refreshToken", refreshCookieOptions);

  return res.status(200).json({ success: true, message: "Logout successful" });
};

// ─── Refresh Token ───────────────────────────────────────────────────────────

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const incomingRefreshToken: string | undefined = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token missing" });
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      env.REFRESH_SECRET || env.SECRET_KEY,
    ) as jwt.JwtPayload & { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshToken) {
      return res.status(401).json({ success: false, message: "Session expired" });
    }

    const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: nextRefreshToken } = await issueTokens(user);

    return res
      .cookie("token", accessToken, accessCookieOptions)
      .cookie("refreshToken", nextRefreshToken, refreshCookieOptions)
      .status(200)
      .json({ success: true, message: "Token refreshed" });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Refresh token is invalid or expired" });
  }
};

// ─── Google Auth ─────────────────────────────────────────────────────────────

export const googleAuth = async (req: Request, res: Response) => {
  const { userName, email, photoUrl } = req.body as {
    userName: string;
    email: string;
    photoUrl?: string;
  };

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ userName, email, photoUrl: photoUrl || "" });
  } else if (!user.photoUrl && photoUrl) {
    user.photoUrl = photoUrl;
    await user.save();
  }

  const tokens = await issueTokens(user);
  return sendAuthResponse(res, user, tokens, "Google sign-in successful");
};

// ─── Forgot Password — send OTP ──────────────────────────────────────────────

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "No account with that email" });

  const otp = generateOtp();
  user.resetOtp = hashValue(otp);
  user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  user.isoptverified = false;
  await user.save();

  await sendMail(user.email, otp, user.userName);

  return res.status(200).json({ success: true, message: "OTP sent to your email" });
};

// ─── Verify OTP ──────────────────────────────────────────────────────────────

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body as { email: string; otp: string };

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "No account with that email" });

  if (!user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one.",
    });
  }

  if (user.resetOtp !== hashValue(otp)) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  user.isoptverified = true;
  user.resetOtp = undefined;
  user.otpExpires = undefined;

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = hashValue(resetToken);
  user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  return res.status(200).json({ success: true, message: "OTP verified", resetToken });
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (req: Request, res: Response) => {
  const { resetToken, password } = req.body as { resetToken: string; password: string };

  const user = await User.findOne({
    resetPasswordToken: hashValue(resetToken),
    resetPasswordExpiry: { $gt: new Date() },
    isoptverified: true,
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Session expired or OTP not verified. Please start over.",
    });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  user.isoptverified = false;
  await user.save();

  return res.status(200).json({ success: true, message: "Password reset successfully" });
};
