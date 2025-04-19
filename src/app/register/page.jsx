import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import RegisterList from "@/components/ui/RegisterList/RegisterList";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);
const Register = dynamic(() => import("@/components/ui/Register/Register"));

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Register />
        <RegisterList />
      </AuthWrapper>
    </Suspense>
  );
};

export default page;
