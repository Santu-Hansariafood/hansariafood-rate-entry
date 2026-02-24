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
          "/landingcost",
          "/freight",
          "/company",
          "/sellercompany",
          "/buyercompany",
          "/seller",
          "/soya",
          "/mdoc",
          "/ddgs",
          "/privacy-policy",
          "/terms-and-conditions",
          "/broker-commission-policy",
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
