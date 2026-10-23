import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../constants";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import type { RootState } from "../redux/store";
import type { VideoData, CommentData, ApiError } from "../types";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
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

function formatViews(n?: number): string {
  if (n === undefined || n === null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useSelector((store: RootState) => store.user);

  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [recommended, setRecommended] = useState<VideoData[]>([]);
  const historyAdded = useRef(false);

  useEffect(() => {
    if (!id) return;
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/api/v1/content/video/${id}`);
        const v: VideoData = res.data;
        setVideo(v);
        setLikeCount(v.likes?.length ?? 0);
        setDislikeCount(v.dislikes?.length ?? 0);
        setSubCount(v.channel?.subscribes?.length ?? 0);

        if (userData) {
          const getId = (item?: { _id?: string } | string) =>
            typeof item === "object" && item !== null ? item._id : item;

          setLiked(v.likes?.some((l) => getId(l) === userData._id) ?? false);
          setSaved(v.saveBy?.some((s) => getId(s) === userData._id) ?? false);
          setSubscribed(v.channel?.subscribes?.some((s) => getId(s) === userData._id) ?? false);
        }

        const recRes = await axios.get(
          `${serverUrl}/api/v1/user/recommendations?videoId=${id}`,
        );
        setRecommended(recRes.data || []);
      } catch {
        toast.error("Video not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
    historyAdded.current = false;
  }, [id, userData, navigate]);

  useEffect(() => {
    if (!userData || !id || historyAdded.current) return;
    const timer = setTimeout(async () => {
      try {
        await axios.post(
          `${serverUrl}/api/v1/user/history/${id}`,
          {},
          { withCredentials: true },
        );
        historyAdded.current = true;
      } catch {
        // silently ignore
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, userData]);

  const handleLike = async () => {
    if (!userData || !id) { toast.error("Please login to like"); return; }
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/content/video/${id}/like`,
        {},
        { withCredentials: true },
      );
      setLikeCount(res.data.likes);
      setDislikeCount(res.data.dislikes);
      setLiked(res.data.liked);
    } catch { toast.error("Failed to like"); }
  };

  const handleDislike = async () => {
    if (!userData || !id) { toast.error("Please login"); return; }
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/content/video/${id}/dislike`,
        {},
        { withCredentials: true },
      );
      setLikeCount(res.data.likes);
      setDislikeCount(res.data.dislikes);
    } catch { toast.error("Failed"); }
  };

  const handleSubscribe = async () => {
    if (!userData || !video?.channel?._id) { toast.error("Please login to subscribe"); return; }
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/user/subscribe/${video.channel._id}`,
        {},
        { withCredentials: true },
      );
      setSubscribed(res.data.subscribed);
      setSubCount(res.data.subscriberCount);
      toast.success(res.data.subscribed ? "Subscribed!" : "Unsubscribed");
    } catch { toast.error("Failed to subscribe"); }
  };

  const handleSave = async () => {
    if (!userData || !id) { toast.error("Please login to save"); return; }
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/user/save-video/${id}`,
        {},
        { withCredentials: true },
      );
      setSaved(res.data.saved);
      toast.success(res.data.saved ? "Saved to library" : "Removed from saved");
    } catch { toast.error("Failed to save"); }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !id) { toast.error("Please login to comment"); return; }
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${serverUrl}/api/v1/content/video/${id}/comment`,
        { message: comment },
        { withCredentials: true },
      );
      setVideo((v) => (v ? { ...v, comments: [...(v.comments || []), res.data as CommentData] } : null));
      setComment("");
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <Loader />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 flex flex-col lg:flex-row gap-6">
      {/* ── Left — video + info ── */}
      <div className="flex-1 min-w-0">
        {/* Video player */}
        <div className="w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
          <video
            src={video.videoUrl}
            controls
            autoPlay
            className="w-full h-full"
          />
        </div>

        {/* Title */}
        <h1 className="text-lg font-semibold mt-3 leading-snug">{video.title}</h1>

        {/* Channel row + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <div className="flex items-center gap-3">
            {video.channel?.avatar ? (
              <img src={video.channel.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-500">account_circle</span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{video.channel?.name}</p>
              <p className="text-xs text-gray-500">{formatViews(subCount)} subscribers</p>
            </div>
            <button
              onClick={handleSubscribe}
              className={`ml-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                subscribed
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          {/* Like / dislike / save / share */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Segmented Like / Dislike pill */}
            <div className="flex items-center bg-gray-100 hover:bg-gray-200/70 rounded-full transition-colors overflow-hidden">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                  liked ? "text-red-600" : "text-gray-800 hover:bg-black/5"
                }`}
                title="I like this"
              >
                <span className={`material-symbols-outlined text-[20px] transition-transform ${liked ? "fill text-red-600 scale-110" : "text-gray-700"}`}>
                  thumb_up
                </span>
                <span>{formatViews(likeCount)}</span>
              </button>
              <div className="w-px h-5 bg-gray-300" />
              <button
                onClick={handleDislike}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-all active:scale-95 text-gray-800 hover:bg-black/5 cursor-pointer"
                title="I dislike this"
              >
                <span className="material-symbols-outlined text-[20px] text-gray-700">
                  thumb_down
                </span>
                {dislikeCount > 0 && <span className="text-xs text-gray-600">{formatViews(dislikeCount)}</span>}
              </button>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full bg-gray-100 hover:bg-gray-200/80 active:scale-95 text-gray-800 transition-all cursor-pointer"
              title="Share"
            >
              <span className="material-symbols-outlined text-[20px] text-gray-700">
                share
              </span>
              <span>Share</span>
            </button>

            {/* Save button */}
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full transition-all active:scale-95 cursor-pointer ${
                saved
                  ? "bg-blue-50 text-blue-600 ring-1 ring-blue-300"
                  : "bg-gray-100 hover:bg-gray-200/80 text-gray-800"
              }`}
              title="Save to library"
            >
              <span className={`material-symbols-outlined text-[20px] transition-transform ${saved ? "fill text-blue-600 scale-110" : "text-gray-700"}`}>
                bookmark
              </span>
              <span>{saved ? "Saved" : "Save"}</span>
            </button>

            <span className="text-xs text-gray-500 ml-auto font-medium">{formatViews(video.views)} views</span>
          </div>
        </div>

        {/* Description */}
        <div
          className="mt-3 bg-gray-100 rounded-xl p-3 cursor-pointer"
          onClick={() => setDescExpanded((p) => !p)}
        >
          <p className="text-xs text-gray-500 mb-1">{timeAgo(video.createdAt)}</p>
          <p className={`text-sm text-gray-700 whitespace-pre-wrap ${descExpanded ? "" : "line-clamp-3"}`}>
            {video.description || "No description"}
          </p>
          {((video.description?.length || 0) > 150) && (
            <p className="text-xs font-semibold mt-1">{descExpanded ? "Show less" : "...more"}</p>
          )}
        </div>

        {/* Tags */}
        {(video.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {video.tags?.map((tag, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments */}
        <div className="mt-6">
          <h3 className="text-base font-semibold mb-4">
            {video.comments?.length ?? 0} Comments
          </h3>

          <form onSubmit={handleComment} className="flex gap-3 mb-6">
            {userData?.photoUrl ? (
              <img src={userData.photoUrl} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-gray-500 text-lg">account_circle</span>
              </div>
            )}
            <div className="flex-1">
              <input
                type="text"
                placeholder={userData ? "Add a comment..." : "Login to comment"}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!userData}
                className="w-full border-b border-gray-300 focus:border-gray-800 outline-none text-sm py-1.5 bg-transparent transition-colors"
              />
              {comment && (
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setComment("")} className="text-sm px-3 py-1.5 rounded-full hover:bg-gray-100">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="text-sm px-4 py-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Posting..." : "Comment"}
                  </button>
                </div>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-4">
            {video.comments?.map((c) => (
              <div key={c._id} className="flex gap-3">
                {c.author?.photoUrl ? (
                  <img src={c.author.photoUrl} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-gray-500 text-base">account_circle</span>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    {c.author?.userName ?? "User"}
                    <span className="text-gray-400 font-normal ml-2">{timeAgo(c.createdAt)}</span>
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — recommended ── */}
      {recommended.length > 0 && (
        <div className="lg:w-80 xl:w-96 shrink-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-red-400 text-base">auto_awesome</span>
            Recommended
          </h3>
          <div className="flex flex-col gap-3">
            {recommended.map((rec) => (
              <div
                key={rec._id}
                onClick={() => navigate(`/watch/${rec._id}`)}
                className="flex gap-2 cursor-pointer group hover:bg-gray-50 rounded-xl p-1.5 transition-colors"
              >
                <div
                  className="relative shrink-0 rounded-lg overflow-hidden bg-gray-100"
                  style={{ width: 120, aspectRatio: "16/9" }}
                >
                  <img
                    src={rec.thumbnail}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {rec.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{rec.channel?.name}</p>
                  <p className="text-xs text-gray-400">{formatViews(rec.views)} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchPage;
