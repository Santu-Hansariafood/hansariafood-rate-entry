import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);

const RateManagement = dynamic(() => import("@/components/ui/Rate/Rate"));

const Page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <RateManagement />
      </AuthWrapper>
    </Suspense>
  );
};

export default Page;
