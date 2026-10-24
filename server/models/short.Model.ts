import mongoose, { Document, Types } from "mongoose";

export interface IShort extends Document {
  channel: Types.ObjectId;
  title: string;
  description: string;
  shortUrl: string;
  tags: string[];
  views: number;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  saveBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const shortSchema = new mongoose.Schema<IShort>(
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
    shortUrl: {
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
  },
  { timestamps: true },
);

export const Short = mongoose.model<IShort>("Short", shortSchema);
