export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/rate",
          "/soyarate",
          "/mdocrate",
          "/ddgsrate",
          "/company",
          "/sellercompany",
          "/buyercompany",
          "/seller",
          "/soya",
          "/mdoc",
          "/ddgs",
        ],
        disallow: [
          "/managecompany",
          "/location",
          "/selfcompany",
          "/previoussauda",
          "/register",
          "/commodity",
          "/category",
          "/sauda",
        ],
      },
    ],
    sitemap: "https://www.hansariafood.site/sitemap.xml",
    host: "https://www.hansariafood.site",
  };
}
