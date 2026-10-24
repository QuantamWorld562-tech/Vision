import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../constants";
import CommentItem from "./CommentItem";
import type { CommentData, UserData, ApiError } from "../types";

type SortMode = "newest" | "top";

function sortComments(comments: CommentData[], mode: SortMode): CommentData[] {
  const arr = [...comments];
  if (mode === "top") {
    arr.sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0));
  } else {
    arr.sort((a, b) => (b._id > a._id ? 1 : -1));
  }
  return arr;
}

interface CommentSectionProps {
  videoId: string;
  currentUser: UserData | null;
}

export default function CommentSection({
  videoId,
  currentUser,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(
    async (cursor?: string | null) => {
      if (!cursor) return;
      setLoadingMore(true);
      try {
        const params = new URLSearchParams({ limit: "20", cursor });
        const res = await axios.get(
          `${serverUrl}/api/v1/content/video/${videoId}/comments?${params.toString()}`,
        );

        const fetched: CommentData[] = res.data.comments ?? [];
        setComments((prev) => [...prev, ...fetched]);
        setNextCursor(res.data.nextCursor ?? null);
        setHasMore(res.data.hasMore ?? false);
      } catch {
        toast.error("Failed to load comments");
      } finally {
        setLoadingMore(false);
      }
    },
    [videoId],
  );

  useEffect(() => {
    let ignore = false;
    const loadInitialComments = async () => {
      try {
        const params = new URLSearchParams({ limit: "20" });
        const res = await axios.get(
          `${serverUrl}/api/v1/content/video/${videoId}/comments?${params.toString()}`,
        );
        if (!ignore) {
          setComments(res.data.comments ?? []);
          setNextCursor(res.data.nextCursor ?? null);
          setHasMore(res.data.hasMore ?? false);
        }
      } catch {
        if (!ignore) toast.error("Failed to load comments");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadInitialComments();
    return () => {
      ignore = true;
    };
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return toast.error("Please login to comment");
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/content/video/${videoId}/comment`,
        { message: commentText },
        { withCredentials: true },
      );
      setComments((prev) => [res.data as CommentData, ...prev]);
      setCommentText("");
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const sortedComments = sortComments(comments, sortMode);

  return (
    <div className="mt-6">
      {/* Header: Count + Simple Sort Selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">{comments.length} Comments</h3>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          aria-label="Sort comments"
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-2.5 rounded-lg border-0 outline-none cursor-pointer"
        >
          <option value="top">Top comments</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        {currentUser?.photoUrl ? (
          <img
            src={currentUser.photoUrl}
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
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder={currentUser ? "Add a comment..." : "Login to comment"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!currentUser}
            className="flex-1 border-b border-gray-300 focus:border-gray-800 outline-none text-sm py-1 bg-transparent"
          />
          {commentText.trim() && (
            <button
              type="submit"
              disabled={submitting}
              className="text-xs px-4 py-1.5 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "..." : "Comment"}
            </button>
          )}
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <p className="text-xs text-gray-400 py-4">Loading comments...</p>
      ) : sortedComments.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">No comments yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {sortedComments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              currentUser={currentUser}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => fetchComments(nextCursor)}
            disabled={loadingMore}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 py-2 px-4 cursor-pointer"
          >
            {loadingMore ? "Loading..." : "Show more comments"}
          </button>
        </div>
      )}
    </div>
  );
}
