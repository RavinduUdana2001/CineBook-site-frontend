import axios from "axios";

// Backend base URL (NO /api here)
const API_BASE =
  import.meta.env.VITE_API_BASE?.trim() || "http://localhost:5000";

// Axios instance uses /api prefix once
const http = axios.create({
  baseURL: `${API_BASE}/api`,
  // withCredentials: true, // only enable if you use cookies/sessions
});

// Add token automatically
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helpful error handling
http.interceptors.response.use(
  (res) => res,
  (err) => {
    // If browser blocks (CORS), axios error has no response
    if (!err.response) {
      console.error("Network/CORS error:", err.message);
      return Promise.reject(err);
    }

    const status = err.response.status;

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default http;
