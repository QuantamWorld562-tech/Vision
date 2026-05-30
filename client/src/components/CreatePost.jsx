import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";
import Loader from "./Loader";

function CreatePost() {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const imageInputRef = useRef(null);
  const { channelData } = useSelector((store) => store.user);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim()) { toast.error("Post content is required"); return; }
    if (!channelData?._id) { toast.error("You need a channel to post"); return; }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("channelId", channelData._id);
    if (imageFile) formData.append("image", imageFile);

    try {
      setLoading(true);
      await axios.post(`${serverUrl}/api/v1/content/create-post`, formData, {
        withCredentials: true,
      });
      toast.success("Post published!");
      navigate("/viewChannel");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-4">
          <Loader />
          <p className="text-gray-500 text-sm font-medium mt-4">Publishing post...</p>
        </div>
      )}

      <div className="w-full flex justify-center px-4 mt-10">
        <div className="w-full max-w-lg flex flex-col gap-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold">Community Post</h1>
            <p className="text-gray-500 text-sm mt-1">Share an update, image, or thought with your audience</p>
          </div>

          {/* Channel info */}
          {channelData && (
            <div className="flex items-center gap-3">
              {channelData.avatar ? (
                <img src={channelData.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-500">account_circle</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800">{channelData.name}</p>
                <p className="text-xs text-gray-400">Posting as your channel</p>
              </div>
            </div>
          )}

          {/* Text area */}
          <div>
            <textarea
              placeholder="What's on your mind? Share with your community..."
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/5000</p>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
            >
              <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
              Add image
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            <button
              onClick={handlePost}
              disabled={!content.trim() || loading}
              className="bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
            >
              {loading ? "Publishing..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreatePost;
