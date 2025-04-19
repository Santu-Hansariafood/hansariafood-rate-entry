import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);
const ResetPassword = dynamic(() =>
  import("@/components/ui/ResetPassword/ResetPassword")
);

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <ResetPassword />
      </AuthWrapper>
    </Suspense>
  );
};

export default page;
