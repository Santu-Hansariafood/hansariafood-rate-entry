"use client";

import React, { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);
const CreateCompany = dynamic(() => import("@/components/ui/Company/Company"));
const ManageCompanyList = dynamic(() =>
  import("@/components/ui/ManageCompanyList/ManageCompanyList")
);

const page = () => {
  useEffect(() => {
    import("@/components/AuthWrapper/AuthWrapper");
    import("@/components/ui/Company/Company");
    import("@/components/ui/ManageCompanyList/ManageCompanyList");
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Suspense fallback={<Loading />}>
          <CreateCompany />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <ManageCompanyList />
        </Suspense>
      </AuthWrapper>
    </Suspense>
  );
};

export default page;
