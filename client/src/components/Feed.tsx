import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import { LuCircleAlert, LuRefreshCw, LuSparkles } from "react-icons/lu";
import { serverUrl } from "../constants";
import PostCard from "./PostCard";
import VirtualizedVideoGrid from "./VirtualizedVideoGrid";
import type { VideoData, PostData } from "../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const PAGE_SIZE = 12;

interface OutletContextType {
  selectedCategory?: string;
  onCategoryChange?: (cat: string) => void;
}

// ── Video Card ────────────────────────────────────────────────────────────────

export function VideoCard({ video }: { video: VideoData }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col gap-2 cursor-pointer group rounded-2xl p-1.5 -m-1.5 transition-colors hover:bg-white/70"
      onClick={() => navigate(`/watch/${video._id}`)}
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-lg group-hover:shadow-indigo-950/10 transition-shadow"
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
  const ctx = useOutletContext<OutletContextType>() || {};
  const selectedCategory = ctx.selectedCategory || "All";
  const onCategoryChange = ctx.onCategoryChange;

  const [videos, setVideos] = useState<VideoData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [posts, setPosts] = useState<PostData[]>([]);
  const [recommended, setRecommended] = useState<VideoData[]>([]);
  const [activeTab, setActiveTab] = useState<"videos" | "posts">("videos");

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadCategoryVideos = useCallback(async (category: string) => {
    setInitialLoading(true);
    setError(null);
    setVideos([]);
    setCursor(null);
    setHasMore(true);

    try {
      const params = new URLSearchParams({
        category: category || "All",
        limit: PAGE_SIZE.toString(),
      });
      const res = await axios.get(
        `${serverUrl}/api/v1/user/category?${params.toString()}`
      );
      const { videos: newVideos, nextCursor, hasMore: more } = res.data || {};
      setVideos(newVideos || []);
      setCursor(nextCursor ?? null);
      setHasMore(Boolean(more));
    } catch {
      setError("Failed to load videos. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({
      category: selectedCategory || "All",
      limit: PAGE_SIZE.toString(),
    });

    axios
      .get(`${serverUrl}/api/v1/user/category?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        const { videos: newVideos, nextCursor, hasMore: more } = res.data || {};
        setVideos(newVideos || []);
        setCursor(nextCursor ?? null);
        setHasMore(Boolean(more));
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load videos. Please try again.");
      })
      .finally(() => {
        if (cancelled) return;
        setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  const loadMoreVideos = useCallback(async () => {
    if (loadingMore || !hasMore || initialLoading || !cursor) return;

    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategory || "All",
        limit: PAGE_SIZE.toString(),
        cursor,
      });

      const res = await axios.get(
        `${serverUrl}/api/v1/user/category?${params.toString()}`
      );

      const { videos: newVideos, nextCursor, hasMore: more } = res.data || {};
      setVideos((prev) => [...prev, ...(newVideos || [])]);
      setCursor(nextCursor ?? null);
      setHasMore(Boolean(more));
    } catch {
      setError("Failed to load more videos.");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, initialLoading, cursor, selectedCategory]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !initialLoading) {
          loadMoreVideos();
        }
      },
      {
        rootMargin: "200px",
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, initialLoading, loadMoreVideos]);

  useEffect(() => {
    axios.get(`${serverUrl}/api/v1/content/posts`)
      .then((res) => setPosts(res.data || []))
      .catch(() => {});

    axios.get(`${serverUrl}/api/v1/user/recommendations`)
      .then((res) => setRecommended((res.data || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  if (initialLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="relative flex min-h-[calc(100vh-12rem)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute h-72 w-72 rounded-full bg-red-100/60 blur-3xl" aria-hidden="true" />
        <div className="surface-card relative z-10 flex w-full max-w-lg flex-col items-center rounded-3xl px-8 py-10 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <LuCircleAlert className="h-7 w-7" />
          </div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <LuSparkles className="h-3.5 w-3.5 text-red-400" />
            Feed unavailable
          </p>
          <h1 className="text-xl font-black tracking-tight text-slate-900">We couldn’t load your feed.</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            The service may be waking up. Try again in a moment and your recommendations will be right here.
          </p>
          <button
            onClick={() => loadCategoryVideos(selectedCategory)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 hover:bg-red-600"
          >
            <LuRefreshCw className="h-4 w-4" />
            Try again
          </button>
          <p className="mt-4 text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-[1440px] mx-auto">
      <section className="feed-hero mb-7">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200 font-semibold mb-2">Your daily signal</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Discover something worth watching.</h1>
          <p className="text-sm text-white/70 mt-2 max-w-md">A calmer, smarter home for the videos and creators you care about.</p>
        </div>
        <div className="hero-orb" aria-hidden="true" />
      </section>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 border-b border-gray-200/80">
        {(["videos", "posts"] as const).map((tab) => (
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
              AI-filtered results for{" "}
              <span className="font-semibold text-gray-700">"{selectedCategory}"</span>
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
            <>
              <VirtualizedVideoGrid videos={videos} />

              {loadingMore && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <VideoCardSkeleton key={`skel-${i}`} />
                  ))}
                </div>
              )}

              <div ref={sentinelRef} className="h-4" aria-hidden="true" />

              {!hasMore && videos.length > 0 && (
                <p className="text-center text-xs text-gray-400 py-6">
                  You've reached the end
                </p>
              )}

              {error && videos.length > 0 && (
                <div className="flex flex-col items-center py-4 gap-2 text-gray-500">
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={loadMoreVideos}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </>
          )}

          {/* Recommended section */}
          {recommended.length > 0 && selectedCategory === "All" && !loadingMore && (
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
