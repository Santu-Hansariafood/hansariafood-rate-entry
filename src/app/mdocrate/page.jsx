import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import dynamic from "next/dynamic";
import React from "react";
import { buildPageMetadata } from "@/lib/seo";
const MDOCRate = dynamic(() => import("@/components/ui/MDOCRate/MDOCRate"));

export const metadata = buildPageMetadata({
  title: "M DOC Rate",
  description:
    "Check latest M DOC price updates with clear visibility for poultry feed planning.",
  path: "/mdocrate",
  keywords: [
    "M DOC rate today",
    "M DOC price India",
    "M DOC supplier India",
    "poultry feed ingredient price",
  ],
});

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="M DOC Rate Section">
        <MDOCRate />
      </section>
    </AuthWrapper>
  );
};

export default page;
