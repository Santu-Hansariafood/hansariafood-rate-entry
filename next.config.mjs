import withPWA from "next-pwa";

const nextConfig = {
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

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);
