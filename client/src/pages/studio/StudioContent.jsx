import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
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

function StudioContent() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/user/studio/analytics`, {
          withCredentials: true,
        });
        setAnalytics(res.data);
      } catch {
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (videoId) => {
    if (!window.confirm("Delete this video? This cannot be undone.")) return;
    try {
      setDeleting(videoId);
      await axios.delete(`${serverUrl}/api/v1/user/video/${videoId}`, {
        withCredentials: true,
      });
      setAnalytics((prev) => ({
        ...prev,
        videoPerformance: prev.videoPerformance.filter((v) => v._id !== videoId),
        overview: {
          ...prev.overview,
          totalVideos: (prev.overview.totalVideos ?? 1) - 1,
        },
      }));
      toast.success("Video deleted");
    } catch {
      toast.error("Failed to delete video");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  const videos = analytics?.videoPerformance ?? [];

  return (
    <div className="max-w-5xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/studio")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Content</h1>
            <p className="text-sm text-gray-500">Manage your videos and shorts</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/create")}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Upload
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {["videos", "shorts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Videos tab */}
      {activeTab === "videos" && (
        <>
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <span className="material-symbols-outlined text-6xl">videocam_off</span>
              <p className="text-base font-medium">No videos uploaded yet</p>
              <button
                onClick={() => navigate("/createvideo")}
                className="mt-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Upload your first video
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-3 py-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
                <span>Video</span>
                <span className="text-right">Views</span>
                <span className="text-right">Likes</span>
                <span className="text-right">Published</span>
                <span />
              </div>

              {videos.map((v) => (
                <div
                  key={v._id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center bg-white border border-gray-100 hover:border-gray-200 rounded-xl px-3 py-3 transition-colors"
                >
                  {/* Video info */}
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {v.thumbnail && (
                        <img src={v.thumbnail} className="w-full h-full object-cover" alt="" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{v.title}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 md:text-right">{formatNum(v.views)} views</p>
                  <p className="text-sm text-gray-600 md:text-right">{formatNum(v.likes)} likes</p>
                  <p className="text-sm text-gray-400 md:text-right">{timeAgo(v.createdAt)}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/studio/content/edit/${v._id}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-gray-500 text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
                      disabled={deleting === v._id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Shorts tab — placeholder pointing to shorts data */}
      {activeTab === "shorts" && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <span className="material-symbols-outlined text-6xl">slideshow</span>
          <p className="text-base font-medium">Shorts management coming soon</p>
          <button
            onClick={() => navigate("/createshort")}
            className="mt-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Upload a Short
          </button>
        </div>
      )}
    </div>
  );
}

export default StudioContent;
