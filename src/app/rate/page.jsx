import dynamic from "next/dynamic";
import React, { Suspense } from "react";
const RateManagement = dynamic(() => import("@/components/ui/Rate/Rate"));

const page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <RateManagement />
    </Suspense>
  );
};

export default page;
