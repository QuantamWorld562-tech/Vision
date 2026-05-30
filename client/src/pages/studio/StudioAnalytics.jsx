import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";

function formatNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n?.toString() ?? "0";
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function StudioAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const monthly = analytics?.monthlyData ?? [];
  const videos = analytics?.videoPerformance ?? [];

  const maxViews = Math.max(...monthly.map((m) => m.views), 1);

  return (
    <div className="max-w-5xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/studio")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-gray-500">Channel performance overview</p>
        </div>
      </div>

      {/* Overview grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Views", value: formatNum(ov.totalViews ?? 0), icon: "visibility", bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Subscribers", value: formatNum(ov.subscribers ?? 0), icon: "group", bg: "bg-green-50", text: "text-green-600" },
          { label: "Total Likes", value: formatNum(ov.totalLikes ?? 0), icon: "thumb_up", bg: "bg-red-50", text: "text-red-500" },
          { label: "Comments", value: formatNum(ov.totalComments ?? 0), icon: "comment", bg: "bg-purple-50", text: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <span className={`material-symbols-outlined ${s.text} text-2xl`}>{s.icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly views bar chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h2 className="text-base font-semibold mb-1">Monthly Views</h2>
        <p className="text-xs text-gray-400 mb-5">Last 6 months</p>
        <div className="flex items-end gap-4 h-40">
          {monthly.map((m, i) => {
            const pct = (m.views / maxViews) * 100;
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs text-gray-500 font-medium">{formatNum(m.views)}</span>
                <div className="w-full relative flex items-end" style={{ height: 100 }}>
                  <div
                    className="w-full bg-linear-to-t from-red-500 to-red-300 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(pct, 3)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{m.label}</span>
                <span className="text-xs text-gray-300">{m.uploads} upload{m.uploads !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engagement breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-base font-semibold mb-4">Content Breakdown</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: "Videos", count: ov.totalVideos ?? 0, icon: "videocam", color: "bg-blue-500" },
              { label: "Shorts", count: ov.totalShorts ?? 0, icon: "slideshow", color: "bg-pink-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-white text-sm">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{
                        width: `${((item.count / Math.max((ov.totalVideos ?? 0) + (ov.totalShorts ?? 0), 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-base font-semibold mb-4">Engagement Rate</h2>
          <div className="flex flex-col gap-3">
            {[
              {
                label: "Like Rate",
                value: ov.totalViews
                  ? `${((ov.totalLikes / ov.totalViews) * 100).toFixed(1)}%`
                  : "0%",
                icon: "thumb_up",
                color: "text-red-500",
              },
              {
                label: "Comment Rate",
                value: ov.totalViews
                  ? `${((ov.totalComments / ov.totalViews) * 100).toFixed(2)}%`
                  : "0%",
                icon: "comment",
                color: "text-purple-500",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${item.color} text-xl`}>{item.icon}</span>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All videos performance table */}
      {videos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-base font-semibold mb-4">Video Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Video</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Views</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Likes</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Comments</th>
                  <th className="text-right py-2 pl-3 text-gray-500 font-medium">Published</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-7 rounded-md overflow-hidden bg-gray-100 shrink-0">
                          {v.thumbnail && (
                            <img src={v.thumbnail} className="w-full h-full object-cover" alt="" />
                          )}
                        </div>
                        <span className="line-clamp-1 text-gray-800">{v.title}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3 font-medium">{formatNum(v.views)}</td>
                    <td className="text-right py-3 px-3 text-gray-600">{formatNum(v.likes)}</td>
                    <td className="text-right py-3 px-3 text-gray-600">{formatNum(v.comments)}</td>
                    <td className="text-right py-3 pl-3 text-gray-400">{timeAgo(v.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudioAnalytics;
