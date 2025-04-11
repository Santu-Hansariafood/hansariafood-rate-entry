import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

export default axiosInstance;
