import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

export const metadata = {
  title: "Freight Management",
  description:
    "Set and manage route-wise freight rates to power accurate landing cost calculations.",
  alternates: {
    canonical: "/freight",
  },
};

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);
const FreightManager = dynamic(
  () => import("@/components/ui/FreightManager/FreightManager"),
  {
    loading: () => <Loading />,
  }
);

const Page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="Freight Management Section">
        <FreightManager />
      </section>
    </AuthWrapper>
  );
};

export default Page;
