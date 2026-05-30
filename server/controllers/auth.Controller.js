import { User } from "../models/user.Model.js";
import bcrypt from "bcrypt";
import uploadOnCloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";

/** Generate a 6-digit numeric OTP */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/** Hash an OTP/token with sha256 */
const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

/**
 * Cookie options — SameSite=None + Secure=true in production so the cookie
 * is sent cross-origin (Vercel frontend → Render backend).
 * In development both run on localhost so Strict is fine, but None works too.
 */
const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export const signUp = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    let photoUrl;
    if (req.file) photoUrl = await uploadOnCloudinary(req.file.path);

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      photoUrl,
    });

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    return res
      .cookie("token", token, cookieOptions)
      .status(201)
      .json({ success: true, message: "Account created successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const matchPassword = bcrypt.compareSync(password, user.password);
    if (!matchPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    return res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({ success: true, message: `Welcome back ${user.userName}` });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = async (_req, res) => {
  try {
    res.clearCookie("token", cookieOptions);
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── Google Auth ─────────────────────────────────────────────────────────────

export const googleAuth = async (req, res) => {
  try {
    const { userName, email, photoUrl } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ userName, email, photoUrl: photoUrl || "" });
    } else {
      if (!user.photoUrl && photoUrl) {
        user.photoUrl = photoUrl;
        await user.save();
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    return res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({ success: true, message: "Google sign-in successful", user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── Forgot Password — send OTP ──────────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "No account with that email" });

    const otp = generateOtp();
    user.resetOtp = hashValue(otp);
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.isoptverified = false;
    await user.save();

    await sendMail(user.email, otp, user.userName);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── Verify OTP ──────────────────────────────────────────────────────────────

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "No account with that email" });

    if (!user.otpExpires || user.otpExpires < Date.now()) {
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

    return res
      .status(200)
      .json({ success: true, message: "OTP verified", resetToken });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: hashValue(resetToken),
      resetPasswordExpiry: { $gt: Date.now() },
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

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
