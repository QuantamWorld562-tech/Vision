import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env" });

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGO_URI: z.string().optional(),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  SECRET_KEY: z.string().min(1, "SECRET_KEY is required"),
  REFRESH_SECRET: z.string().default("vision-refresh-secret-key-prod-default"),
  CLOUD_NAME: z.string().optional(),
  API_KEY: z.string().optional(),
  API_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parseEnv = () => {
  const normalizedEnv = {
    ...process.env,
    MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI,
    CLOUD_NAME: process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.API_KEY || process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
    EMAIL_USER: process.env.EMAIL_USER || process.env.SMTP_USER,
    EMAIL_PASS: process.env.EMAIL_PASS || process.env.SMTP_PASS,
    SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER,
    SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  };

  const result = envSchema.safeParse(normalizedEnv);
  if (!result.success) {
    console.warn("⚠️ Environment warning: Some variables may not be configured:");
    console.warn(result.error.format());
  }
  return result.success ? result.data : (normalizedEnv as unknown as z.infer<typeof envSchema>);
};

export const env = parseEnv();
export default env;
