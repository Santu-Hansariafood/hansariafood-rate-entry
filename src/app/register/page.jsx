"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);
const Register = dynamic(() => import("@/components/ui/Register/Register"), {
  loading: () => <Loading />,
});
const RegisterList = dynamic(
  () => import("@/components/ui/RegisterList/RegisterList"),
  {
    loading: () => <Loading />,
  }
);

const Page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="User Registration Section">
        <Register />
      </section>
      <section role="region" aria-label="User Registration List">
        <RegisterList />
      </section>
    </AuthWrapper>
  );
};

export default Page;
