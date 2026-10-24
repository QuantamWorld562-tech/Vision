import mongoose, { Document, Types } from "mongoose";

export interface IPost extends Document {
  channel: Types.ObjectId;
  content: string;
  image: string;
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new mongoose.Schema<IPost>(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

export const Post = mongoose.model<IPost>("Post", postSchema);
