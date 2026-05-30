import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../../App";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function formatNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n?.toString() ?? "0";
}

function StudioDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { channelData } = useSelector((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/user/studio/analytics`, {
          withCredentials: true,
        });
        setAnalytics(res.data);
      } catch {
        // no-op
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  const ov = analytics?.overview ?? {};
  const topVideos = analytics?.videoPerformance?.slice(0, 5) ?? [];
  const monthly = analytics?.monthlyData ?? [];

  return (
    <div className="max-w-5xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vision Studio</h1>
          <p className="text-sm text-gray-500">
            Welcome back, <span className="font-medium text-gray-700">{channelData?.name}</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/create")}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard icon="visibility" label="Total Views" value={formatNum(ov.totalViews ?? 0)} color="bg-blue-500" />
        <StatCard icon="thumb_up" label="Total Likes" value={formatNum(ov.totalLikes ?? 0)} color="bg-red-500" />
        <StatCard icon="comment" label="Comments" value={formatNum(ov.totalComments ?? 0)} color="bg-purple-500" />
        <StatCard icon="subscriptions" label="Subscribers" value={formatNum(ov.subscribers ?? 0)} color="bg-green-500" />
        <StatCard icon="videocam" label="Videos" value={ov.totalVideos ?? 0} color="bg-orange-500" />
        <StatCard icon="slideshow" label="Shorts" value={ov.totalShorts ?? 0} color="bg-pink-500" />
      </div>

      {/* Studio nav cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: "bar_chart", label: "Analytics", path: "/studio/analytics", color: "bg-blue-50 text-blue-600" },
          { icon: "attach_money", label: "Revenue", path: "/studio/revenue", color: "bg-green-50 text-green-600" },
          { icon: "video_library", label: "Content", path: "/studio/content", color: "bg-purple-50 text-purple-600" },
          { icon: "tune", label: "Customise", path: "/updatechannel", color: "bg-orange-50 text-orange-600" },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all ${item.color}`}
          >
            <span className="material-symbols-outlined text-3xl">{item.icon}</span>
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Monthly chart (simple bar) */}
      {monthly.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="text-base font-semibold mb-4">Views — Last 6 Months</h2>
          <div className="flex items-end gap-3 h-32">
            {monthly.map((m, i) => {
              const max = Math.max(...monthly.map((x) => x.views), 1);
              const pct = (m.views / max) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-gray-500">{formatNum(m.views)}</span>
                  <div
                    className="w-full bg-red-400 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(pct, 4)}%` }}
                  />
                  <span className="text-xs text-gray-400">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top videos */}
      {topVideos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Top Performing Videos</h2>
            <button
              onClick={() => navigate("/studio/content")}
              className="text-sm text-red-500 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {topVideos.map((v, i) => (
              <div key={v._id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-5 shrink-0">{i + 1}</span>
                <div
                  className="w-16 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0"
                >
                  {v.thumbnail && (
                    <img src={v.thumbnail} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{v.title}</p>
                  <p className="text-xs text-gray-400">{formatNum(v.views)} views · {v.likes} likes</p>
                </div>
                <button
                  onClick={() => navigate(`/studio/content/edit/${v._id}`)}
                  className="shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-500 text-lg">edit</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudioDashboard;
