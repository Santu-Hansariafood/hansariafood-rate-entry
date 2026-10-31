import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Daily Commodity Rates",
  description:
    "Track live poultry feed raw material rates for Soya DOC, maize, DDGS and more.",
  path: "/rate",
  keywords: [
    "commodity rate today",
    "poultry feed raw material rate",
    "feed ingredient price India",
    "soya DOC rate",
    "maize rate",
    "DDGS rate",
    "M DOC rate",
  ],
});

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
  return (
    <AuthWrapper>
      <section role="region" aria-label="Rate Management Section">
        <RateManagement />
      </section>
    </AuthWrapper>
  );
};

export default Page;
