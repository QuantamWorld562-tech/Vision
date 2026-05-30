import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";
import Loader from "../components/Loader";

function SignUp() {
  const imageRef = useRef();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [backendImage, setBackendImage] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlerImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handlerNext = () => {
    if (step === 1) {
      if (!name || !email) { toast.error("Fill all the fields"); return; }
    }
    if (step === 2) {
      if (!password || !confirmPassword) { toast.error("Fill all the fields"); return; }
      if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    }
    setStep(step + 1);
  };

  const handlerSignUp = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userName", name);
      formData.append("email", email);
      formData.append("password", password);
      if (backendImage) formData.append("photoUrl", backendImage);

      const res = await axios.post(`${serverUrl}/api/v1/auth/signup`, formData, { withCredentials: true });
      if (res.data.token) localStorage.setItem("token", res.data.token);
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const previousHandler = () => {
    if (step > 1) setStep(step - 1);
  };

  const googleAuthHandler = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const res = await axios.post(
        `${serverUrl}/api/v1/auth/googleauth`,
        { userName: user.displayName, email: user.email, photoUrl: user.photoURL },
        { withCredentials: true },
      );
      if (res.data.token) localStorage.setItem("token", res.data.token);
      dispatch(setUserData(res.data.user));
      toast.success("Signed in with Google");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Google sign-in failed");
    }
  };

  const stepLabels = ["Basic info", "Security", "Avatar"];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-4">
          <Loader />
          <p className="text-gray-500 text-sm font-medium mt-4">Creating your account...</p>
        </div>
      )}
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {step > 1 && (
            <button onClick={previousHandler} className="p-1 hover:bg-gray-100 rounded-full">
              <span className="material-symbols-outlined text-gray-600">arrow_back</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="w-18 h-15 object-contain" alt="logo" />
            <h2 className="text-xl  font-bold text-gray-800">Vision</h2>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step === i + 1 ? "bg-red-500 text-white" : step > i + 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-xs ${step === i + 1 ? "text-red-500 font-medium" : "text-gray-400"}`}>{label}</span>
              {i < 2 && <div className={`h-px w-4 ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Basic Info */}
        {step === 1 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">Create account</h3>
            <p className="text-sm text-gray-500 mb-6">Let's start with the basics</p>

            <div className="flex flex-col gap-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handlerNext}
                className="w-full bg-red-400 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-3 my-5">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            <button
              onClick={googleAuthHandler}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-sm font-medium text-gray-700 transition-colors cursor-pointer "
            >
              <FcGoogle size={25} />
              Sign up with Google
            </button>
          </>
        )}

        {/* Step 2 — Password */}
        {step === 2 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">Set a password</h3>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 w-fit mb-6">
              <span className="material-symbols-outlined text-gray-500 text-[18px]">account_circle</span>
              <span className="text-sm text-gray-600">{email}</span>
            </div>

            <div className="flex flex-col gap-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" onChange={(e) => setShowPassword(e.target.checked)} />
                Show password
              </label>
              <button
                onClick={handlerNext}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Avatar */}
        {step === 3 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">Choose avatar</h3>
            <p className="text-sm text-gray-500 mb-6">Optional — you can skip this</p>

            <div className="flex items-center gap-5 mb-6">
              {frontendImage ? (
                <img src={frontendImage} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-red-400" />
              ) : (
                <span className="material-symbols-outlined text-gray-300 text-[80px]">account_circle</span>
              )}
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">Profile picture</p>
                <button
                  onClick={() => imageRef.current.click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Choose file
                </button>
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handlerImage} />
              </div>
            </div>

            <button
              onClick={handlerSignUp}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default SignUp;
