"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);
const CreateLocation = dynamic(
  () => import("@/components/ui/Location/Location"),
  {
    loading: () => <Loading />,
  }
);
const LocationList = dynamic(
  () => import("@/components/ui/LocationList/LocationList"),
  {
    loading: () => <Loading />,
  }
);

const Page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Create Location">
        <CreateLocation />
      </section>
      <section role="region" aria-label="Location List">
        <LocationList />
      </section>
    </AuthWrapper>
  );
};

export default Page;
