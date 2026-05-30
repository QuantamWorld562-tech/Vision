import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import toast from "react-hot-toast";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n?.toString() ?? "0";
}

function ViewChannel() {
  const navigate = useNavigate();
  const { channelData } = useSelector((store) => store.user);
  const [activeTab, setActiveTab] = useState("videos");
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);

  const channelId = channelData?._id;

  useEffect(() => {
    if (!channelId) return;
    const fetchAll = async () => {
      setLoadingContent(true);
      try {
        const [vRes, sRes, pRes, postRes] = await Promise.all([
          axios.get(`${serverUrl}/api/v1/content/videos`),
          axios.get(`${serverUrl}/api/v1/content/shorts`),
          axios.get(`${serverUrl}/api/v1/content/playlists/${channelId}`),
          axios.get(`${serverUrl}/api/v1/content/posts/${channelId}`),
        ]);
        // Filter videos/shorts belonging to this channel
        setVideos(vRes.data.filter((v) => (v.channel?._id ?? v.channel) === channelId));
        setShorts(sRes.data.filter((s) => (s.channel?._id ?? s.channel) === channelId));
        setPlaylists(pRes.data);
        setPosts(postRes.data);
      } catch {
        // silently fail
      } finally {
        setLoadingContent(false);
      }
    };
    fetchAll();
  }, [channelId]);

  const tabs = [
    { key: "videos", label: "Videos", count: videos.length },
    { key: "shorts", label: "Shorts", count: shorts.length },
    { key: "playlists", label: "Playlists", count: playlists.length },
    { key: "community", label: "Community", count: posts.length },
  ];

  if (!channelData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <span className="material-symbols-outlined text-6xl">tv_off</span>
        <p className="text-base font-medium">No channel found</p>
        <button
          onClick={() => navigate("/createChannel")}
          className="mt-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Create Channel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Banner */}
      <div className="relative w-full h-36 md:h-48 rounded-2xl overflow-hidden bg-gray-200">
        {channelData.banner ? (
          <img src={channelData.banner} className="w-full h-full object-cover" alt="banner" />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-red-400 to-pink-500" />
        )}
      </div>

      {/* Channel info row */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 px-2 -mt-10 mb-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200 shrink-0">
          {channelData.avatar ? (
            <img src={channelData.avatar} className="w-full h-full object-cover" alt="avatar" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="material-symbols-outlined text-gray-500 text-3xl">account_circle</span>
            </div>
          )}
        </div>

        {/* Name + stats */}
        <div className="flex-1 min-w-0 mt-2 sm:mt-0">
          <h2 className="text-xl font-bold text-gray-900">{channelData.name}</h2>
          <p className="text-sm text-gray-500">
            {formatNum(channelData.subscribes?.length ?? 0)} subscribers ·{" "}
            {videos.length} video{videos.length !== 1 ? "s" : ""}
          </p>
          {channelData.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{channelData.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => navigate("/updatechannel")}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-lg">tune</span>
            Customise
          </button>
          <button
            onClick={() => navigate("/studio/content")}
            className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-lg">video_library</span>
            Manage
          </button>
          <button
            onClick={() => navigate("/studio")}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-lg">bar_chart</span>
            Studio
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5 px-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-2">
        {loadingContent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full rounded-xl bg-gray-200" style={{ aspectRatio: "16/9" }} />
                <div className="h-3 bg-gray-200 rounded mt-2 w-3/4" />
                <div className="h-3 bg-gray-200 rounded mt-1 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Videos tab */}
            {activeTab === "videos" && (
              <>
                {videos.length === 0 ? (
                  <EmptyState
                    icon="videocam_off"
                    message="No videos yet"
                    action="Upload Video"
                    onAction={() => navigate("/createvideo")}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                    {videos.map((v) => (
                      <VideoCard key={v._id} video={v} navigate={navigate} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Shorts tab */}
            {activeTab === "shorts" && (
              <>
                {shorts.length === 0 ? (
                  <EmptyState
                    icon="slideshow"
                    message="No shorts yet"
                    action="Upload Short"
                    onAction={() => navigate("/createshort")}
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {shorts.map((s) => (
                      <ShortCard key={s._id} short={s} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Playlists tab */}
            {activeTab === "playlists" && (
              <>
                {playlists.length === 0 ? (
                  <EmptyState
                    icon="video_library"
                    message="No playlists yet"
                    action="Create Playlist"
                    onAction={() => navigate("/createplaylist")}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.map((pl) => (
                      <PlaylistCard key={pl._id} playlist={pl} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Community tab */}
            {activeTab === "community" && (
              <>
                {posts.length === 0 ? (
                  <EmptyState
                    icon="edit_note"
                    message="No community posts yet"
                    action="Create Post"
                    onAction={() => navigate("/createpost")}
                  />
                ) : (
                  <div className="max-w-2xl flex flex-col gap-4">
                    {posts.map((post) => (
                      <PostItem key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Create CTA at bottom */}
      <div className="flex justify-center mt-10 mb-4">
        <button
          onClick={() => navigate("/create")}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-semibold transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Create Content
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState({ icon, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
      <span className="material-symbols-outlined text-6xl">{icon}</span>
      <p className="text-base font-medium">{message}</p>
      <button
        onClick={onAction}
        className="mt-1 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
      >
        {action}
      </button>
    </div>
  );
}

function VideoCard({ video, navigate }) {
  return (
    <div
      className="flex flex-col gap-2 cursor-pointer group"
      onClick={() => navigate(`/watch/${video._id}`)}
    >
      <div className="relative w-full rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 line-clamp-2">{video.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {video.views >= 1000 ? `${(video.views / 1000).toFixed(1)}K` : video.views} views · {timeAgo(video.createdAt)}
        </p>
      </div>
    </div>
  );
}

function ShortCard({ short }) {
  return (
    <div className="flex flex-col gap-1 cursor-pointer group">
      <div
        className="relative w-full rounded-xl overflow-hidden bg-gray-100"
        style={{ aspectRatio: "9/16" }}
      >
        <video
          src={short.shortUrl}
          className="w-full h-full object-cover"
          muted
          loop
          onMouseEnter={(e) => e.target.play()}
          onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
        />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-xs font-medium line-clamp-2 drop-shadow">{short.title}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400">{short.views ?? 0} views</p>
    </div>
  );
}

function PlaylistCard({ playlist }) {
  const thumb = playlist.videos?.[0]?.thumbnail;
  return (
    <div className="flex flex-col gap-2 cursor-pointer group">
      <div className="relative w-full rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
        {thumb ? (
          <img
            src={thumb}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={playlist.title}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="material-symbols-outlined text-gray-400 text-4xl">video_library</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-medium">
          {playlist.videos?.length ?? 0} videos
        </div>
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
            playlist.visibility === "public" ? "bg-green-500/80 text-white" :
            playlist.visibility === "private" ? "bg-gray-700/80 text-white" :
            "bg-yellow-500/80 text-white"
          }`}>
            {playlist.visibility}
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{playlist.title}</p>
        {playlist.description && (
          <p className="text-xs text-gray-400 line-clamp-1">{playlist.description}</p>
        )}
      </div>
    </div>
  );
}

function PostItem({ post }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-4">{post.content}</p>
      {post.image && (
        <img src={post.image} className="mt-3 w-full rounded-xl object-cover max-h-60" alt="post" />
      )}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">favorite</span>
          {post.likes?.length ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">comment</span>
          {post.comments?.length ?? 0}
        </span>
        <span className="ml-auto">{timeAgo(post.createdAt)}</span>
      </div>
    </div>
  );
}

export default ViewChannel;
