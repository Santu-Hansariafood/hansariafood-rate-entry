import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import dynamic from "next/dynamic";
import React from "react";
const Soyarate = dynamic(() => import("@/components/ui/Soyarate/Soyarate"));

export const metadata = {
  title: "Soya DOC Rate",
  description:
    "View today’s Soya DOC rate and historical trend for feed mill buyers.",
  alternates: {
    canonical: "/soyarate",
  },
};

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
