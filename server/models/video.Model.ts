import mongoose, { Document, Types } from "mongoose";

export interface IVideo extends Document {
  channel: Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  tags: string[];
  views: number;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  saveBy: Types.ObjectId[];
  processingStatus: "pending" | "processing" | "ready" | "failed";
  hlsManifestUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new mongoose.Schema<IVideo>(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    tags: [{ type: String }],
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    saveBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "ready",
    },
    hlsManifestUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export const Video = mongoose.model<IVideo>("Video", videoSchema);
