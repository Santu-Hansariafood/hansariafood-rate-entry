import React, { Suspense } from "react";
import dynamic from "next/dynamic";
const CompanyList = dynamic(() =>
  import("@/components/ui/CompanyList/CompanyList")
);
const CreateCompany = dynamic(() =>
  import("@/components/ui/CreateCompany/CreateCompany")
);

const page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <CreateCompany />
      <CompanyList />
    </Suspense>
  );
};

export default page;
