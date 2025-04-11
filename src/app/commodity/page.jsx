import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);

const CreateCommodity = dynamic(() =>
  import("@/components/ui/CreateCommodity/CreateCommodity")
);
const CommodityList = dynamic(() =>
  import("@/components/ui/CommodityList/CommodityList")
);

const Page = () => {
  return (
    <AuthWrapper>
      <Suspense fallback={<Loading />}>
        <CreateCommodity />
        <CommodityList />
      </Suspense>
    </AuthWrapper>
  );
};

export default Page;
