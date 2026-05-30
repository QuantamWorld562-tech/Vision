import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const { userData } = useSelector((store) => store.user);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/content/shorts`);
        setShorts(res.data);
      } catch {
        toast.error("Failed to load shorts");
      } finally {
        setLoading(false);
      }
    };
    fetchShorts();
  }, []);

  // Intersection observer to track which short is visible
  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll("[data-short-item]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIndex(Number(entry.target.dataset.index));
          }
        });
      },
      { threshold: 0.6 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [shorts]);

  const handleLike = async (shortId, index) => {
    if (!userData) { toast.error("Please login to like"); return; }
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/content/short/${shortId}/like`,
        {},
        { withCredentials: true },
      );
      setShorts((prev) =>
        prev.map((s, i) => (i === index ? { ...s, likes: Array(res.data.likes).fill(null) } : s)),
      );
    } catch {
      toast.error("Failed to like");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-3 text-gray-400">
        <span className="material-symbols-outlined text-6xl">slideshow</span>
        <p className="text-base font-medium">No shorts yet</p>
        <p className="text-sm">Upload the first short!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center overflow-y-scroll snap-y snap-mandatory h-[calc(100vh-56px)] scrollbar-none"
      style={{ scrollbarWidth: "none" }}
    >
      {shorts.map((short, index) => (
        <ShortItem
          key={short._id}
          short={short}
          index={index}
          isActive={activeIndex === index}
          onLike={() => handleLike(short._id, index)}
          userData={userData}
        />
      ))}
    </div>
  );
}

function ShortItem({ short, index, isActive, onLike, userData }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  // Play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const isLiked = userData && short.likes?.some((l) => l === userData._id || l?._id === userData._id);

  return (
    <div
      data-short-item
      data-index={index}
      className="relative w-full max-w-sm shrink-0 snap-start snap-always flex items-center justify-center"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* Video */}
      <div className="relative h-full w-full max-w-sm rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={short.shortUrl}
          className="w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          onClick={togglePlay}
        />

        {/* Play/pause overlay */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-full p-4">
              <span className="material-symbols-outlined text-white text-4xl">play_arrow</span>
            </div>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            {short.channel?.avatar ? (
              <img src={short.channel.avatar} className="w-8 h-8 rounded-full object-cover border border-white" alt="" />
            ) : (
              <span className="material-symbols-outlined text-white text-2xl">account_circle</span>
            )}
            <span className="text-white text-sm font-semibold">{short.channel?.name}</span>
          </div>
          <p className="text-white text-sm font-medium line-clamp-2">{short.title}</p>
          {short.description && (
            <p className="text-white/70 text-xs mt-1 line-clamp-2">{short.description}</p>
          )}
        </div>

        {/* Right action buttons */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
          {/* Like */}
          <button onClick={onLike} className="flex flex-col items-center gap-1">
            <div className={`p-2 rounded-full ${isLiked ? "bg-red-500" : "bg-black/40"}`}>
              <span className="material-symbols-outlined text-white text-2xl">
                {isLiked ? "favorite" : "favorite_border"}
              </span>
            </div>
            <span className="text-white text-xs">{short.likes?.length ?? 0}</span>
          </button>

          {/* Comments */}
          <button className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-full bg-black/40">
              <span className="material-symbols-outlined text-white text-2xl">comment</span>
            </div>
            <span className="text-white text-xs">{short.comments?.length ?? 0}</span>
          </button>

          {/* Mute toggle */}
          <button onClick={() => setMuted((m) => !m)} className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-full bg-black/40">
              <span className="material-symbols-outlined text-white text-2xl">
                {muted ? "volume_off" : "volume_up"}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Shorts;
