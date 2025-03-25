import React, { Suspense } from "react";
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
  return (
    <AuthWrapper>
      <Suspense fallback={<Loading />}>
        <CreateLocation />
        <LocationList />
      </Suspense>
    </AuthWrapper>
  );
};

export default page;
