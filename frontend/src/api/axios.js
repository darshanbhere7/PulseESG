import axios from "axios";

// Backend API base URL - defaults to Render deployment if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pulseesg-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 180000, // 3 minutes timeout to allow AI service to process (matches backend read timeout + buffer)
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
      const errorData = error.response.data;
      let errorMessage = null;
      
      // Extract error message safely, avoiding HTML content
      if (errorData) {
        if (typeof errorData === 'string') {
          // Check if it's HTML
          if (errorData.trim().startsWith('<!DOCTYPE') || 
              errorData.trim().startsWith('<html') ||
              errorData.includes('<html')) {
            // It's HTML, provide user-friendly message based on status
            errorMessage = getErrorMessageFromStatus(error.response.status);
          } else {
            // It's a string but not HTML, use it if reasonable length
            const cleanMessage = errorData.replace(/<[^>]*>/g, '').trim();
            if (cleanMessage.length > 0 && cleanMessage.length < 500) {
              errorMessage = cleanMessage;
            } else {
              errorMessage = getErrorMessageFromStatus(error.response.status);
            }
          }
        } else if (typeof errorData === 'object') {
          // Try to extract error or message field
          errorMessage = errorData.error || errorData.message;
          // Sanitize if it looks like HTML
          if (errorMessage && typeof errorMessage === 'string') {
            if (errorMessage.includes('<html') || errorMessage.includes('<!DOCTYPE')) {
              errorMessage = getErrorMessageFromStatus(error.response.status);
            } else {
              // Remove any HTML tags that might be present
              errorMessage = errorMessage.replace(/<[^>]*>/g, '').trim();
            }
          }
        }
      }
      
      // Fallback to status-based message
      if (!errorMessage) {
        errorMessage = getErrorMessageFromStatus(error.response.status);
      }
      
      // Attach clean error message to error object for easy access
      error.userFriendlyMessage = errorMessage;
      
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response.status,
        statusText: error.response.statusText,
        errorMessage: errorMessage
      });
      
      if (error.response.status === 401 || error.response.status === 403) {
        // Token expired or invalid - clear and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
    } else if (error.request) {
      // Request made but no response received (timeout, network error, etc.)
      let errorMessage = "Network error. Please check your connection and try again.";
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = "Request timed out. The AI service may be processing your request. Please try again.";
      }
      
      error.userFriendlyMessage = errorMessage;
      console.error("Network error:", error.request);
    } else {
      // Something else happened
      error.userFriendlyMessage = error.message || "An unexpected error occurred. Please try again.";
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Get user-friendly error message based on HTTP status code
 */
function getErrorMessageFromStatus(status) {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "Authentication required. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 408:
      return "Request timed out. Please try again.";
    case 500:
      return "Server error. Please try again later.";
    case 502:
      return "AI service is temporarily unavailable. Please try again in a moment.";
    case 503:
      return "AI service is currently busy processing requests. Please try again shortly.";
    case 504:
      return "AI service took too long to respond. The analysis may require more time. Please try again.";
    default:
      return "An error occurred. Please try again later.";
  }
}

export default api;