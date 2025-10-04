import dynamic from "next/dynamic";
import React from "react";
const SelfCompany = dynamic(() =>
  import("@/components/ui/SelfCompany/SelfCompany")
);
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Self Company Management Section">
        <SelfCompany />
      </section>
    </AuthWrapper>
  );
};

export default page;
