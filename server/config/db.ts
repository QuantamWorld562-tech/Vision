import mongoose from "mongoose";
import { ensureDatabaseIndexes } from "./indexes.ts";

// ── Native NoSQL Injection Protection ──────────────────────────
mongoose.set("sanitizeFilter", true);

const connectDb = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn("MONGO_URI is not set. Starting server without MongoDB connection.");
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDb connected successfully");

    await ensureDatabaseIndexes();

    return true;
  } catch (error) {
    console.error("MongoDB connection error:", (error as Error)?.message || error);
    return false;
  }
};

export default connectDb;
