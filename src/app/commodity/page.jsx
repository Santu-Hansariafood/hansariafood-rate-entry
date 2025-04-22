"use client";

import React, { Suspense, useEffect } from "react";
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
  useEffect(() => {
    import("@/components/AuthWrapper/AuthWrapper");
    import("@/components/ui/CreateCommodity/CreateCommodity");
    import("@/components/ui/CommodityList/CommodityList");
  }, []);
  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Suspense fallback={<Loading />}>
          <CreateCommodity />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <CommodityList />
        </Suspense>
      </AuthWrapper>
    </Suspense>
  );
};

export default Page;
