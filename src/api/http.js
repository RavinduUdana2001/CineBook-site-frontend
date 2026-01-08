import axios from "axios";

const BASE =
  (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

const http = axios.create({ baseURL: BASE });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    // ✅ token expired / invalid
    if (status === 401) {
      localStorage.removeItem("token");
      // optional: show message or redirect
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default http;
