import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function PostCard({ post: initialPost }) {
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { userData } = useSelector((s) => s.user);

  const isLiked = userData && post.likes?.some(
    (l) => l === userData._id || l?._id === userData._id,
  );

  const handleLike = async () => {
    if (!userData) { toast.error("Please login to like"); return; }
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/content/post/${post._id}/like`,
        {},
        { withCredentials: true },
      );
      setPost((p) => ({
        ...p,
        likes: isLiked
          ? p.likes.filter((l) => (l?._id ?? l) !== userData._id)
          : [...p.likes, userData._id],
      }));
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!userData) { toast.error("Please login to comment"); return; }
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${serverUrl}/api/v1/content/post/${post._id}/comment`,
        { message: comment },
        { withCredentials: true },
      );
      setPost((p) => ({ ...p, comments: res.data }));
      setComment("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        {post.channel?.avatar ? (
          <img
            src={post.channel.avatar}
            className="w-10 h-10 rounded-full object-cover"
            alt={post.channel.name}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400">account_circle</span>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{post.channel?.name}</p>
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="px-4 pb-3">
          <img
            src={post.image}
            alt="Post"
            className="w-full rounded-xl object-cover max-h-96"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {isLiked ? "favorite" : "favorite_border"}
          </span>
          {post.likes?.length ?? 0}
        </button>

        <button
          onClick={() => setShowComments((p) => !p)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">comment</span>
          {post.comments?.length ?? 0}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Add comment */}
          <form onSubmit={handleComment} className="flex gap-2 mt-3 mb-4">
            {userData?.photoUrl ? (
              <img src={userData.photoUrl} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
            )}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder={userData ? "Add a comment..." : "Login to comment"}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!userData}
                className="flex-1 border-b border-gray-200 focus:border-gray-600 outline-none text-sm py-1 bg-transparent transition-colors"
              />
              {comment && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-xs px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  Post
                </button>
              )}
            </div>
          </form>

          {/* Comment list */}
          <div className="flex flex-col gap-3">
            {post.comments?.map((c) => (
              <div key={c._id} className="flex gap-2">
                {c.author?.photoUrl ? (
                  <img src={c.author.photoUrl} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
                )}
                <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                  <p className="text-xs font-semibold text-gray-700">
                    {c.author?.userName ?? "User"}
                    <span className="text-gray-400 font-normal ml-2">{timeAgo(c.createdAt)}</span>
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
