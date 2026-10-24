import mongoose, { Document, Types } from "mongoose";

export interface IChannel extends Document {
  owner: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  banner?: string;
  avatar: string;
  subscribes: Types.ObjectId[];
  videos: Types.ObjectId[];
  shorts: Types.ObjectId[];
  playlists: Types.ObjectId[];
  communityPosts: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new mongoose.Schema<IChannel>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
    },
    avatar: {
      type: String,
      default: "",
    },
    subscribes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    shorts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Short",
      },
    ],
    playlists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
    communityPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true },
);

export const Channel = mongoose.model<IChannel>("Channel", channelSchema);
