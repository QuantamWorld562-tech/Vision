import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import Loader from "../components/Loader";
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

function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n?.toString() ?? "0";
}

function SavedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/user/saved-videos`, {
          withCredentials: true,
        });
        setVideos(res.data);
      } catch {
        toast.error("Failed to load saved videos");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleUnsave = async (e, videoId) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${serverUrl}/api/v1/user/save-video/${videoId}`,
        {},
        { withCredentials: true },
      );
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast.success("Removed from saved");
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-blue-500 text-2xl">bookmark</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Saved Videos</h1>
          <p className="text-sm text-gray-500">{videos.length} video{videos.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <span className="material-symbols-outlined text-6xl">bookmark_border</span>
          <p className="text-base font-medium">No saved videos yet</p>
          <p className="text-sm">Save videos to watch later</p>
          <button
            onClick={() => navigate("/")}
            className="mt-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Browse videos
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {videos.map((video) => (
            <div
              key={video._id}
              onClick={() => navigate(`/watch/${video._id}`)}
              className="flex gap-3 cursor-pointer group hover:bg-gray-50 rounded-xl p-2 transition-colors"
            >
              {/* Thumbnail */}
              <div
                className="relative shrink-0 rounded-xl overflow-hidden bg-gray-100"
                style={{ width: 168, aspectRatio: "16/9" }}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                  {video.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{video.channel?.name}</p>
                <p className="text-xs text-gray-400">
                  {formatViews(video.views)} views · {timeAgo(video.createdAt)}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => handleUnsave(e, video._id)}
                className="shrink-0 self-center p-2 hover:bg-gray-200 rounded-full transition-colors"
                title="Remove from saved"
              >
                <span className="material-symbols-outlined text-gray-500 text-xl">bookmark_remove</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedVideos;
