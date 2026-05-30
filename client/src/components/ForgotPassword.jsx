import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { serverUrl } from "../App";
import Loader from "./Loader";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Enter your email"); return; }

    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/v1/auth/forgot-password`, { email });
      toast.success(res.data.message);
      setSent(true);
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
          <p className="text-gray-500 text-sm font-medium mt-4">Sending reset link...</p>
        </div>
      )}
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" className="w-8 h-8 object-contain" alt="logo" />
          <h2 className="text-xl font-bold text-gray-800">Vision</h2>
        </div>

        {!sent ? (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">Forgot password?</h3>
            <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4">
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center gap-3">
              <span className="material-symbols-outlined text-green-500 text-[60px]">mark_email_read</span>
              <h3 className="text-xl font-semibold text-gray-800">Check your email</h3>
              <p className="text-sm text-gray-500">We sent a reset link to <strong>{email}</strong>. It expires in 15 minutes.</p>
              <Link to="/login" className="text-sm text-red-500 hover:underline mt-2">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
