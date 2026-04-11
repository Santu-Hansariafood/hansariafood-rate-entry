import dynamic from "next/dynamic";

const CookiePolicy = dynamic(() =>("@/components/common/CookiePolicy/CookiePolicy"));

export const metadata = {
  title: "Cookie Policy",
  description:
    "Read Hansaria Food’s Cookie Policy explaining how cookies and similar technologies are used on trading and brokerage platforms.",
  alternates: {
    canonical: "/cookie-policy",
  },
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center md:text-left">
          Cookie Policy – Hansaria Food Private Limited
        </h1>
        <CookiePolicy />
      </div>
    </main>
  );
}

