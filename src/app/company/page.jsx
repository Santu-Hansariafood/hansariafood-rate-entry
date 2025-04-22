"use client";

import React, { Suspense, useEffect } from "react";
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
  useEffect(() => {
    import("@/components/AuthWrapper/AuthWrapper");
    import("@/components/ui/CompanyList/CompanyList");
    import("@/components/ui/CreateCompany/CreateCompany");
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Suspense fallback={<Loading />}>
          <CreateCompany />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <CompanyList />
        </Suspense>
      </AuthWrapper>
    </Suspense>
  );
};

export default Page;
