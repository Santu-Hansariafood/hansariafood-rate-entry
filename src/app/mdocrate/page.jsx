import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import dynamic from "next/dynamic";
import React from "react";
const MDOCRate = dynamic(() => import("@/components/ui/MDOCRate/MDOCRate"));

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
