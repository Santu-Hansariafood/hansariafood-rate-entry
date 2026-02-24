import policy from "@/data/cookiePolicy.json";

export const metadata = {
  title: "Privacy, Cookie and Site Policy",
  description:
    "Read Hansaria Food’s privacy, cookie and site usage policy for rate and freight tools.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Cookie and Site Policy
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {policy.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {policy.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This is a basic policy view powered by a JSON file. You can update the
          details later by editing the policy configuration.
        </p>
      </div>
    </main>
  );
}
