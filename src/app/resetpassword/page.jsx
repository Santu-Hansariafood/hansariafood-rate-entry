"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);
const ResetPassword = dynamic(
  () => import("@/components/ui/ResetPassword/ResetPassword"),
  {
    loading: () => <Loading />,
  }
);

const Page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Reset Password Section">
        <ResetPassword />
      </section>
    </AuthWrapper>
  );
};

export default Page;
