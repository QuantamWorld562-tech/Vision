import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { serverUrl } from "../App";
import Loader from "./Loader";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!password || !confirm) { toast.error("Fill all fields"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/v1/auth/reset-password/${token}`, { password });
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-4">
          <Loader />
          <p className="text-gray-500 text-sm font-medium mt-4">Resetting password...</p>
        </div>
      )}
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" className="w-8 h-8 object-contain" alt="logo" />
          <h2 className="text-xl font-bold text-gray-800">Vision</h2>
        </div>

        <h3 className="text-2xl font-semibold text-gray-800 mb-1">New password</h3>
        <p className="text-sm text-gray-500 mb-6">Enter a new password for your account</p>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" onChange={(e) => setShowPassword(e.target.checked)} />
            Show password
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
