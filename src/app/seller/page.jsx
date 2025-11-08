import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Loading from "@/components/common/Loading/Loading";
const SellerCompany = dynamic(
  () => import("@/components/ui/SellerCompany/SellerCompany"),
  {
    loading: () => <Loading />,
  }
);

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SellerCompany />
    </Suspense>
  );
};

export default page;
