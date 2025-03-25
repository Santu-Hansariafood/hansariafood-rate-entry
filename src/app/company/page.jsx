"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);

const CompanyList = dynamic(() =>
  import("@/components/ui/CompanyList/CompanyList")
);
const CreateCompany = dynamic(() =>
  import("@/components/ui/CreateCompany/CreateCompany")
);

const Page = () => {
  return (
    <AuthWrapper>
      <Suspense fallback={<Loading />}>
        <CreateCompany />
        <CompanyList />
      </Suspense>
    </AuthWrapper>
  );
};

export default Page;
