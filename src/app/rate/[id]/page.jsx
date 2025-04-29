"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { useParams } from "next/navigation";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);
const RateManagement = dynamic(() => import("@/components/ui/Rate/Rate"), {
  loading: () => <Loading />,
});

const Page = () => {
  const params = useParams();
  const commodity = params?.id;

  return (
    <AuthWrapper>
      <section role="region" aria-label="Rate Management Section">
        <RateManagement commodity={commodity} />
      </section>
    </AuthWrapper>
  );
};

export default Page;
