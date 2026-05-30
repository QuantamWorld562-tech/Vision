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

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/user/history`, {
          withCredentials: true,
        });
        setHistory(res.data);
      } catch {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleClear = async () => {
    if (!window.confirm("Clear all watch history?")) return;
    try {
      setClearing(true);
      await axios.delete(`${serverUrl}/api/v1/user/history`, { withCredentials: true });
      setHistory([]);
      toast.success("History cleared");
    } catch {
      toast.error("Failed to clear history");
    } finally {
      setClearing(false);
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-600 text-2xl">history</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Watch History</h1>
            <p className="text-sm text-gray-500">{history.length} video{history.length !== 1 ? "s" : ""} watched</p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">delete_sweep</span>
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <span className="material-symbols-outlined text-6xl">history</span>
          <p className="text-base font-medium">No watch history yet</p>
          <p className="text-sm">Videos you watch will appear here</p>
          <button
            onClick={() => navigate("/")}
            className="mt-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Browse videos
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((item) => {
            const video = item.video;
            if (!video) return null;
            return (
              <div
                key={item._id}
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
                  <p className="text-xs text-gray-400 mt-0.5">
                    Watched {timeAgo(item.watchedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
