import React from "react";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
const PreviousSauda = dynamic(
  () => import("@/components/ui/PreviousSauda/PreviousSauda"),
  { loading: () => <Loading /> },
);

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Previous Sauda">
        <PreviousSauda />
      </section>
    </AuthWrapper>
  );
};

export default page;
