import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";
import Loader from "./Loader";

function CreateVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const navigate = useNavigate();
const {channelData} = useSelector((store)=>store.user)
  const handleVideoDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setVideoFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadVideo = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", JSON.stringify(tags.split(",").map((tag) => tag.trim())));
    formData.append("video", videoFile);
    formData.append("thumbnail", thumbnail);
    formData.append("channelId", channelData._id);

    try {
      setLoading(true);
      await axios.post(`${serverUrl}/api/v1/content/create-video`, formData, { withCredentials: true });
      toast.success("Video uploaded successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-4">
          <Loader />
          <p className="text-gray-500 text-sm font-medium mt-4">Uploading your video, please wait...</p>
        </div>
      )}

      <div className="w-full flex justify-center px-4 mt-10">
        <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Upload Video</h1>
          <p className="text-gray-500 text-sm mt-1">
            Share your video with the world
          </p>
        </div>

        {/* Video Drop Zone */}
        <div
          onClick={() => videoInputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleVideoDrop}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-colors
            ${dragging ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-red-50 hover:border-red-300"}`}
        >
          {videoFile ? (
            <div className="text-center">
              <p className="font-medium text-gray-700">{videoFile.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <span className="material-symbols-outlined text-9xl  text-gray-500">
                cloud_upload
              </span>
              <p className="font-medium text-gray-600">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-gray-400 mt-1">
                MP4, WebM, MKV supported
              </p>
            </div>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/x-matroska"
            className="hidden"
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
        </div>

        {/* Text Fields */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition"
          />
          <textarea
            placeholder="Description"
            rows={3}
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
        </div>

        {/* Thumbnail Upload */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Thumbnail</p>
          <div
            onClick={() => thumbInputRef.current.click()}
            className="flex items-center h-40 justify-center border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden cursor-pointer hover:border-red-300 hover:bg-red-50 transition "
          >
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <span className="material-symbols-outlined text-4xl">
                  add_photo_alternate
                </span>
                <p className="text-sm">Click to upload thumbnail</p>
              </div>
            )}
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleUploadVideo}
          disabled={!title || !description || !videoFile || loading}
          className="w-full bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-semibold py-3 rounded-xl transition-all"
        >
          {loading ? "Uploading..." : "Publish"}
        </button>
      </div>
    </div>
    </>
  );
}

export default CreateVideo;
