import express from "express";
import upload from "../middleware/multer.js";
import {
  googleAuth,
  login,
  logout,
  signUp,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/auth.Controller.js";
import {authLimiter,otpLimiter} from "../middleware/rateLimit.js"

const authRouter = express.Router();

authRouter.post("/signup",authLimiter , upload.single("photoUrl"), signUp);
authRouter.post("/login",authLimiter, login);
authRouter.get("/logout", logout);
authRouter.post("/googleauth", googleAuth);

// OTP-based password reset flow
authRouter.post("/forgot-password",otpLimiter, forgotPassword);   // step 1: send OTP
authRouter.post("/verify-otp", otpLimiter, verifyOtp);             // step 2: verify OTP → get resetToken
authRouter.post("/reset-password",otpLimiter, resetPassword);     // step 3: set new password

export default authRouter;
