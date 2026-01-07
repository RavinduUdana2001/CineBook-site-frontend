import axios from "axios";

const BASE =
  (import.meta.env.VITE_API_BASE || "http://localhost:5000") + "/api";
//use VITE_API_URL in local 
const http = axios.create({
  baseURL: BASE,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    // token expired / invalid
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default http;
