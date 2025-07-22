import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api");

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.log("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`❌ API Error: ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.log("Error details:", error.response?.data);
    
    // If it's a 401 error, log additional debug info
    if (error.response?.status === 401) {
      console.log("🔴 401 Unauthorized - Cookie issue or session expired");
      console.log("Request headers:", error.config?.headers);
    }
    
    return Promise.reject(error);
  }
);
