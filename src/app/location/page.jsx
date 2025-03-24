import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const CreateLocation = dynamic(() =>
  import("@/components/ui/Location/Location")
);
const LocationList = dynamic(() =>
  import("@/components/ui/LocationList/LocationList")
);

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CreateLocation />
      <LocationList />
    </Suspense>
  );
};

export default page;
