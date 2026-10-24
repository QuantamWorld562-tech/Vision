import { z } from "zod";

export const emailSchema = z.string().trim().email("Invalid email format");
export const passwordSchema = z.string().min(6, "Password must be at least 6 characters long");
export const usernameSchema = z
  .string()
  .trim()
  .min(2, "userName must be at least 2 characters")
  .max(50, "userName cannot exceed 50 characters");
export const resetTokenSchema = z
  .string()
  .trim()
  .min(10, "resetToken must be at least 10 characters")
  .max(200, "resetToken cannot exceed 200 characters");

export const signupSchema = z.object({
  userName: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().trim().length(6, "OTP must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  resetToken: resetTokenSchema,
  password: passwordSchema,
});

export const googleAuthSchema = z.object({
  email: emailSchema,
  userName: z.string().trim().min(1, "Username is required"),
  photoUrl: z.string().optional(),
});
