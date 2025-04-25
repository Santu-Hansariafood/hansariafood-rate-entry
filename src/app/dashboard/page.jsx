"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const Welcome = dynamic(() => import("@/components/ui/Welcome/Welcome"), {
  loading: () => <Loading />,
});
const ViewRate = dynamic(
  () => import("@/components/common/ViewRate/ViewRate"),
  {
    loading: () => <Loading />,
  }
);
const RateEntryList = dynamic(
  () => import("@/components/ui/RateEntryList/RateEntryList"),
  {
    loading: () => <Loading />,
  }
);
const RateCalendar = dynamic(
  () => import("@/components/common/RateCalendar/RateCalendar"),
  {
    loading: () => <Loading />,
  }
);
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
      <section role="region" aria-label="View Rate Section">
        <ViewRate />
      </section>
      <section role="region" aria-label="Rate Entry List">
        <RateEntryList />
      </section>
      <section role="region" aria-label="Rate Calendar">
        <RateCalendar />
      </section>
    </AuthWrapper>
  );
};

export default Page;
