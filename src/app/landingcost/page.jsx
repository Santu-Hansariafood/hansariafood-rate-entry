import LandingCost from "@/components/ui/LandingCost/LandingCost";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Landing Cost",
  description:
    "Calculate real-time landed cost for Soya DOC, M DOC and DDGS with integrated freight.",
  path: "/landingcost",
  keywords: [
    "landing cost calculator India",
    "landed cost soya DOC",
    "freight inclusive commodity price",
    "feed raw material landed cost",
  ],
});

export default function LandingCostPage() {
  return <LandingCost />;
}
