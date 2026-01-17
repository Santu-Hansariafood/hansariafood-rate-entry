import React from "react";
import dynamic from "next/dynamic";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
const DDGS = dynamic(() => import("@/components/ui/DDGS/DDGS"));

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
