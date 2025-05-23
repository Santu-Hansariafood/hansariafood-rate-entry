"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Loading from "@/components/common/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, CheckCircle2, XCircle } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
const NotificationList = dynamic(() =>
  import("@/components/NotificationList/NotificationList")
);

export default function CompanyList({
  companies,
  completedCompanies,
  loading: initialLoading,
  onCompanySelect,
  notifications: initialNotifications = [],
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const defaultCompanies = useMemo(() => {
    return [...companies].sort((a, b) => a.localeCompare(b));
  }, [companies]);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/rate", {
          params: {
            sort: "updatedAt_desc",
            limit: 5000,
          },
        });

        const sortedNotifications = response.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setNotifications(sortedNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  const performSearch = useMemo(
    () =>
      debounce(async (query) => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`/managecompany?q=${query}`);
          const companyNames = response.data.companies.map((c) => c.name);
          setSearchResults(companyNames);
        } catch (err) {
          console.error("Search error:", err);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
    return () => performSearch.cancel();
  }, [searchQuery]);

  const displayCompanies =
    searchQuery.trim() === "" ? defaultCompanies : searchResults;

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-6 p-4">
        <div className="flex-1">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                {displayCompanies.map((company, index) => (
                  <motion.button
                    key={company}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => onCompanySelect(company)}
                    className={`
                      group relative overflow-hidden rounded-xl p-4 transition-all duration-200
                      ${
                        completedCompanies[company]
                          ? "bg-green-50 hover:bg-green-100 border border-green-200"
                          : "bg-red-50 hover:bg-red-100 border border-red-200"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          completedCompanies[company]
                            ? "bg-green-100 group-hover:bg-green-200"
                            : "bg-red-100 group-hover:bg-red-200"
                        }`}
                      >
                        <Building2
                          className={`w-5 h-5 ${
                            completedCompanies[company]
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3
                          className={`font-medium truncate ${
                            completedCompanies[company]
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {company}
                        </h3>
                        <p
                          className={`text-sm ${
                            completedCompanies[company]
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {completedCompanies[company]
                            ? "Completed"
                            : "Pending"}
                        </p>
                      </div>
                      <div
                        className={`p-1 rounded-full ${
                          completedCompanies[company]
                            ? "bg-green-100 group-hover:bg-green-200"
                            : "bg-red-100 group-hover:bg-red-200"
                        }`}
                      >
                        {completedCompanies[company] ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && displayCompanies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No companies found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search query to find what you're looking for.
              </p>
            </motion.div>
          )}
        </div>
        <div className="w-full lg:w-[300px] shrink-0">
          <NotificationList notifications={notifications} />
        </div>
      </div>
    </Suspense>
  );
}
