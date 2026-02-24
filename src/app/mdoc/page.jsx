import React from "react";
import dynamic from "next/dynamic";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
const MDOC = dynamic(() => import("@/components/ui/MDOC/MDOC"));

export const metadata = {
  title: "M DOC Dashboard",
  description:
    "View M DOC company-wise rates, charts and notifications for poultry feed decisions.",
  alternates: {
    canonical: "/mdoc",
  },
};

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
