import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, //10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: true,
  message: { message: "Too many attempts. Please try again in 15 minutes. " },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: " Too many otp requests Please wait before retrying. " },
});

export { authLimiter, otpLimiter };
