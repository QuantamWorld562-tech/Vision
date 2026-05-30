import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import Loader from "../components/Loader";

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

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${serverUrl}/api/v1/user/search?query=${encodeURIComponent(query)}`,
        );
        setResults(res.data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="mb-5">
        <p className="text-sm text-gray-500">
          {loading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""} for`}{" "}
          <span className="font-semibold text-gray-800">"{query}"</span>
        </p>
        {!loading && results.length > 0 && (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            AI-ranked by relevance
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader />
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <span className="material-symbols-outlined text-6xl">search_off</span>
          <p className="text-base font-medium">No results found</p>
          <p className="text-sm">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map((video) => (
            <div
              key={video._id}
              onClick={() => navigate(`/watch/${video._id}`)}
              className="flex gap-4 cursor-pointer group hover:bg-gray-50 rounded-xl p-2 transition-colors"
            >
              {/* Thumbnail */}
              <div
                className="relative shrink-0 rounded-xl overflow-hidden bg-gray-100"
                style={{ width: 240, aspectRatio: "16/9" }}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col justify-start min-w-0 pt-1">
                <p className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
                  {video.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatViews(video.views)} views · {timeAgo(video.createdAt)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {video.channel?.avatar ? (
                    <img src={video.channel.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                  )}
                  <p className="text-xs text-gray-600">{video.channel?.name}</p>
                </div>
                {video.description && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{video.description}</p>
                )}
                {/* Tags */}
                {video.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {video.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
