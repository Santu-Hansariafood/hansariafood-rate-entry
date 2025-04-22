"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const Welcome = dynamic(() => import("@/components/ui/Welcome/Welcome"));
const ViewRate = dynamic(() => import("@/components/common/ViewRate/ViewRate"));
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
        <ViewRate />
        <RateCalendar />
      </AuthWrapper>
    </Suspense>
  );
};

export default page;
