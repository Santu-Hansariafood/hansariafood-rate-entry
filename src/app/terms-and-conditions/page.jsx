import TermsAndConditions from "@/components/common/TermsAndConditions/TermsAndConditions";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Read the Terms and Conditions for using Hansaria Food’s trading and brokerage platform for maize, soya, DDGS and related commodities.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Terms and Conditions – Hansaria Food Private Limited
        </h1>
        <TermsAndConditions />
      </div>
    </main>
  );
}

