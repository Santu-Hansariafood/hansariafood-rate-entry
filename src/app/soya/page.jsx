import React from "react";
import dynamic from "next/dynamic";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import { buildPageMetadata } from "@/lib/seo";
const Soya = dynamic(() => import("@/components/ui/Soya/Soya"));

export const metadata = buildPageMetadata({
  title: "Soya DOC Dashboard",
  description:
    "Analyse Soya DOC market, notifications and trends curated for Hansaria Food clients.",
  path: "/soya",
  keywords: [
    "soya DOC dashboard",
    "soya market analysis India",
    "soya DOC price trend",
    "soybean meal market India",
  ],
});

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Soya Rate Section">
        <Soya />
      </section>
    </AuthWrapper>
  );
};

export default page;
