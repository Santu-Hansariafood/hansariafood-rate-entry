import TermsAndConditions from "@/components/common/TermsAndConditions/TermsAndConditions";
import Breadcrumbs from "@/components/common/Breadcrumbs/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Terms and Conditions",
  description:
    "Read the Terms and Conditions for using Hansaria Food’s trading and brokerage platform for maize, soya, DDGS and related commodities.",
  path: "/terms-and-conditions",
  keywords: [
    "hansaria food terms and conditions",
    "commodity trading terms India",
    "brokerage platform terms",
  ],
});

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-10">
        <Breadcrumbs
          trail={[
            { name: "Home", path: "/" },
            { name: "Terms and Conditions", path: "/terms-and-conditions" },
          ]}
        />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Terms and Conditions – Hansaria Food Private Limited
        </h1>
        <TermsAndConditions />
      </div>
    </main>
  );
}

