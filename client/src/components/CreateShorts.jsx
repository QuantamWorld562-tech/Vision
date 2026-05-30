import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";
import Loader from "./Loader";

function CreateShorts() {
  const [shortFile, setShortFile] = useState(null);
  const [shortPreview, setShortPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const shortInputRef = useRef(null);
  const navigate = useNavigate();
  const { channelData } = useSelector((store) => store.user);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setShortFile(file);
      setShortPreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setShortFile(file);
      setShortPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", JSON.stringify(tags.split(",").map((t) => t.trim())));
    formData.append("shortUrl", shortFile);
    formData.append("channelId", channelData._id);

    try {
      setLoading(true);
      await axios.post(`${serverUrl}/api/v1/content/create-short`, formData, {
        withCredentials: true,
      });
      toast.success("Short uploaded successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-4">
          <Loader />
          <p className="text-gray-500 text-sm font-medium mt-4">Uploading your short, please wait...</p>
        </div>
      )}

      <div className="w-full flex justify-center px-4 mt-10">
        <div className="w-full max-w-3xl flex flex-col gap-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold">Create Short</h1>
            <p className="text-gray-500 text-sm mt-1">Upload a vertical short-form video</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* Video preview (portrait aspect ratio) */}
            <div
              onClick={() => shortInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative w-full md:w-50 md:shrink-0 rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors
                ${dragging ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 hover:border-red-300 hover:bg-red-50"}`}
              style={{ aspectRatio: "9/16" }}
            >
              {shortPreview ? (
                <video
                  src={shortPreview}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 p-3 text-center">
                  <span className="material-symbols-outlined text-5xl">slideshow</span>
                  <p className="text-xs font-medium">Click or drag to upload</p>
                  <p className="text-xs">MP4, WebM</p>
                </div>
              )}
              <input
                ref={shortInputRef}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Right — form fields */}
            <div className="flex-1 flex flex-col gap-3">
              {shortFile && (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                  <span className="material-symbols-outlined text-red-400 text-lg">check_circle</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{shortFile.name}</p>
                    <p className="text-xs text-gray-400">{(shortFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              )}

              <input
                type="text"
                placeholder="Title (required)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition"
              />
              <textarea
                placeholder="Description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition resize-none"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition"
              />

              <button
                onClick={handleUpload}
                disabled={!title || !shortFile || loading}
                className="w-full bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {loading ? "Uploading..." : "Upload Short"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default CreateShorts;
