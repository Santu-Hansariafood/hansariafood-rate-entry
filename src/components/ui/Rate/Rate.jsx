"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
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

  const [showRatePopup, setShowRatePopup] = useState(false);

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
      <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <CompanyTypeFilter
          selectedType={filters.type}
          onChange={(type) => setFilters((prev) => ({ ...prev, type }))}
        />

        {/* Direct Update Rate Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowRatePopup(true)}
          className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          + Update Rate
        </motion.button>
      </div>

      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <CompanyList
        companies={companies}
        completedCompanies={completedCompanies}
        loading={loading}
        onCompanySelect={setSelectedCompany}
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

        {/* Direct Rate Update Popup */}
        <AnimatePresence>
          {showRatePopup && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setShowRatePopup(false)}
              />
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-3xl relative">
                  <button
                    onClick={() => setShowRatePopup(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
                  >
                    ✕
                  </button>
                  {/* Directly show RateUpdatePopup content */}
                  <RateUpdatePopup />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Suspense>
  );
}
