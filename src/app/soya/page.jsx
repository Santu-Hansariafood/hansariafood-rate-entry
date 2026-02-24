import React from "react";
import dynamic from "next/dynamic";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
const Soya = dynamic(() => import("@/components/ui/Soya/Soya"));

export const metadata = {
  title: "Soya DOC Dashboard",
  description:
    "Analyse Soya DOC market, notifications and trends curated for Hansaria Food clients.",
  alternates: {
    canonical: "/soya",
  },
};

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
