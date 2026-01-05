import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import dynamic from "next/dynamic";
import React from "react";
const Soya = dynamic(() => import("@/components/ui/Soya/Soya"));

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
