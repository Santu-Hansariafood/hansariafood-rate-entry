"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import useRateManagement from "@/hooks/Rate/useRateManagement";

const CompanyList = dynamic(() => import("./CompanyList/CompanyList"), {
  loading: () => <Loading />,
});
const RateTable = dynamic(() => import("./RateTable/RateTable"), {
  loading: () => <Loading />,
});
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const CompanyTypeFilter = dynamic(
  () => import("@/components/ui/Rate/CompanyTypeFilter/CompanyTypeFilter"),
  { loading: () => <Loading /> }
);
const CategoryCard = dynamic(
  () => import("@/components/ui/Rate/CategoryCard/CategoryCard"),
  { loading: () => <Loading /> }
);
const RateUpdatePopup = dynamic(
  () => import("@/components/ui/Rate/RateUpdatePopup/RateUpdatePopup"),
  { loading: () => <Loading /> }
);

const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  { loading: () => <Loading /> }
);

export default function Rate() {
  const {
    companies,
    completedCompanies,
    loading,
    selectedCompany,
    setSelectedCompany,
    selectedCompanyObj,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage,
  } = useRateManagement();

  const handleFilterChange = useCallback((newFilters) => {
    const selectedCategories = Object.values(newFilters);
    setFilters((prev) => ({
      ...prev,
      category: selectedCategories,
    }));
  }, []);

  const renderCompanySelector = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-center">
        <CompanyTypeFilter
          selectedType={filters.type}
          onChange={(type) => setFilters((prev) => ({ ...prev, type }))}
        />
      </div>

      <CompanyList
        companies={companies}
        completedCompanies={completedCompanies}
        loading={loading}
        onCompanySelect={setSelectedCompany}
      />

      <RateUpdatePopup />

      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );

  const renderRateTable = (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-4xl relative transition-all">
          <button
            onClick={() => setSelectedCompany(null)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition"
          >
            ✕
          </button>
          <RateTable
            selectedCompany={selectedCompany}
            commodities={selectedCompanyObj?.commodities || []}
            onClose={() => setSelectedCompany(null)}
          />
        </div>
      </div>
    </Suspense>
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8 transition-colors">
        <ToastContainer position="top-right" theme="colored" />
        <div className="max-w-7xl mx-auto space-y-8">
          <Title text="Rate Management" />
          <CategoryCard onFilterChange={handleFilterChange} />
          {!selectedCompany && renderCompanySelector}
          {selectedCompany && renderRateTable}
        </div>
      </div>
    </Suspense>
  );
}
