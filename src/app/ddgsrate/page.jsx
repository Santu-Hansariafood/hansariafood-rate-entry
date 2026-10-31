import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import dynamic from "next/dynamic";
import React from "react";
import { buildPageMetadata } from "@/lib/seo";
const DDGSRate = dynamic(() => import("@/components/ui/DDGSRate/DDGSRate"));

export const metadata = buildPageMetadata({
  title: "DDGS Rate",
  description:
    "Monitor updated DDGS prices for poultry and cattle feed requirements across India.",
  path: "/ddgsrate",
  keywords: [
    "DDGS rate today",
    "rice DDGS price India",
    "distillers dried grains rate",
    "DDGS supplier India",
    "cattle feed DDGS rate",
  ],
});

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="DDGS Rate Section">
        <DDGSRate />
      </section>
    </AuthWrapper>
  );
};

export default page;
