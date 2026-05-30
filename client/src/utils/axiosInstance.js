import axios from "axios";
import { serverUrl } from "../App";

const axiosInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true, // keep for same-origin / cookie fallback
});

// Attach token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
