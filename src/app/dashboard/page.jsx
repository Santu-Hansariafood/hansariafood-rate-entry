import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

export const metadata = {
  title: "Dashboard",
  description:
    "Welcome to Hansaria Food dashboard. Monitor market trends and manage your commodity trade operations.",
};

const Welcome = dynamic(() => import("@/components/ui/Welcome/Welcome"), {
  loading: () => <Loading />,
});

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  },
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
