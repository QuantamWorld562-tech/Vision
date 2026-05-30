import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { serverUrl } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";
import Loader from "../components/Loader";

/*
  Steps:
  1 — Enter email
  2 — Enter password (login)
  3 — Forgot password: enter email to receive OTP
  4 — Enter OTP
  5 — Set new password
*/

function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(""); // received after OTP verified

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Login ──────────────────────────────────────────────────────────────────

  const handlerNext = () => {
    if (!email) { toast.error("Enter your email"); return; }
    setStep(2);
  };

  const handlerLogin = async () => {
    if (!password) { toast.error("Enter your password"); return; }
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/auth/login`,
        { email, password },
        { withCredentials: true },
      );
      if (res.data.token) localStorage.setItem("token", res.data.token);
      dispatch(setUserData(res.data.user));
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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

  // ── Forgot password — send OTP ─────────────────────────────────────────────

  const handlerSendOtp = async () => {
    if (!email) { toast.error("Enter your email"); return; }
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/auth/forgot-password`, { email });
      toast.success("OTP sent to your email");
      setOtp("");
      setStep(4);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────

  const handlerVerifyOtp = async () => {
    if (!otp) { toast.error("Enter the OTP"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/v1/auth/verify-otp`, { email, otp });
      toast.success("OTP verified");
      setResetToken(res.data.resetToken);
      setNewPassword("");
      setConfirmPassword("");
      setStep(5);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset password ─────────────────────────────────────────────────────────

  const handlerReset = async () => {
    if (!newPassword || !confirmPassword) { toast.error("Fill all fields"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/v1/auth/reset-password`, {
        resetToken,
        password: newPassword,
      });
      toast.success(res.data.message);
      // reset all state and go back to login
      setStep(1);
      setEmail("");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Session expired. Please start over.");
    } finally {
      setLoading(false);
    }
  };

  const previousHandler = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
    if (step === 4) setStep(3);
    if (step === 5) setStep(4);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-4">
          <Loader />
          <p className="text-gray-500 text-sm font-medium mt-4">Please wait...</p>
        </div>
      )}
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {step > 1 && (
            <button onClick={previousHandler} className="p-1 hover:bg-gray-100 rounded-full">
              <span className="material-symbols-outlined text-gray-600">arrow_back</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="w-18 h-15 object-contain" alt="logo" />
            <h2 className="text-xl font-bold text-gray-800">Vision</h2>
          </div>
        </div>

        {/* ── Step 1 — Enter email ── */}
        {step === 1 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">Login</h3>
            <p className="text-sm text-gray-500 mb-6">Use your Vision account to continue</p>
            <div className="flex flex-col gap-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlerNext()}
              />
              <Link to="/signUp" className="text-sm text-red-500 hover:underline">Create account</Link>
              <button
                onClick={handlerNext}
                className="w-full bg-red-400 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors cursor-pointer"
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
              className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-sm font-medium text-gray-700 transition-colors cursor-pointer"
            >
              <FcGoogle size={25} />
              Login with Google
            </button>
          </>
        )}

        {/* ── Step 2 — Enter password ── */}
        {step === 2 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">Welcome back</h3>
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
                onKeyDown={(e) => e.key === "Enter" && handlerLogin()}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" onChange={(e) => setShowPassword(e.target.checked)} />
                  Show password
                </label>
                <button onClick={() => setStep(3)} className="text-sm text-red-500 hover:underline cursor-pointer">
                  Forgot password?
                </button>
              </div>
              <button
                onClick={handlerLogin}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3 — Forgot password: enter email ── */}
        {step === 3 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">Forgot password?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email and we'll send you a 6-digit OTP
            </p>
            <div className="flex flex-col gap-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlerSendOtp()}
              />
              <button
                onClick={handlerSendOtp}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          </>
        )}

        {/* ── Step 4 — Enter OTP ── */}
        {step === 4 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">Enter OTP</h3>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit OTP to <strong>{email}</strong>. It expires in 5 minutes.
            </p>
            <div className="flex flex-col gap-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm tracking-widest text-center  font-semibold"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handlerVerifyOtp()}
              />
              <button
                onClick={handlerVerifyOtp}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                onClick={handlerSendOtp}
                disabled={loading}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {/* ── Step 5 — Set new password ── */}
        {step === 5 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">New password</h3>
            <p className="text-sm text-gray-500 mb-6">Enter a new password for your account</p>
            <div className="flex flex-col gap-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlerReset()}
              />
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" onChange={(e) => setShowPassword(e.target.checked)} />
                Show password
              </label>
              <button
                onClick={handlerReset}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Login;
