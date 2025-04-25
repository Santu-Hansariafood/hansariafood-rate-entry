"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(() => import("@/components/AuthWrapper/AuthWrapper"), {
  loading: () => <Loading />,
});

const CompanyList = dynamic(() => import("@/components/ui/CompanyList/CompanyList"), {
  loading: () => <Loading />,
});

const CreateCompany = dynamic(() => import("@/components/ui/CreateCompany/CreateCompany"), {
  loading: () => <Loading />,
});

const Page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Create new company">
        <CreateCompany />
      </section>
      <section role="region" aria-label="List of companies">
        <CompanyList />
      </section>
    </AuthWrapper>
  );
};

export default Page;
