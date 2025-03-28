import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);
const RateCalendar = dynamic(() =>
  import("@/components/common/RateCalendar/RateCalendar")
);

const page = () => {
  return (
    <AuthWrapper>
      <Suspense fallback={<Loading />}>
        <RateCalendar />
      </Suspense>
    </AuthWrapper>
  );
};

export default page;
