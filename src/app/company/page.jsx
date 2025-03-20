import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const CompanyList = dynamic(() =>
  import("@/components/ui/CompanyList/CompanyList")
);
const CreateCompany = dynamic(() =>
  import("@/components/ui/CreateCompany/CreateCompany")
);

const page = () => {
  return (
    <Suspense fallback={<Loading/>}>
      <CreateCompany />
      <CompanyList />
    </Suspense>
  );
};

export default page;
