"use client";

import React, { Suspense, useEffect } from "react";
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

const Page = () => {
  useEffect(() => {
    import("@/components/ui/Welcome/Welcome");
    import("@/components/common/ViewRate/ViewRate");
    import("@/components/common/RateCalendar/RateCalendar");
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Suspense fallback={<Loading />}>
          <Welcome />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <ViewRate />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <RateCalendar />
        </Suspense>
      </AuthWrapper>
    </Suspense>
  );
};

export default Page;
