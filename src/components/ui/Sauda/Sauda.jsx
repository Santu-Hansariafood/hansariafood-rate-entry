"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useSaudaData from "@/hooks/SaudaData/useSaudaData";
import { Handshake } from "lucide-react";

const ManageCompanyPopup = dynamic(
  () => import("@/components/ui/Sauda/ManageCompanyPopup/ManageCompanyPopup"),
  { suspense: true }
);
const NotificationsPanel = dynamic(
  () => import("@/components/ui/Sauda/NotificationsPanel/NotificationsPanel"),
  { suspense: true }
);
const BuyerSellerFilter = dynamic(
  () => import("@/components/common/BuyerSellerFilter/BuyerSellerFilter"),
  { suspense: true }
);
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  suspense: true,
});
const InputBox = dynamic(
  () => import("@/components/common/InputBox/InputBox"),
  {
    suspense: true,
  }
);
const Legend = dynamic(() => import("@/components/ui/Sauda/Legend/Legend"), {
  suspense: true,
});

const Sauda = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const inactivityTimer = useRef(null);

  const {
    companies,
    rateData,
    saudaStatusMap,
    loading,
    hasRate,
    updateCompanyStatus,
    filterType,
    setFilterType,
  } = useSaudaData();

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => hasRate(company.name))
      .filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((company) => {
        if (filterType === "all") return true;
        const types = Array.isArray(company.type) ? company.type : [company.type];
        return types.some(t => t?.toLowerCase() === filterType.toLowerCase());
      });
  }, [companies, searchTerm, hasRate, filterType]);

  const handlePopupClose = useCallback(
    (companyName, status = null) => {
      setSelectedCompany(null);
      if (status) {
        updateCompanyStatus(companyName, status);
      }
      clearTimeout(inactivityTimer.current);
    },
    [updateCompanyStatus]
  );

  useEffect(() => {
    if (selectedCompany) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        handlePopupClose(selectedCompany);
      }, 5 * 60 * 1000);
    }

    return () => {
      clearTimeout(inactivityTimer.current);
    };
  }, [selectedCompany, handlePopupClose]);

  // Remove forced filter - let user choose

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 space-y-6 min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Title text="Check Sauda List" />

        <div className="w-full max-w-md flex items-center gap-4 relative bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <InputBox
            name="company-search"
            placeholder="Search by company name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 transition-all duration-200 border border-green-300 dark:border-green-700 group shadow-sm hover:shadow-md"
            aria-label="Notifications"
          >
            <Handshake className="w-6 h-6 text-green-700 dark:text-green-300 transform transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          </button>

          {showNotifications && (
            <NotificationsPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <BuyerSellerFilter value={filterType} onChange={setFilterType} />

        {loading ? (
          <div className="w-full flex justify-center py-12">
            <Loading />
          </div>
        ) : (
          <>
            {filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full animate-in fade-in duration-300">
                {filteredCompanies.map((company) => {
                  const statusColor = saudaStatusMap[company.name] || "green";
                  const bgColor =
                    statusColor === "blue"
                      ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-400 dark:from-blue-900/40 dark:to-blue-800/30 dark:border-blue-600"
                      : statusColor === "yellow"
                      ? "bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-2 border-yellow-400 dark:from-yellow-900/40 dark:to-yellow-800/30 dark:border-yellow-600"
                      : "bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-400 dark:from-green-900/40 dark:to-green-800/30 dark:border-green-600";
                  const textColor =
                    statusColor === "blue"
                      ? "text-blue-700 dark:text-blue-300"
                      : statusColor === "yellow"
                      ? "text-yellow-700 dark:text-yellow-300"
                      : "text-green-700 dark:text-green-300";

                  return (
                    <div
                      key={company._id}
                      onClick={() => setSelectedCompany(company.name)}
                      className={`p-5 rounded-xl shadow-md hover:shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${bgColor}`}
                    >
                      <h2 className={`text-lg font-bold ${textColor} mb-1`}>
                        {company.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {company.category}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-medium">No companies found</p>
                <p className="text-sm mt-2">
                  {searchTerm
                    ? "Try adjusting your search or filter"
                    : "Please Update Rate for companies"}
                </p>
              </div>
            )}
          </>
        )}

        {selectedCompany && (
          <ManageCompanyPopup
            name={selectedCompany}
            onClose={(status) => handlePopupClose(selectedCompany, status)}
          />
        )}

        <Legend />
      </div>
    </Suspense>
  );
};

export default Sauda;
