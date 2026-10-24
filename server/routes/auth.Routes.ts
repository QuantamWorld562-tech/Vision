import express from "express";
import upload from "../middleware/multer.ts";
import { optionalAuth } from "../middleware/isAuthenticated.ts";
import {
  googleAuth,
  login,
  logout,
  signUp,
  forgotPassword,
  verifyOtp,
  resetPassword,
  refreshTokenController,
} from "../controllers/auth.Controller.ts";
import { authLimiter, otpLimiter } from "../middleware/rateLimit.ts";
import { validate } from "../validators/validate.ts";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  googleAuthSchema,
} from "../validators/authValidators.ts";

const authRouter = express.Router();

authRouter.post("/signup", authLimiter, upload.single("photoUrl"), validate(signupSchema), signUp);
authRouter.post("/login", authLimiter, validate(loginSchema), login);
authRouter.post("/refresh-token", refreshTokenController);
authRouter.get("/logout", optionalAuth, logout);
authRouter.post("/googleauth", validate(googleAuthSchema), googleAuth);

// OTP-based password reset flow
authRouter.post("/forgot-password", otpLimiter, validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/verify-otp", otpLimiter, validate(verifyOtpSchema), verifyOtp);
authRouter.post("/reset-password", otpLimiter, validate(resetPasswordSchema), resetPassword);

export default authRouter;
