"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const Welcome = dynamic(() => import("@/components/ui/Welcome/Welcome"), {
  loading: () => <Loading />,
});

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);

const Page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Welcome Section">
        <Welcome />
      </section>
    </AuthWrapper>
  );
};

export default Page;
