import React from "react";
import dynamic from "next/dynamic";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import { buildPageMetadata } from "@/lib/seo";
const DDGS = dynamic(() => import("@/components/ui/DDGS/DDGS"));

export const metadata = buildPageMetadata({
  title: "DDGS Dashboard",
  description:
    "Track DDGS company-wise rates and performance with Hansaria Food insights.",
  path: "/ddgs",
  keywords: [
    "DDGS dashboard",
    "rice DDGS market India",
    "DDGS company wise rate",
  ],
});

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="DDGS Rate Section">
        <DDGS />
      </section>
    </AuthWrapper>
  );
};

export default page;
