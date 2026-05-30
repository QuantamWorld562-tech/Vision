import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import { serverUrl } from "../App";
import PostCard from "./PostCard";

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

function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n?.toString() ?? "0";
}

const CATEGORIES = [
  "All", "Music", "Gaming", "Movies", "TV Shows", "News",
  "Trending", "Entertainment", "Education", "Science", "Travel", "Arts",
];

// ── Video Card ────────────────────────────────────────────────────────────────
function VideoCard({ video }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col gap-2 cursor-pointer group"
      onClick={() => navigate(`/watch/${video._id}`)}
    >
      <div
        className="relative w-full rounded-xl overflow-hidden bg-gray-100"
        style={{ aspectRatio: "16/9" }}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">
          {video.channel?.avatar ? (
            <img
              src={video.channel.avatar}
              alt={video.channel?.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-500 text-lg">account_circle</span>
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{video.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{video.channel?.name}</p>
          <p className="text-xs text-gray-500">
            {formatViews(video.views)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="w-full rounded-xl bg-gray-200" style={{ aspectRatio: "16/9" }} />
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3.5 bg-gray-200 rounded w-4/5" />
          <div className="h-3 bg-gray-200 rounded w-2/5" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ── Main Feed ─────────────────────────────────────────────────────────────────
function Feed() {
  // Get category state from Home via Outlet context
  const ctx = useOutletContext() || {};
  const selectedCategory = ctx.selectedCategory || "All";
  const onCategoryChange = ctx.onCategoryChange;
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("videos"); // "videos" | "posts"

  // Fetch videos by category (AI category filter)
  const fetchVideos = useCallback(async (category) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${serverUrl}/api/v1/user/category?category=${encodeURIComponent(category || "All")}`,
      );
      setVideos(res.data);
    } catch {
      setError("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch community posts
  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/content/posts`);
      setPosts(res.data);
    } catch {
      // silently fail
    }
  }, []);

  // Fetch recommendations (popular videos)
  const fetchRecommended = useCallback(async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/user/recommendations`);
      setRecommended(res.data.slice(0, 4));
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchVideos(selectedCategory || "All");
    fetchPosts();
    fetchRecommended();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <span className="material-symbols-outlined text-5xl">error_outline</span>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => fetchVideos(selectedCategory || "All")}
          className="text-sm text-red-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 border-b border-gray-100">
        {["videos", "posts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab === "videos" ? "Videos" : "Community"}
          </button>
        ))}
      </div>

      {/* Videos tab */}
      {activeTab === "videos" && (
        <>
          {/* AI category label */}
          {selectedCategory && selectedCategory !== "All" && (
            <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-500">
              <span className="material-symbols-outlined text-sm text-red-400">auto_awesome</span>
              AI-filtered results for <span className="font-semibold text-gray-700">"{selectedCategory}"</span>
              <button
                onClick={() => onCategoryChange?.("All")}
                className="ml-1 text-red-500 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <span className="material-symbols-outlined text-6xl">videocam_off</span>
              <p className="text-base font-medium">No videos found</p>
              <p className="text-sm">
                {selectedCategory !== "All"
                  ? `No videos in "${selectedCategory}" yet`
                  : "Be the first to upload a video!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}

          {/* Recommended section */}
          {recommended.length > 0 && selectedCategory === "All" && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-red-400">auto_awesome</span>
                <h2 className="text-base font-semibold text-gray-800">Recommended for you</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
                {recommended.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Community posts tab */}
      {activeTab === "posts" && (
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <span className="material-symbols-outlined text-6xl">edit_note</span>
              <p className="text-base font-medium">No community posts yet</p>
              <p className="text-sm">Create a channel and post updates for your audience</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
}

export default Feed;
