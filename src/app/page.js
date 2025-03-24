import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const RateCalendar = dynamic(() =>
  import("@/components/common/RateCalendar/RateCalendar")
);

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <RateCalendar />
    </Suspense>
  );
};

export default page;
