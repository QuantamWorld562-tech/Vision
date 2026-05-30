import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

function SavedPlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/user/saved-playlists`, {
          withCredentials: true,
        });
        setPlaylists(res.data);
      } catch {
        toast.error("Failed to load saved playlists");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleUnsave = async (e, playlistId) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${serverUrl}/api/v1/user/save-playlist/${playlistId}`,
        {},
        { withCredentials: true },
      );
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
      toast.success("Removed from saved playlists");
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
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-purple-500 text-2xl">video_library</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Saved Playlists</h1>
          <p className="text-sm text-gray-500">{playlists.length} playlist{playlists.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <span className="material-symbols-outlined text-6xl">video_library</span>
          <p className="text-base font-medium">No saved playlists yet</p>
          <p className="text-sm">Save playlists to find them easily later</p>
          <button
            onClick={() => navigate("/")}
            className="mt-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Browse content
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => {
            const thumb = playlist.videos?.[0]?.thumbnail;
            return (
              <div
                key={playlist._id}
                className="flex flex-col gap-2 cursor-pointer group"
              >
                {/* Thumbnail stack */}
                <div
                  className="relative w-full rounded-xl overflow-hidden bg-gray-100"
                  style={{ aspectRatio: "16/9" }}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="material-symbols-outlined text-gray-400 text-4xl">video_library</span>
                    </div>
                  )}
                  {/* Video count badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-medium">
                    {playlist.videos?.length ?? 0} videos
                  </div>
                </div>

                {/* Info row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{playlist.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{playlist.channel?.name}</p>
                    <span className="text-xs text-gray-400 capitalize">{playlist.visibility}</span>
                  </div>
                  <button
                    onClick={(e) => handleUnsave(e, playlist._id)}
                    className="shrink-0 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    title="Remove from saved"
                  >
                    <span className="material-symbols-outlined text-gray-500 text-lg">bookmark_remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SavedPlaylists;
