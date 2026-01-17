import React from "react";
import dynamic from "next/dynamic";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
const MDOC = dynamic(() => import("@/components/ui/MDOC/MDOC"));

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
