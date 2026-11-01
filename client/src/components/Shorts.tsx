import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LuArrowUpRight, LuCircleUserRound, LuFilm, LuHeart, LuMessageCircle, LuPlay, LuVolume2, LuVolumeX } from "react-icons/lu";
import { serverUrl } from "../constants";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "./Loader";
import type { RootState } from "../redux/store";
import type { ShortData, UserData } from "../types";

function Shorts() {
  const [shorts, setShorts] = useState<ShortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { userData } = useSelector((store: RootState) => store.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/content/shorts`);
        setShorts(res.data || []);
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
    const items = containerRef.current.querySelectorAll<HTMLElement>("[data-short-item]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIndex(Number((entry.target as HTMLElement).dataset.index));
          }
        });
      },
      { threshold: 0.6 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [shorts]);

  const handleLike = async (shortId: string, index: number) => {
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
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-red-100/70 blur-3xl" aria-hidden="true" />
        <div className="surface-card relative z-10 flex w-full max-w-md flex-col items-center rounded-3xl px-8 py-12 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <LuFilm className="h-8 w-8" strokeWidth={1.8} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Shorts studio</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Your next moment starts here.</h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            Share quick ideas, behind-the-scenes clips, and stories with your audience.
          </p>
          <button
            onClick={() => navigate("/createshort")}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 hover:bg-red-600"
          >
            Upload your first Short
            <LuArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center overflow-y-scroll snap-y snap-mandatory h-[calc(100vh-4rem)] scrollbar-none bg-slate-950/5"
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

function ShortItem({
  short,
  index,
  isActive,
  onLike,
  userData,
}: {
  short: ShortData;
  index: number;
  isActive: boolean;
  onLike: () => void;
  userData: UserData | null;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
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
    } else {
      video.pause();
    }
  };

  const isLiked =
    userData &&
    short.likes?.some((l: string | { _id?: string }) => {
      const id = typeof l === "object" && l !== null ? l._id : l;
      return id === userData._id;
    });

  return (
    <div
      data-short-item
      data-index={index}
      className="relative w-full max-w-sm shrink-0 snap-start snap-always flex items-center justify-center"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* Video */}
      <div className="relative h-full w-full max-w-sm overflow-hidden rounded-3xl bg-black shadow-2xl shadow-slate-950/25 ring-1 ring-black/10">
        <video
          ref={videoRef}
          src={short.shortUrl}
          className="w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />

        {/* Play/pause overlay */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-full p-4">
              <LuPlay className="h-9 w-9 fill-white text-white" />
            </div>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            {short.channel?.avatar ? (
              <img src={short.channel.avatar} className="w-8 h-8 rounded-full object-cover border border-white" alt="" />
            ) : (
              <LuCircleUserRound className="h-7 w-7 text-white" />
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
              <LuHeart className={`h-6 w-6 ${isLiked ? "fill-white" : ""}`} />
            </div>
            <span className="text-white text-xs">{short.likes?.length ?? 0}</span>
          </button>

          {/* Comments */}
          <button className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-full bg-black/40">
              <LuMessageCircle className="h-6 w-6" />
            </div>
            <span className="text-white text-xs">{short.comments?.length ?? 0}</span>
          </button>

          {/* Mute toggle */}
          <button onClick={() => setMuted((m) => !m)} className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-full bg-black/40">
              {muted ? <LuVolumeX className="h-6 w-6" /> : <LuVolume2 className="h-6 w-6" />}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Shorts;
