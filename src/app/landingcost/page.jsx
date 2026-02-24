import LandingCost from "@/components/ui/LandingCost/LandingCost";

export const metadata = {
  title: "Landing Cost",
  description:
    "Calculate real-time landed cost for Soya DOC, M DOC and DDGS with integrated freight.",
  alternates: {
    canonical: "/landingcost",
  },
};

export default function LandingCostPage() {
  return <LandingCost />;
}
