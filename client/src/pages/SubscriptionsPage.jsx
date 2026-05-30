import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed"); // "feed" | "channels"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [subRes, videoRes] = await Promise.all([
          axios.get(`${serverUrl}/api/v1/user/subscriptions`, { withCredentials: true }),
          axios.get(`${serverUrl}/api/v1/content/videos`),
        ]);
        const subs = subRes.data;
        setSubscriptions(subs);

        // Filter videos from subscribed channels
        const subIds = subs.map((c) => c._id);
        const filtered = videoRes.data.filter((v) =>
          subIds.includes(v.channel?._id?.toString() || v.channel?.toString()),
        );
        setFeed(filtered);
      } catch {
        toast.error("Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleUnsubscribe = async (channelId) => {
    try {
      await axios.post(
        `${serverUrl}/api/v1/user/subscribe/${channelId}`,
        {},
        { withCredentials: true },
      );
      setSubscriptions((prev) => prev.filter((c) => c._id !== channelId));
      toast.success("Unsubscribed");
    } catch {
      toast.error("Failed to unsubscribe");
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
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 text-2xl">subscriptions</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-gray-500">{subscriptions.length} channel{subscriptions.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {["feed", "channels"].map((tab) => (
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

      {/* Feed tab */}
      {activeTab === "feed" && (
        <>
          {feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <span className="material-symbols-outlined text-6xl">subscriptions</span>
              <p className="text-base font-medium">
                {subscriptions.length === 0 ? "No subscriptions yet" : "No new videos from subscriptions"}
              </p>
              <p className="text-sm">Subscribe to channels to see their videos here</p>
              <button
                onClick={() => navigate("/")}
                className="mt-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Discover channels
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
              {feed.map((video) => (
                <VideoCard key={video._id} video={video} navigate={navigate} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Channels tab */}
      {activeTab === "channels" && (
        <>
          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <span className="material-symbols-outlined text-6xl">group</span>
              <p className="text-base font-medium">Not subscribed to any channels</p>
              <button
                onClick={() => navigate("/")}
                className="mt-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Discover channels
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {subscriptions.map((channel) => (
                <div
                  key={channel._id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  {channel.avatar ? (
                    <img
                      src={channel.avatar}
                      className="w-14 h-14 rounded-full object-cover shrink-0"
                      alt={channel.name}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-gray-400 text-2xl">account_circle</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{channel.name}</p>
                    <p className="text-sm text-gray-500">
                      {channel.subscribes?.length ?? 0} subscriber{channel.subscribes?.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-gray-400">
                      {channel.videos?.length ?? 0} video{channel.videos?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(channel._id)}
                    className="shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-full transition-colors"
                  >
                    Subscribed
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VideoCard({ video, navigate }) {
  const diff = Date.now() - new Date(video.createdAt).getTime();
  const days = Math.floor(diff / 86400000);
  const timeStr = days < 1 ? "today" : days < 7 ? `${days}d ago` : new Date(video.createdAt).toLocaleDateString();
  const views = video.views >= 1_000_000
    ? `${(video.views / 1_000_000).toFixed(1)}M`
    : video.views >= 1_000
    ? `${(video.views / 1_000).toFixed(1)}K`
    : video.views?.toString() ?? "0";

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
      <div className="flex gap-3">
        {video.channel?.avatar ? (
          <img src={video.channel.avatar} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        )}
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2">{video.title}</p>
          <p className="text-xs text-gray-500">{video.channel?.name}</p>
          <p className="text-xs text-gray-400">{views} views · {timeStr}</p>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionsPage;
