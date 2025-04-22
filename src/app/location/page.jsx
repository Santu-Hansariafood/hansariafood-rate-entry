"use client";

import React, { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);
const CreateLocation = dynamic(() =>
  import("@/components/ui/Location/Location")
);
const LocationList = dynamic(() =>
  import("@/components/ui/LocationList/LocationList")
);

const page = () => {
  useEffect(() => {
    import("@/components/AuthWrapper/AuthWrapper");
    import("@/components/ui/Location/Location");
    import("@/components/ui/LocationList/LocationList");
  }, []);
  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Suspense fallback={<Loading />}>
          <CreateLocation />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <LocationList />
        </Suspense>
      </AuthWrapper>
    </Suspense>
  );
};

export default page;
