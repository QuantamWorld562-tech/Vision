import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setChannelData, setUserData } from "../redux/userSlice";
import Loader from "./Loader";

function UpdateChannel() {
  const imageRef = useRef(null);
  const bannerRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { channelData } = useSelector((store) => store.user);

  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [channelName, setChannelName] = useState(channelData?.name || "");
  const [description, setDescription] = useState(channelData?.description || "");
  const [category, setCategory] = useState(channelData?.category || "");
  const [loading, setLoading] = useState(false);

  const avatarPreview = avatar
    ? URL.createObjectURL(avatar)
    : channelData?.avatar || null;

  const bannerPreview = banner
    ? URL.createObjectURL(banner)
    : channelData?.banner || null;

  const handleUpdateChannel = async () => {
    const formData = new FormData();
    formData.append("name", channelName);
    formData.append("description", description);
    formData.append("category", category);
    if (avatar) formData.append("avatar", avatar);
    if (banner) formData.append("banner", banner);

    try {
      setLoading(true);
      const res = await axios.put(
        `${serverUrl}/api/v1/user/updatechannel`,
        formData,
        { withCredentials: true },
      );
      dispatch(setChannelData(res.data.channel));
      dispatch(setUserData(res.data.user));
      toast.success("Channel updated!");
      navigate("/viewChannel");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-4">
          <Loader />
          <p className="text-gray-500 text-sm font-medium mt-4">Saving changes...</p>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => step === 1 ? navigate("/viewChannel") : setStep(1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Customise Channel</h1>
            <p className="text-sm text-gray-500">Step {step} of 2</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step >= s ? "bg-red-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* ── Step 1 — Avatar & Name ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Profile Picture</p>
              <div className="flex items-center gap-5">
                {/* Avatar preview */}
                <div
                  className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 shrink-0 cursor-pointer border-2 border-dashed border-gray-300 hover:border-red-400 transition-colors"
                  onClick={() => imageRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400 text-3xl">
                        account_circle
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => imageRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                  >
                    {avatar ? "Change picture" : "Upload picture"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
                </div>
              </div>
              <input
                hidden
                type="file"
                ref={imageRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Channel Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition"
                placeholder="Channel name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
            </div>

            <button
              onClick={() => {
                if (!channelName.trim()) { toast.error("Channel name is required"); return; }
                setStep(2);
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── Step 2 — Banner, Description, Category ── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            {/* Banner */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Banner Image</p>
              <div
                className="relative w-full h-28 rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 border-dashed border-gray-300 hover:border-red-400 transition-colors"
                onClick={() => bannerRef.current?.click()}
              >
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400">
                    <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                    <p className="text-xs">Click to upload banner</p>
                  </div>
                )}
                {bannerPreview && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl opacity-0 hover:opacity-100">edit</span>
                  </div>
                )}
              </div>
              <input
                hidden
                type="file"
                ref={bannerRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setBanner(e.target.files[0])}
              />
              <p className="text-xs text-gray-400 mt-1">Recommended: 2560×1440</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition resize-none"
                placeholder="Tell viewers about your channel"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:bg-white transition"
                placeholder="e.g. Gaming, Music, Tech, Education"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <button
              onClick={handleUpdateChannel}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default UpdateChannel;
