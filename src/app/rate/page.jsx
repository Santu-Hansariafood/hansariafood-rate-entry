"use client";

import React, { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);

const RateManagement = dynamic(() => import("@/components/ui/Rate/Rate"));

const Page = () => {
  useEffect(() => {
    import("@/components/AuthWrapper/AuthWrapper");
    import("@/components/ui/Rate/Rate");
  }, []);
  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Suspense fallback={<Loading />}>
          <RateManagement />
        </Suspense>
      </AuthWrapper>
    </Suspense>
  );
};

export default Page;
