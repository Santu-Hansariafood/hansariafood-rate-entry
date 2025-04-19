import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const AuthWrapper = dynamic(() =>
  import("@/components/AuthWrapper/AuthWrapper")
);

const CreateCategory = dynamic(() =>
  import("@/components/ui/Category/Category")
);
const CategoryList = dynamic(() =>
  import("@/components/ui/CategoryList/CategoryList")
);

const Page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <CreateCategory />
        <CategoryList />
      </AuthWrapper>
    </Suspense>
  );
};

export default Page;
