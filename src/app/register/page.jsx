"use client";

import React, { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const RegisterList = dynamic(() =>
  import("@/components/ui/RegisterList/RegisterList")
);
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);
const Register = dynamic(() => import("@/components/ui/Register/Register"));

const page = () => {
  useEffect(() => {
    import("@/components/AuthWrapper/AuthWrapper");
    import("@/components/ui/Register/Register");
    import("@/components/ui/RegisterList/RegisterList");
  }, []);
  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Suspense fallback={<Loading />}>
          <Register />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <RegisterList />
        </Suspense>
      </AuthWrapper>
    </Suspense>
  );
};

export default page;
