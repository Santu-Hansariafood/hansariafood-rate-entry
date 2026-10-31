import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import dynamic from "next/dynamic";
import React from "react";
import { buildPageMetadata } from "@/lib/seo";
const Soyarate = dynamic(() => import("@/components/ui/Soyarate/Soyarate"));

export const metadata = buildPageMetadata({
  title: "Soya DOC Rate",
  description:
    "View today’s Soya DOC rate and historical trend for feed mill buyers.",
  path: "/soyarate",
  keywords: [
    "soya DOC rate today",
    "soya de-oiled cake rate",
    "soya DOC price India",
    "soybean meal rate Kolkata",
    "soya DOC supplier India",
  ],
});

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Soya Rate Section">
        <Soyarate />
      </section>
    </AuthWrapper>
  );
};

export default page;
