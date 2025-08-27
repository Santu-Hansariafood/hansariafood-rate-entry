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
        if (filterType === "buyer") return company.type?.includes("buyer");
        if (filterType === "seller") return company.type?.includes("seller");
        return true;
      });
  }, [companies, rateData, searchTerm, hasRate, filterType]);

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

  useEffect(() => {
    if (filterType !== "buyer") {
      setFilterType("buyer");
    }
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 space-y-6 min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900">
        <Title text="Check Sauda List" />

        <div className="w-full max-w-md flex items-center gap-4 relative bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
          <InputBox
            name="company-search"
            placeholder="Search by company name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 transition border border-green-300 dark:border-green-700 group"
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
          <div className="flex-1 flex items-center justify-center w-full h-60">
            <Loading />
          </div>
        ) : (
          <>
            {filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                {filteredCompanies.map((company) => {
                  const statusColor = saudaStatusMap[company.name] || "green";
                  const bgColor =
                    statusColor === "blue"
                      ? "bg-blue-50 border-blue-400 dark:bg-blue-900/40 dark:border-blue-600"
                      : statusColor === "yellow"
                      ? "bg-yellow-50 border-yellow-400 dark:bg-yellow-900/40 dark:border-yellow-600"
                      : "bg-green-50 border-green-400 dark:bg-green-900/40 dark:border-green-600";
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
                      className={`p-4 rounded-xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform border ${bgColor}`}
                    >
                      <h2 className={`text-lg font-bold ${textColor}`}>
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
              <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                No companies found. Please Update Rate.
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
