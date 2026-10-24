import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import env from "./env.ts";

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.API_KEY,
  api_secret: env.API_SECRET,
});

/**
 * Upload a local file to Cloudinary and delete it from disk afterwards.
 * In test mode (NODE_ENV=test) no network call is made — a fake URL is
 * returned so route/integration tests stay hermetic.
 */
const uploadOnCloudinary = async (filePath: string): Promise<string | undefined> => {
  try {
    if (!filePath) return undefined;

    if (process.env.NODE_ENV === "test") {
      fs.unlinkSync(filePath);
      return `https://test-cloud.example/${path.basename(filePath)}`;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      timeout: 120000, // 2 minutes
    });
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    console.log(error);
    if (filePath) fs.unlinkSync(filePath);
    return undefined;
  }
};

export default uploadOnCloudinary;
