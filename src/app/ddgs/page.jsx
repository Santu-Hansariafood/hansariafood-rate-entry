import React from "react";
import dynamic from "next/dynamic";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
const DDGS = dynamic(() => import("@/components/ui/DDGS/DDGS"));

export const metadata = {
  title: "DDGS Dashboard",
  description:
    "Track DDGS company-wise rates and performance with Hansaria Food insights.",
  alternates: {
    canonical: "/ddgs",
  },
};

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
