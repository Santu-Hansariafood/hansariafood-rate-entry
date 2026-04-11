/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  turbopack: {},
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
