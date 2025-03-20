import React, { Suspense } from "react";
import dynamic from "next/dynamic";
const CreateCategory = dynamic(() =>
  import("@/components/ui/Category/Category")
);
const CategoryList = dynamic(() =>
  import("@/components/ui/CategoryList/CategoryList")
);

const page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <CreateCategory />
      <CategoryList />
    </Suspense>
  );
};

export default page;
