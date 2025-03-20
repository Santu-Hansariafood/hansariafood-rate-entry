import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
const RateManagement = dynamic(() => import("@/components/ui/Rate/Rate"));

const page = () => {
  return (
    <Suspense fallback={<Loading/>}>
      <RateManagement />
    </Suspense>
  );
};

export default page;
