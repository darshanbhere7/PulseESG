import axios from "axios";

// Backend API base URL - defaults to Render deployment if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pulseesg-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request for debugging (remove in production)
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      hasToken: !!token,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        errorMessage: error.response.data?.error || error.response.data?.message || JSON.stringify(error.response.data),
        headers: error.response.headers
      });
      
      if (error.response.status === 401 || error.response.status === 403) {
        // Token expired or invalid - clear and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
    } else if (error.request) {
      // Request made but no response received
      console.error("Network error:", error.request);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;