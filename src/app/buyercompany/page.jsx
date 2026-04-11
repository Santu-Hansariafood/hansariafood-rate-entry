import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Loading from "@/components/common/Loading/Loading";
const BuyerCompany = dynamic(
  () => import("@/components/ui/BuyerCompany/BuyerCompany"),
  {
    loading: () => <Loading />,
  },
);

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <BuyerCompany />
    </Suspense>
  );
};

export default page;
