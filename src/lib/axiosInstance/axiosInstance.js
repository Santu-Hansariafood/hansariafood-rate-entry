import axios from "axios";
import { apiCache } from "../cache";

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000, // 10 second timeout
  headers: {
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
    "Content-Type": "application/json",
  },
});

// Request interceptor for caching
axiosInstance.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching for POST/PUT/DELETE
    if (config.method === 'get') {
      const cacheKey = `${config.url}_${JSON.stringify(config.params)}`;
      const cached = apiCache.get(cacheKey);
      if (cached) {
        return Promise.reject({ cached: true, data: cached });
      }
      config.metadata = { cacheKey };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for caching and error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get' && response.config.metadata?.cacheKey) {
      apiCache.set(response.config.metadata.cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.cached) {
      return Promise.resolve({ data: error.data });
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;