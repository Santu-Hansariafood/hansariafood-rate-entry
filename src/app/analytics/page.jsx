import dynamic from "next/dynamic";

export const metadata = {
  title: "Analytics",
  description:
    "Internal analytics dashboard for Hansaria Food rate, sauda and freight performance.",
  robots: {
    index: false,
    follow: false,
  },
};

const AnalyticsDashboard = dynamic(
  () => import("@/components/ui/AnalyticsDashboard/AnalyticsDashboard"),
);

const AnalyticsPage = () => {
  return <AnalyticsDashboard />;
};

export default AnalyticsPage;
