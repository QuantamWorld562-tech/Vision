import mongoose, { Document, Types } from "mongoose";

export interface ICommentReply extends Document {
  author: Types.ObjectId;
  message: string;
  parentComment?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true },
);

export type ContentType = "Video" | "Short" | "Post";

export interface IComment extends Document {
  contentType: ContentType;
  contentId: Types.ObjectId;
  author: Types.ObjectId;
  message: string;
  replies: ICommentReply[];
  likes: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>(
  {
    contentType: {
      type: String,
      enum: ["Video", "Short", "Post"],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    replies: [replySchema],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

commentSchema.index({ contentType: 1, contentId: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
export default Comment;
