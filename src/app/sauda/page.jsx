import dynamic from "next/dynamic";
import React from "react";
const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  { loading: () => <Loading /> }
);
const Sauda = dynamic(() => import("@/components/ui/Sauda/Sauda"), {
  loading: () => <Loading />,
});

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Sauda Management Section">
        <Sauda />
      </section>
    </AuthWrapper>
  );
};

export default page;
