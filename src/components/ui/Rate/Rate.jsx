"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Building2 } from "lucide-react";
import useRateManagement from "@/hooks/Rate/useRateManagement";
import useRateGroups from "@/hooks/Rate/useRateGroups";
import useRateDisplayNotifications from "@/hooks/Rate/useRateDisplayNotifications";
import RateViewLayout from "@/components/ui/Rate/RateViewLayout";

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
  const {
    groups,
    visibleGroups,
    loading: groupsLoading,
    loaded: groupsLoaded,
    error: groupsError,
    currentPage: groupPage,
    setCurrentPage: setGroupPage,
    totalGroups,
    itemsPerPage: groupsPerPage,
  } = useRateGroups();
  const { notifications } = useRateDisplayNotifications();

  const [showRatePopup, setShowRatePopup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleFilterChange = useCallback((newFilters) => {
    const selectedCategories = Object.values(newFilters);
    setFilters((prev) => ({
      ...prev,
      category: selectedCategories,
    }));
  }, []);

  const handleGroupSelect = (group) => {
    const companyNames = (group.companies || [])
      .filter((company) => company?.name)
      .map((company) => company.name);

    setSelectedGroup(group);
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      companyNames: companyNames.length ? companyNames : [""],
    }));
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setCurrentPage(1);
    setFilters((prev) => {
      const nextFilters = { ...prev };
      delete nextFilters.companyNames;
      return nextFilters;
    });
  };

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

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowRatePopup(true)}
          className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          + Update Rate
        </motion.button>
      </div>

      <RateViewLayout notifications={notifications}>
        {selectedGroup ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedGroup.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Companies in this group
                </p>
              </div>
              <button
                type="button"
                onClick={handleBackToGroups}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Back to Groups and Companies
              </button>
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
              restrictSearchToCurrentPage
              notifications={notifications}
              showNotifications={false}
            />
          </>
        ) : (
          <>
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Company Groups
              </h2>
              {groupsLoading ? (
                <Loading />
              ) : groupsError ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                >
                  {groupsError}
                </p>
              ) : groups.length ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleGroups.map((group) => (
                          <motion.button
                            key={group._id}
                            type="button"
                            onClick={() => handleGroupSelect(group)}
                            whileHover={{ y: -2 }}
                            className="group relative overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-emerald-100 p-2 group-hover:bg-emerald-200 dark:bg-emerald-900/50 dark:group-hover:bg-emerald-800">
                                <Building2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="block truncate font-medium text-emerald-900 dark:text-emerald-100">
                                  {group.name}
                                </span>
                                <span className="mt-1 block text-sm text-emerald-700 dark:text-emerald-300">
                                  {(group.companies || []).filter(Boolean).length}{" "}
                                  companies
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                  <Pagination
                    totalItems={totalGroups}
                    itemsPerPage={groupsPerPage}
                    currentPage={groupPage}
                    onPageChange={setGroupPage}
                  />
                </>
              ) : (
                <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                  {groupsLoaded
                    ? "No groups found. Create a group from the Company menu."
                    : "Loading groups..."}
                </p>
              )}
            </section>

            <section className="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Companies
              </h2>
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
                notifications={notifications}
                showNotifications={false}
              />
            </section>
          </>
        )}
      </RateViewLayout>
    </motion.div>
  );

  const renderRateTable = (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-4xl relative transition-all">
          <button
            onClick={() => setSelectedCompany(null)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition"
          >
            ✕
          </button>
          <RateTable
            selectedCompany={selectedCompany}
            selectedCompanyObj={selectedCompanyObj}
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
