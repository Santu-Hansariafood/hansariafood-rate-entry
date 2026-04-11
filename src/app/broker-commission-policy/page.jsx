import dynamic from "next/dynamic";

const BrokerCommissionPolicy = dynamic(
  () =>
    import("@/components/common/BrokerCommissionPolicy/BrokerCommissionPolicy"),
);

export const metadata = {
  title: "Broker Commission Policy",
  description:
    "Read the Broker Commission Policy for Hansaria Food’s brokerage, service charges and commission structure for commodity trades.",
  alternates: {
    canonical: "/broker-commission-policy",
  },
};

export default function BrokerCommissionPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center md:text-left">
          Broker Commission Policy – Hansaria Food Private Limited
        </h1>
        <BrokerCommissionPolicy />
      </div>
    </main>
  );
}
