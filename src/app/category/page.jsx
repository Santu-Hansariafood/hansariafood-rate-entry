import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const CreateCategory = dynamic(() =>
  import("@/components/ui/Category/Category")
);
const CategoryList = dynamic(() =>
  import("@/components/ui/CategoryList/CategoryList")
);

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CreateCategory />
      <CategoryList />
    </Suspense>
  );
};

export default page;
