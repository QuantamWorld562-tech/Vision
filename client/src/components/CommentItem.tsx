import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../constants";
import type { CommentData, CommentReplyData, UserData } from "../types";

interface CommentItemProps {
  comment: CommentData;
  currentUser: UserData | null;
  onDelete: (commentId: string) => void;
}

export default function CommentItem({
  comment,
  currentUser,
  onDelete,
}: CommentItemProps) {
  const [likesCount, setLikesCount] = useState(comment.likes?.length ?? 0);
  const [isLiked, setIsLiked] = useState(
    currentUser ? (comment.likes?.includes(currentUser._id) ?? false) : false,
  );
  const [replies, setReplies] = useState<CommentReplyData[]>(
    comment.replies ?? [],
  );
  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const isAuthor =
    currentUser &&
    (comment.author?._id === currentUser._id ||
      (typeof comment.author === "string" && comment.author === currentUser._id));

  const handleLike = async () => {
    if (!currentUser) return toast.error("Please login to like");
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/content/comment/${comment._id}/like`,
        {},
        { withCredentials: true },
      );
      setLikesCount(res.data.likes);
      setIsLiked(res.data.liked);
    } catch {
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      toast.error("Failed to like comment");
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;
    setReplySubmitting(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/content/comment/${comment._id}/reply`,
        { message: replyText },
        { withCredentials: true },
      );
      setReplies(res.data.replies ?? []);
      setReplyText("");
      setReplyOpen(false);
      setShowReplies(true);
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${serverUrl}/api/v1/content/comment/${comment._id}`,
        { withCredentials: true },
      );
      onDelete(comment._id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="flex gap-3 py-2.5">
      {/* User Avatar */}
      {comment.author?.photoUrl ? (
        <img
          src={comment.author.photoUrl}
          className="w-8 h-8 rounded-full object-cover shrink-0"
          alt=""
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-gray-500 text-base">
            account_circle
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Header: Username + Delete button */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-800">
            @{comment.author?.userName ?? "User"}
          </span>
          {isAuthor && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
              title="Delete comment"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}
        </div>

        {/* Message */}
        <p className="text-[13px] text-gray-700 mt-0.5 break-words">
          {comment.message}
        </p>

        {/* Actions: Like & Reply */}
        <div className="flex items-center gap-3 mt-1.5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs cursor-pointer ${
              isLiked ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${isLiked ? "fill" : ""}`}>
              thumb_up
            </span>
            {likesCount > 0 && <span>{likesCount}</span>}
          </button>

          {currentUser && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              Reply
            </button>
          )}
        </div>

        {/* Inline Reply Input */}
        {replyOpen && currentUser && (
          <form onSubmit={handleReplySubmit} className="flex gap-2 mt-2 items-center">
            <input
              type="text"
              autoFocus
              placeholder="Add a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 border-b border-gray-300 focus:border-gray-800 outline-none text-xs py-1 bg-transparent"
            />
            <button
              type="button"
              onClick={() => {
                setReplyOpen(false);
                setReplyText("");
              }}
              className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyText.trim() || replySubmitting}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full disabled:opacity-40 hover:bg-blue-700 cursor-pointer"
            >
              {replySubmitting ? "..." : "Reply"}
            </button>
          </form>
        )}

        {/* Replies Accordion */}
        {replies.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {showReplies ? "keyboard_arrow_up" : "keyboard_arrow_down"}
              </span>
              {showReplies ? "Hide replies" : `${replies.length} replies`}
            </button>

            {showReplies && (
              <div className="pl-3 border-l-2 border-gray-200 mt-2 space-y-2">
                {replies.map((rep, idx) => (
                  <div key={rep._id ?? idx} className="flex gap-2 items-start py-1">
                    {rep.author?.photoUrl ? (
                      <img
                        src={rep.author.photoUrl}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                        alt=""
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-gray-500 text-xs">
                          account_circle
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-gray-800 block">
                        @{rep.author?.userName ?? "User"}
                      </span>
                      <p className="text-[13px] text-gray-700 break-words">{rep.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
