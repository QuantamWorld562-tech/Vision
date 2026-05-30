import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";
import Loader from "./Loader";

function CreatePlaylist() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);

  const { channelData } = useSelector((store) => store.user);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!title.trim()) { toast.error("Playlist title is required"); return; }
    if (!channelData?._id) { toast.error("You need a channel to create a playlist"); return; }

    try {
      setLoading(true);
      await axios.post(
        `${serverUrl}/api/v1/content/create-playlist`,
        { title, description, visibility, channelId: channelData._id },
        { withCredentials: true },
      );
      toast.success("Playlist created!");
      navigate("/viewChannel");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-4">
          <Loader />
          <p className="text-gray-500 text-sm font-medium mt-4">Creating playlist...</p>
        </div>
      )}

      <div className="w-full flex justify-center px-4 mt-10">
        <div className="w-full max-w-lg flex flex-col gap-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold">New Playlist</h1>
            <p className="text-gray-500 text-sm mt-1">Organise your videos into a playlist</p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
              <input
                type="text"
                placeholder="Give your playlist a name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <textarea
                placeholder="Tell viewers what your playlist is about"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Visibility</label>
              <div className="flex gap-3">
                {["public", "unlisted", "private"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setVisibility(opt)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize
                      ${visibility === opt
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {visibility === "public" && "Anyone can find and watch this playlist."}
                {visibility === "unlisted" && "Only people with the link can watch."}
                {visibility === "private" && "Only you can see this playlist."}
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={!title.trim() || loading}
            className="w-full bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {loading ? "Creating..." : "Create Playlist"}
          </button>
        </div>
      </div>
    </>
  );
}

export default CreatePlaylist;
