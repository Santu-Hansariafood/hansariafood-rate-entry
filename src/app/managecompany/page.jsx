"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);
const CreateCompany = dynamic(() => import("@/components/ui/Company/Company"), {
  loading: () => <Loading />,
});
const ManageCompanyList = dynamic(
  () => import("@/components/ui/ManageCompanyList/ManageCompanyList"),
  {
    loading: () => <Loading />,
  }
);

const Page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Create Company">
        <CreateCompany />
      </section>
      <section role="region" aria-label="Manage Company List">
        <ManageCompanyList />
      </section>
    </AuthWrapper>
  );
};

export default Page;
