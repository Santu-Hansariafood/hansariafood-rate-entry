import React from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  {
    loading: () => <Loading />,
  }
);
const RateManagement = dynamic(() => import("@/components/ui/Rate/Rate"), {
  loading: () => <Loading />,
});

export function generateMetadata({ params }) {
  const raw = params?.id || "";
  const decoded = decodeURIComponent(raw);
  const base = decoded.replace(/-/g, " ").trim() || "Commodity";
  const name =
    base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();

  const title = `${name} Rate`;
  const description = `View the latest ${name} commodity rate updates, history and landed cost insights from Hansaria Food.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/rate/${raw}`,
    },
  };
}

const Page = ({ params }) => {
  const commodity = params?.id;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${commodity} Rate`,
    description:
      "Daily commodity rate and related insights provided by Hansaria Food Private Limited.",
    brand: {
      "@type": "Brand",
      name: "Hansaria Food Private Limited",
    },
    category: "Poultry feed raw material",
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AuthWrapper>
        <section role="region" aria-label="Rate Management Section">
          <RateManagement commodity={commodity} />
        </section>
      </AuthWrapper>
    </>
  );
};

export default Page;
