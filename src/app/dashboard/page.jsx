"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
    ssr: false,
  }
);

const Dashboard = dynamic(
  () => import("@/components/ui/Dashboard/Dashboard"),
  {
    loading: () => <Loading />,
    ssr: false,
  }
);

const Page = () => {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  );
};

export default Page;