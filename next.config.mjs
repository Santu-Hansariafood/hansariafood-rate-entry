/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const baseConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    domains: ["cdn.jsdelivr.net", "res.cloudinary.com"],
  },
  reactStrictMode: true,
};

const nextConfig =
  process.env.NODE_ENV === "production"
    ? withPWA({
        dest: "public",
        register: true,
        skipWaiting: true,
      })(baseConfig)
    : baseConfig;

export default nextConfig;
