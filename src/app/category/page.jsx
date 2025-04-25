"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);

const CreateCategory = dynamic(
  () => import("@/components/ui/Category/Category"),
  {
    loading: () => <Loading />,
  }
);

const CategoryList = dynamic(
  () => import("@/components/ui/CategoryList/CategoryList"),
  {
    loading: () => <Loading />,
  }
);

const Page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Create a new category">
        <CreateCategory />
      </section>
      <section role="region" aria-label="Existing categories list">
        <CategoryList />
      </section>
    </AuthWrapper>
  );
};

export default Page;
