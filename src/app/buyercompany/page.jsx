import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Loading from "@/components/common/Loading/Loading";
import { buildPageMetadata } from "@/lib/seo";
const BuyerCompany = dynamic(
  () => import("@/components/ui/BuyerCompany/BuyerCompany"),
  {
    loading: () => <Loading />,
  },
);

export const metadata = buildPageMetadata({
  title: "Buyer Companies",
  description:
    "Browse buyer companies and their commodity requirements for poultry and animal feed raw materials across India.",
  path: "/buyercompany",
  keywords: [
    "buyer companies India",
    "commodity buyers directory",
    "poultry feed buyers India",
    "animal feed buyers India",
  ],
});

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <BuyerCompany />
    </Suspense>
  );
};

export default page;
