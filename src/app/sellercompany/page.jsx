import React from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const CreateSeller = dynamic(
  () => import("@/components/ui/Seller/CreateSeller/CreateSeller"),
  {
    loading: () => <Loading />,
  }
);
const SellerList = dynamic(
  () => import("@/components/ui/Seller/SellerList/SellerList"),
  {
    loading: () => <Loading />,
  }
);
const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Rate Management Section">
        <CreateSeller />
      </section>
      <section role="region" aria-label="Rate Management Section">
        <SellerList />
      </section>
    </AuthWrapper>
  );
};

export default page;
