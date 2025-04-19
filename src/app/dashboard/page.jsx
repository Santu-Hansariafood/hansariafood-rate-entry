import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import Welcome from "@/components/ui/Welcome/Welcome";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);
const RateCalendar = dynamic(() =>
  import("@/components/common/RateCalendar/RateCalendar")
);

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Welcome />
        <RateCalendar />
      </AuthWrapper>
    </Suspense>
  );
};

export default page;
