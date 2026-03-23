import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

export default axiosInstance;
