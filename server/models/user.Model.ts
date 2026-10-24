import mongoose, { Document, Types } from "mongoose";

const historyItemSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    watchedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

export interface IHistoryItem extends Document {
  video: Types.ObjectId;
  watchedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    subscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    likedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    savedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    savedPlaylists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
    history: [historyItemSchema],
    refreshToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    resetOtp: { type: String },
    otpExpires: { type: Date },
    isoptverified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export interface IUser extends Document {
  userName: string;
  email: string;
  password?: string;
  photoUrl?: string;
  channel?: Types.ObjectId;
  subscriptions: Types.ObjectId[];
  likedVideos: Types.ObjectId[];
  savedVideos: Types.ObjectId[];
  savedPlaylists: Types.ObjectId[];
  history: IHistoryItem[];
  refreshToken: string | null;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  resetOtp?: string;
  otpExpires?: Date;
  isoptverified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const User = mongoose.model<IUser>("User", userSchema);
