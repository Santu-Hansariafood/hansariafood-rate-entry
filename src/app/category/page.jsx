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
    <AuthWrapper>
      <Suspense fallback={<Loading />}>
        <CreateCategory />
        <CategoryList />
      </Suspense>
    </AuthWrapper>
  );
};

export default Page;
