import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import Loader from "./Loader";

function CreateChannel() {
  const imageRef = useRef(null);
  const bannerRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateChannel = async () => {
    const formData = new FormData();
    formData.append("name", channelName);
    formData.append("description", description);
    formData.append("category", category);
    if (avatar) formData.append("avatar", avatar);
    if (banner) formData.append("banner", banner);

    try {
      setLoading(true);
      const res = await axios.post(
        `${serverUrl}/api/v1/user/createchannel`,
        formData,
        { withCredentials: true },
      );
      dispatch(setUserData(res.data.user));
      toast.success("Channel Created");
      navigate("/");
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
          <p className="text-gray-500 text-sm font-medium mt-4">Creating your channel...</p>
        </div>
      )}
      {/* Step 1 — Channel name & avatar */}
      {step === 1 && (
        <>
          <div className="flex absolute min-w-screen bg-gray-200 items-center">
            <img
              src="/logo.png"
              className="w-18 h-15 object-contain"
              alt="logo"
            />
            <h2 className="text-xl font-bold text-gray-800">Vision</h2>
          </div>
          <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-5">
              <h2 className="text-2xl">How you'll appear</h2>
              <p className="text-sm text-gray-500 mb-6">
                Choose a profile picture
              </p>
              {avatar && (
                <Avatar
                  className="w-full mx-14"
                  round={true}
                  src={URL.createObjectURL(avatar)}
                />
              )}

              <p
                onClick={() => imageRef.current.click()}
                className="text-sm flex text-red-500 mx-27 md:mx-30 mt-3 cursor-pointer"
              >
                Upload Picture
              </p>
              <input
                hidden
                type="file"
                ref={imageRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
              <input
                className="bg-gray-100 p-3 rounded-md w-full my-3 outline-red-400"
                placeholder="Channel Name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
              <button
                onClick={() => setStep(2)}
                className="w-full bg-red-400 p-3 my-2 rounded-4xl text-white hover:bg-red-500 cursor-pointer"
              >
                Continue
              </button>
              <p
                onClick={() => navigate("/")}
                className="text-sm pt-4 text-blue-600 cursor-pointer"
              >
                Back to home
              </p>
            </div>
          </div>
        </>
      )}

      {/* Step 2 — Description, category & banner */}
      {step === 2 && (
        <>
          <div className="flex absolute min-w-screen bg-gray-200 items-center">
            <img
              src="/logo.png"
              className="w-18 h-15 object-contain"
              alt="logo"
            />
            <h2 className="text-xl font-bold text-gray-800">Vision</h2>
          </div>
          <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-5">
              <h2 className="text-2xl">Channel Details</h2>
              <p className="text-sm text-gray-500 mb-3">
                Tell viewers about your channel
              </p>

              {/* banner above description */}
              <p
                onClick={() => bannerRef.current.click()}
                className="text-sm text-red-500 mt-1 mb-3 cursor-pointer"
              >
                Upload Banner Image
              </p>
              {banner && (
                <img
                  src={URL.createObjectURL(banner)}
                  alt="banner preview"
                  className="w-full h-24 object-cover rounded-md mb-3"
                />
              )}
              <input
                hidden
                type="file"
                ref={bannerRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setBanner(e.target.files[0])}
              />

              <textarea
                className="bg-gray-100 p-3 rounded-md w-full my-3 outline-red-400 resize-none"
                placeholder="Description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                className="bg-gray-100 p-3 rounded-md w-full my-3 outline-red-400"
                placeholder="Category (e.g. Gaming, Music, Tech)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <button
                onClick={handleCreateChannel}
                className="w-full bg-red-400 p-3 my-2 rounded-4xl text-white hover:bg-red-500 cursor-pointer"
              >
                Create Channel
              </button>
              <p
                onClick={() => setStep(1)}
                className="text-sm pt-4 text-blue-600 cursor-pointer"
              >
                Back
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default CreateChannel;
