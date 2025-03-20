import React, { Suspense } from "react";
import dynamic from "next/dynamic";
const CreateLocation = dynamic(() => import("@/components/ui/Location/Location"));
const LocationList = dynamic(() => import("@/components/ui/LocationList/LocationList"));

const page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <CreateLocation />
      <LocationList />
    </Suspense>
  );
};

export default page;
