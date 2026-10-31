import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Loading from "@/components/common/Loading/Loading";
import { buildPageMetadata } from "@/lib/seo";
const SellerCompany = dynamic(
  () => import("@/components/ui/SellerCompany/SellerCompany"),
  {
    loading: () => <Loading />,
  }
);

export const metadata = buildPageMetadata({
  title: "Seller Companies",
  description:
    "Browse seller companies and their commodity rates for maize, soya DOC, M DOC and DDGS across India.",
  path: "/seller",
  canonicalPath: "/sellercompany",
  keywords: [
    "seller companies India",
    "commodity sellers directory",
    "maize sellers India",
    "soya DOC sellers India",
  ],
});

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SellerCompany />
    </Suspense>
  );
};

export default page;
