import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const CreateCompany = dynamic(() => import("@/components/ui/Company/Company"));
const ManageCompanyList = dynamic(() =>
  import("@/components/ui/ManageCompanyList/ManageCompanyList")
);

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CreateCompany />
      <ManageCompanyList />
    </Suspense>
  );
};

export default page;
