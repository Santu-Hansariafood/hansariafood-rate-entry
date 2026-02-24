import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import dynamic from "next/dynamic";
import React from "react";
const DDGSRate = dynamic(() => import("@/components/ui/DDGSRate/DDGSRate"));

export const metadata = {
  title: "DDGS Rate",
  description:
    "Monitor updated DDGS prices for poultry and cattle feed requirements across India.",
  alternates: {
    canonical: "/ddgsrate",
  },
};

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
