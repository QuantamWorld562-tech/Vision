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

// Revenue is estimated — CPM-based calculation (industry avg ~$2 CPM)
const CPM = 2; // $2 per 1000 views

function StudioRevenue() {
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

  const totalRevenue = ((ov.totalViews ?? 0) / 1000) * CPM;
  const monthlyRevenue = monthly.map((m) => ({
    ...m,
    revenue: ((m.views / 1000) * CPM).toFixed(2),
  }));
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => parseFloat(m.revenue)), 1);

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
          <h1 className="text-2xl font-bold">Revenue</h1>
          <p className="text-sm text-gray-500">Estimated earnings based on views</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-700">
        <span className="material-symbols-outlined text-amber-500 text-base shrink-0 mt-0.5">info</span>
        <p>
          Revenue figures are <strong>estimates</strong> based on an average CPM of ${CPM}.
          Actual earnings depend on ad rates, geography, and monetisation eligibility.
        </p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <span className="material-symbols-outlined text-white/70 text-2xl">attach_money</span>
          <p className="text-3xl font-bold mt-1">${totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-white/80 mt-0.5">Estimated Total Revenue</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <span className="material-symbols-outlined text-blue-500 text-2xl">visibility</span>
          <p className="text-3xl font-bold mt-1 text-gray-900">{formatNum(ov.totalViews ?? 0)}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Views</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <span className="material-symbols-outlined text-purple-500 text-2xl">trending_up</span>
          <p className="text-3xl font-bold mt-1 text-gray-900">
            ${monthly.length > 0
              ? ((monthly[monthly.length - 1]?.views / 1000) * CPM).toFixed(2)
              : "0.00"}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">This Month (Est.)</p>
        </div>
      </div>

      {/* Monthly revenue chart */}
      {monthlyRevenue.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="text-base font-semibold mb-1">Monthly Revenue</h2>
          <p className="text-xs text-gray-400 mb-5">Estimated earnings per month</p>
          <div className="flex items-end gap-4 h-40">
            {monthlyRevenue.map((m, i) => {
              const pct = (parseFloat(m.revenue) / maxRevenue) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-gray-500 font-medium">${m.revenue}</span>
                  <div className="w-full relative flex items-end" style={{ height: 100 }}>
                    <div
                      className="w-full bg-linear-to-t from-green-500 to-emerald-300 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-video revenue */}
      {videos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-base font-semibold mb-4">Revenue by Video</h2>
          <div className="flex flex-col gap-3">
            {videos.slice(0, 10).map((v) => {
              const rev = ((v.views / 1000) * CPM).toFixed(2);
              const pct = (v.views / Math.max(videos[0]?.views, 1)) * 100;
              return (
                <div key={v._id} className="flex items-center gap-3">
                  <div className="w-12 h-7 rounded-md overflow-hidden bg-gray-100 shrink-0">
                    {v.thumbnail && (
                      <img src={v.thumbnail} className="w-full h-full object-cover" alt="" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 line-clamp-1">{v.title}</span>
                      <span className="font-semibold text-green-600 shrink-0 ml-2">${rev}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-green-400 to-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatNum(v.views)} views</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monetisation tips */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">lightbulb</span>
          Tips to Increase Revenue
        </h2>
        <ul className="flex flex-col gap-2 text-sm text-blue-700">
          {[
            "Post consistently — channels that upload weekly earn 3× more",
            "Use relevant tags to improve discoverability",
            "Longer videos (8+ min) allow mid-roll ads",
            "Engage with comments to boost algorithm ranking",
            "Create Shorts to drive traffic to long-form content",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-400 text-base shrink-0 mt-0.5">check_circle</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StudioRevenue;
