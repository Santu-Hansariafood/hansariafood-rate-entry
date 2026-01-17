import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import dynamic from "next/dynamic";
import React from "react";
const DDGSRate = dynamic(() => import("@/components/ui/DDGSRate/DDGSRate"));

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
