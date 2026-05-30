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

const authRouter = express.Router();

authRouter.post("/signup", upload.single("photoUrl"), signUp);
authRouter.post("/login", login);
authRouter.get("/logout", logout);
authRouter.post("/googleauth", googleAuth);

// OTP-based password reset flow
authRouter.post("/forgot-password", forgotPassword);   // step 1: send OTP
authRouter.post("/verify-otp", verifyOtp);             // step 2: verify OTP → get resetToken
authRouter.post("/reset-password", resetPassword);     // step 3: set new password

export default authRouter;
