import dynamic from "next/dynamic";

const AnalyticsDashboard = dynamic(
  () => import("@/components/ui/AnalyticsDashboard/AnalyticsDashboard"),
);

const AnalyticsPage = () => {
  return <AnalyticsDashboard />;
};

export default AnalyticsPage;
