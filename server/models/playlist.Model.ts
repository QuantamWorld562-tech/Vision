import mongoose, { Document, Types } from "mongoose";

export interface IPlaylist extends Document {
  channel: Types.ObjectId;
  title: string;
  description: string;
  videos: Types.ObjectId[];
  visibility: "public" | "private" | "unlisted";
  saveBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new mongoose.Schema<IPlaylist>(
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
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    saveBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

export const Playlist = mongoose.model<IPlaylist>("Playlist", playlistSchema);
