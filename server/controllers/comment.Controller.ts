import { Comment } from "../models/comment.Model.ts";
import type { ContentType } from "../models/comment.Model.ts";
import type { Request, Response } from "express";
import { Types } from "mongoose";

const POPULATE_AUTHOR = { path: "author", select: "userName photoUrl" };
const POPULATE_REPLY_AUTHOR = { path: "replies.author", select: "userName photoUrl" };

/**
 * GET comments for a content document with cursor-based pagination.
 */
export const getCommentsForContent =
  (contentType: ContentType) =>
  async (req: Request, res: Response) => {
    const contentId = req.params.contentId as string;
    const { cursor, limit } = req.query;
    const pageSize = Math.min(parseInt(limit as string, 10) || 20, 50);

    const query: Record<string, unknown> = {
      contentType,
      contentId: new Types.ObjectId(contentId),
      isDeleted: false,
    };
    if (cursor) query._id = { $lt: new Types.ObjectId(cursor as string) };

    const comments = await Comment.find(query)
      .sort({ _id: -1 })
      .limit(pageSize + 1)
      .populate(POPULATE_AUTHOR)
      .populate(POPULATE_REPLY_AUTHOR);

    const hasMore = comments.length > pageSize;
    const results = hasMore ? comments.slice(0, pageSize) : comments;
    const nextCursor = hasMore ? String(results[results.length - 1]._id) : null;

    return res.status(200).json({ comments: results, nextCursor, hasMore });
  };

/** POST a new top-level comment on a content document. */
export const addCommentForContent =
  (contentType: ContentType) =>
  async (req: Request, res: Response) => {
    const contentId = req.params.contentId as string;
    const { message } = req.body as { message: string };
    const userId = req.id!;

    const comment = await Comment.create({
      contentType,
      contentId: new Types.ObjectId(contentId),
      author: new Types.ObjectId(userId),
      message,
    });

    const populated = await Comment.findById(comment._id).populate(POPULATE_AUTHOR);

    return res.status(201).json(populated);
  };

/** POST a nested reply on an existing comment. */
export const addReplyToComment = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const { message } = req.body as { message: string };
  const userId = req.id!;

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $push: {
        replies: {
          author: new Types.ObjectId(userId),
          message,
          parentComment: new Types.ObjectId(commentId),
        },
      },
    },
    { new: true },
  )
    .populate(POPULATE_AUTHOR)
    .populate(POPULATE_REPLY_AUTHOR);

  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  return res.status(201).json(comment);
};

/** POST toggle a like on a comment. */
export const toggleCommentLike = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.id!;

  const comment = await Comment.findById(commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  const alreadyLiked = comment.likes.some((id) => id.toString() === userId);
  if (alreadyLiked) {
    comment.likes = comment.likes.filter((id) => id.toString() !== userId) as typeof comment.likes;
  } else {
    comment.likes.push(new Types.ObjectId(userId));
  }
  await comment.save();

  return res.status(200).json({ likes: comment.likes.length, liked: !alreadyLiked });
};

/** DELETE soft-delete a comment. */
export const deleteComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.id!;

  const comment = await Comment.findById(commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  if (String(comment.author) !== userId) {
    return res.status(403).json({ message: "Not authorized to delete this comment" });
  }

  comment.isDeleted = true;
  comment.message = "[deleted]";
  await comment.save();

  return res.status(200).json({ message: "Comment deleted" });
};
