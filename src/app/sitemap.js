import { connectDB } from "@/lib/mongodb";
import Commodity from "@/models/Commodity";

const BASE_URL = "https://www.hansariafood.site";

export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  
  let dynamicCommodityUrls = [];
  
  try {
    await connectDB();
    const commodities = await Commodity.find({});
    
    const existingRoutes = ['soya', 'mdoc', 'ddgs'];
    
    dynamicCommodityUrls = commodities
      .filter(c => !existingRoutes.includes(c.name.toLowerCase()))
      .flatMap(c => {
        const slug = c.name.toLowerCase().replace(/\s+/g, '');
        return [
          {
            url: `${BASE_URL}/${slug}rate`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
          },
          {
            url: `${BASE_URL}/${slug}`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
          }
        ];
      });
      
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  const staticRoutes = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${BASE_URL}/rate`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/soyarate`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/mdocrate`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ddgsrate`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${BASE_URL}/company`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sellercompany`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/buyercompany`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/seller`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    {
      url: `${BASE_URL}/soya`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/mdoc`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/ddgs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [...staticRoutes, ...dynamicCommodityUrls];
}
