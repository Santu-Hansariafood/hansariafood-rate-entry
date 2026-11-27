"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Loading from "@/components/common/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/context/SocketContext";
import { Search, Building2, CheckCircle2, XCircle } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import useRateDisplayNotifications from "@/hooks/Rate/useRateDisplayNotifications";
import useDebouncedSearch from "@/hooks/useDebouncedSearch/useDebouncedSearch";
import { toTitleCase } from "@/utils/formatName/formatName";
const NotificationList = dynamic(() =>
  import("@/components/NotificationList/NotificationList")
);

export default function CompanyList({
  companies,
  completedCompanies,
  loading: initialLoading,
  onCompanySelect,
  restrictSearchToCurrentPage = false,
  notifications: initialNotifications,
  showNotifications = true,
  excludeGroupedCompaniesFromSearch = false,
}) {
  const socket = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [disabledCompanies, setDisabledCompanies] = useState([]);
  const { notifications: fetchedNotifications } = useRateDisplayNotifications({
    enabled: initialNotifications === undefined,
  });
  const notifications = initialNotifications ?? fetchedNotifications;

  const searchUrl = excludeGroupedCompaniesFromSearch
    ? "/managecompany?excludeGroupedCompanies=true"
    : "/managecompany";
  const { results: searchResults, loading } = useDebouncedSearch(
    searchQuery,
    searchUrl,
  );

  const defaultCompanies = useMemo(() => {
    return [...companies].sort((a, b) => a.localeCompare(b));
  }, [companies]);

  useEffect(() => {
    const fetchDisabledCompanies = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await axiosInstance.get("/rateupdate", {
          params: { date: today },
        });
        const data = res.data;
        if (data.success && data.data.length > 0) {
          setDisabledCompanies(data.data[0].companies || []);
        }
      } catch (err) {
        console.error("Error fetching disabled companies:", err);
      }
    };

    fetchDisabledCompanies();

    if (!socket) return;

    const handleNotification = (payload) => {
      if (payload.type === 'rate_update_list') {
        const today = new Date().toISOString().split("T")[0];
        if (payload.data.date === today) {
          setDisabledCompanies(payload.data.companies || []);
        }
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const displayCompanies =
    searchQuery.trim() === ""
      ? defaultCompanies
      : restrictSearchToCurrentPage
      ? defaultCompanies.filter((company) =>
          company.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      : searchResults.map((company) => company.name);

  return (
    <Suspense fallback={<Loading />}>
      <div
        className={`flex w-full gap-6 ${
          showNotifications
            ? "max-w-7xl mx-auto flex-col lg:flex-row p-4"
            : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative mb-8"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </motion.div>

          {initialLoading || loading ? (
            <Loading />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {displayCompanies.map((company, index) => {
                  const isDisabled = disabledCompanies.includes(company);
                  return (
                    <motion.button
                      key={company}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => !isDisabled && onCompanySelect(company)}
                      disabled={isDisabled}
                      className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-200 ${
                        isDisabled
                          ? "bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-60"
                          : completedCompanies[company]
                          ? "bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-900"
                          : "bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            completedCompanies[company]
                              ? "bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-900"
                              : "bg-red-100 dark:bg-red-900/50 group-hover:bg-red-200 dark:group-hover:bg-red-900"
                          }`}
                        >
                          <Building2
                            className={`w-5 h-5 ${
                              completedCompanies[company]
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <h3
                            className={`font-medium truncate ${
                              completedCompanies[company]
                                ? "text-green-800 dark:text-green-200"
                                : "text-red-800 dark:text-red-200"
                            }`}
                          >
                            {toTitleCase(company)}
                          </h3>
                          <p
                            className={`text-sm ${
                              completedCompanies[company]
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {completedCompanies[company]
                              ? "Completed"
                              : isDisabled
                              ? "No Buying Today"
                              : "Pending"}
                          </p>
                        </div>
                        <div
                          className={`p-1 rounded-full ${
                            completedCompanies[company]
                              ? "bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-900"
                              : "bg-red-100 dark:bg-red-900/50 group-hover:bg-red-200 dark:group-hover:bg-red-900"
                          }`}
                        >
                          {completedCompanies[company] ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && displayCompanies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No companies found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search query to find what you're looking for.
              </p>
            </motion.div>
          )}
        </div>
        {showNotifications && (
          <div className="w-full shrink-0 lg:w-[300px]">
            <NotificationList notifications={notifications} />
          </div>
        )}
      </div>
    </Suspense>
  );
}
