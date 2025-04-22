"use client";

import React, { Suspense, useEffect } from "react";
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
  useEffect(() => {
    import("@/components/AuthWrapper/AuthWrapper");
    import("@/components/ui/Category/Category");
    import("@/components/ui/CategoryList/CategoryList");
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <AuthWrapper>
        <Suspense fallback={<Loading />}>
          <CreateCategory />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <CategoryList />
        </Suspense>
      </AuthWrapper>
    </Suspense>
  );
};

export default Page;
