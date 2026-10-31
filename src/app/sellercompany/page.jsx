import React from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { buildPageMetadata } from "@/lib/seo";
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

export const metadata = buildPageMetadata({
  title: "Seller Companies",
  description:
    "Create and manage seller records with validated contact details for commodity rate and sauda operations.",
  path: "/sellercompany",
  keywords: [
    "seller companies India",
    "commodity seller records",
    "feed raw material sellers",
  ],
});

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
