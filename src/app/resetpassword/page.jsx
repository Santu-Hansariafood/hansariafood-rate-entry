"use client";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);
const ResetPassword = dynamic(() =>
  import("@/components/ui/ResetPassword/ResetPassword")
);

const page = () => {
  useEffect(() => {
    import("@/components/AuthWrapper/AuthWrapper");
    import("@/components/ui/ResetPassword/ResetPassword");
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Suspense fallback={<Loading />}>
          <ResetPassword />
        </Suspense>
      </AuthWrapper>
    </Suspense>
  );
};

export default page;
