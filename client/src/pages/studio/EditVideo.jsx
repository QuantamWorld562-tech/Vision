import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../../App";
import Loader from "../../components/Loader";

function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  const thumbRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/content/video/${id}`);
        setVideo(res.data);
        setTitle(res.data.title || "");
        setDescription(res.data.description || "");
        setTagsInput((res.data.tags || []).join(", "));
        setThumbPreview(res.data.thumbnail || null);
      } catch {
        toast.error("Failed to load video");
        navigate("/studio/content");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      // Convert comma-separated tags to JSON array
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tags));
      if (thumbFile) formData.append("thumbnail", thumbFile);

      await axios.put(`${serverUrl}/api/v1/user/video/${id}`, formData, {
        withCredentials: true,
      });
      toast.success("Video updated successfully");
      navigate("/studio/content");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update video");
    } finally {
      setSaving(false);
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
    <>
      {saving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-4">
          <Loader />
          <p className="text-gray-500 text-sm font-medium">Saving changes...</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/studio/content")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit Video</h1>
            <p className="text-sm text-gray-500">Update your video details</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left — form */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={5000}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/5000</p>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tags</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="gaming, tutorial, react (comma-separated)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition"
              />
              <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
            </div>

            {/* Tag preview */}
            {tagsInput.trim() && (
              <div className="flex flex-wrap gap-2">
                {tagsInput.split(",").map((t, i) =>
                  t.trim() ? (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      #{t.trim()}
                    </span>
                  ) : null,
                )}
              </div>
            )}
          </div>

          {/* Right — thumbnail */}
          <div className="lg:w-64 flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">Thumbnail</label>
            <div
              className="relative w-full rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 border-dashed border-gray-200 hover:border-red-300 transition-colors"
              style={{ aspectRatio: "16/9" }}
              onClick={() => thumbRef.current?.click()}
            >
              {thumbPreview ? (
                <img src={thumbPreview} className="w-full h-full object-cover" alt="Thumbnail" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                  <p className="text-xs">Click to upload</p>
                </div>
              )}
              {thumbPreview && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl opacity-0 hover:opacity-100">edit</span>
                </div>
              )}
            </div>
            <input
              ref={thumbRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbChange}
            />
            <p className="text-xs text-gray-400">Recommended: 1280×720 (16:9)</p>

            {/* Video preview (read-only) */}
            {video?.videoUrl && (
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Video Preview</label>
                <video
                  src={video.videoUrl}
                  className="w-full rounded-xl"
                  controls
                  style={{ aspectRatio: "16/9" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
          <button
            onClick={() => navigate("/studio/content")}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

export default EditVideo;
