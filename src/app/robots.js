export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://www.hansariafood.in/sitemap.xml",
    host: "https://www.hansariafood.in",
  };
}
