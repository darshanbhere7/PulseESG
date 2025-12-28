import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://pulseesg-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 630000,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      { hasToken: !!token }
    );

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      let message = null;
      const data = error.response.data;

      if (typeof data === "object") {
        message = data.error || data.message;
      }

      error.userFriendlyMessage =
        message || getErrorMessageFromStatus(error.response.status);

      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.userFriendlyMessage
      );

      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
    } else {
      error.userFriendlyMessage =
        "Network error. Please try again later.";
    }

    return Promise.reject(error);
  }
);

function getErrorMessageFromStatus(status) {
  switch (status) {
    case 400:
      return "Invalid request.";
    case 401:
      return "Authentication required.";
    case 403:
      return "Access denied.";
    case 404:
      return "Resource not found.";
    case 500:
      return "Server error.";
    case 502:
      return "AI service temporarily unavailable.";
    case 503:
      return "AI service busy.";
    case 504:
      return "AI service timeout.";
    default:
      return "Unexpected error.";
  }
}

export default api;
