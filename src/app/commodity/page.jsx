"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);

const CreateCommodity = dynamic(
  () => import("@/components/ui/CreateCommodity/CreateCommodity"),
  {
    loading: () => <Loading />,
  }
);

const CommodityList = dynamic(
  () => import("@/components/ui/CommodityList/CommodityList"),
  {
    loading: () => <Loading />,
  }
);

const Page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Create new commodity">
        <CreateCommodity />
      </section>
      <section role="region" aria-label="List of commodities">
        <CommodityList />
      </section>
    </AuthWrapper>
  );
};

export default Page;
