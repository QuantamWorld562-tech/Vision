import test from "node:test";
import assert from "node:assert/strict";
import {
  signupSchema,
  loginSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validators/authValidators.ts";

test("signup validation rejects missing username and bad email", () => {
  const parsed = signupSchema.safeParse({
    userName: "A",
    email: "bad-email",
    password: "123",
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.equal(errors.userName?.[0], "userName must be at least 2 characters");
    assert.equal(errors.email?.[0], "Invalid email format");
    assert.equal(errors.password?.[0], "Password must be at least 6 characters long");
  }
});

test("login validation rejects invalid credentials shape", () => {
  const parsed = loginSchema.safeParse({
    email: "user@example.com",
    password: "123",
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.equal(errors.password?.[0], "Password must be at least 6 characters long");
  }
});

test("reset password validation requires a valid token and strong password", () => {
  const parsed = resetPasswordSchema.safeParse({
    resetToken: "short",
    password: "123",
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.equal(errors.resetToken?.[0], "resetToken must be at least 10 characters");
    assert.equal(errors.password?.[0], "Password must be at least 6 characters long");
  }
});

test("valid signup payload passes validation", () => {
  const parsed = signupSchema.safeParse({
    userName: "Kunal",
    email: "kunal@example.com",
    password: "strongpass123",
  });

  assert.equal(parsed.success, true);
});

test("signup schema safeParse validates properly", () => {
  const valid = signupSchema.safeParse({
    userName: "VisionCreator",
    email: "creator@vision.io",
    password: "securepassword123",
  });
  assert.equal(valid.success, true);

  const invalid = signupSchema.safeParse({
    userName: "",
    email: "not-an-email",
    password: "1",
  });
  assert.equal(invalid.success, false);
});

test("verify OTP schema enforces 6-digit length", () => {
  const validOtp = verifyOtpSchema.safeParse({
    email: "user@example.com",
    otp: "123456",
  });
  assert.equal(validOtp.success, true);

  const invalidOtp = verifyOtpSchema.safeParse({
    email: "user@example.com",
    otp: "123",
  });
  assert.equal(invalidOtp.success, false);
});
