export const SITE_URL = "https://www.hansariafood.in";
export const SITE_NAME = "Hansaria Food Private Limited";
export const SITE_LOCALE = "en_IN";

export const OG_IMAGE = {
  url: "/images/og-image1.png",
  width: 1200,
  height: 630,
  alt: "Hansaria Food Private Limited - Leading Maize Supplier in India",
};

export function buildPageMetadata({
  title,
  description,
  path,
  canonicalPath,
  keywords = [],
  type = "website",
}) {
  const normalizedPath = path === "/" ? "" : path;
  const canonical = canonicalPath ?? (path === "/" ? "/" : path);

  return {
    title,
    description,
    keywords: keywords.join(", "),

    alternates: {
      canonical,
      languages: {
        "en-IN": canonical,
        "x-default": canonical,
      },
    },

    openGraph: {
      title,
      description,
      url: `${SITE_URL}${normalizedPath}`,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type,
      images: [OG_IMAGE],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
