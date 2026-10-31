import React from "react";
import dynamic from "next/dynamic";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import { buildPageMetadata } from "@/lib/seo";
const MDOC = dynamic(() => import("@/components/ui/MDOC/MDOC"));

export const metadata = buildPageMetadata({
  title: "M DOC Dashboard",
  description:
    "View M DOC company-wise rates, charts and notifications for poultry feed decisions.",
  path: "/mdoc",
  keywords: [
    "M DOC dashboard",
    "M DOC market analysis India",
    "M DOC company wise rate",
  ],
});

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="M DOC Rate Section">
        <MDOC />
      </section>
    </AuthWrapper>
  );
};

export default page;
