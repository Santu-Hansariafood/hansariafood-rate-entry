import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

const Breadcrumbs = ({ trail = [] }) => {
  if (trail.length === 0) return null;

  const itemListElement = trail.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 md:text-sm">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;

          return (
            <li key={item.path} className="flex items-center gap-2">
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-gray-700 dark:text-gray-200"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {item.name}
                </Link>
              )}

              {!isLast && (
                <span className="text-gray-300 dark:text-gray-600">/</span>
              )}
            </li>
          );
        })}
      </ol>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </nav>
  );
};

export default Breadcrumbs;
