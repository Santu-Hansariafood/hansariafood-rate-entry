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
  { suspense: true }
);
const Legend = dynamic(() => import("@/components/ui/Sauda/Legend/Legend"), {
  suspense: true,
});

const Sauda = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const inactivityTimer = useRef(null);

  const {
    companies,
    saudaStatusMap,
    loading,
    hasRate,
    filterType,
    setFilterType,
    updateCompanyStatus,
  } = useSaudaData();

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => hasRate(c.name))
      .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((c) => {
        if (filterType === "all") return true;
        const types = Array.isArray(c.type) ? c.type : [c.type];
        return types.some((t) => t?.toLowerCase() === filterType.toLowerCase());
      });
  }, [companies, searchTerm, filterType, hasRate]);

  const handlePopupClose = useCallback(
    (companyName, status = null) => {
      setSelectedCompany(null);
      if (status) updateCompanyStatus(companyName, status);
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
    return () => clearTimeout(inactivityTimer.current);
  }, [selectedCompany, handlePopupClose]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full py-4 px-4 sm:px-6">
          <Title text="Check Sauda List" />
        </div>

        <div className="w-full px-4 sm:px-6 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <InputBox
              name="company-search"
              placeholder="Search by company name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <BuyerSellerFilter value={filterType} onChange={setFilterType} />
          </div>
        </div>

        <div className="w-full px-4 sm:px-6 pb-4">
          <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[540px]">
            <div className="w-full lg:w-3/4 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800">
                <h3 className="text-base font-semibold text-white">
                  📋 Companies ({filteredCompanies.length})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loading />
                  </div>
                ) : filteredCompanies.length > 0 ? (
                  <div
                    className="
                    grid gap-3
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    xl:grid-cols-4
                  "
                  >
                    {filteredCompanies.map((company) => {
                      const statusColor =
                        saudaStatusMap[company.name] || "green";

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
                          className={`
                            p-3 rounded-lg border shadow-sm cursor-pointer
                            transition-transform duration-200
                            hover:shadow-md hover:scale-[1.02]
                            ${bgColor}
                          `}
                        >
                          <h4
                            className={`text-sm font-bold mb-1 truncate ${textColor}`}
                          >
                            {company.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {company.category}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-10">
                    <p className="font-medium">No companies found</p>
                    <p className="text-xs mt-2">
                      {searchTerm
                        ? "Try adjusting your search or filter"
                        : "Please update rate for companies"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-1/4 min-h-[400px] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <NotificationsPanel />
            </div>
          </div>
        </div>

        {selectedCompany && (
          <ManageCompanyPopup
            name={selectedCompany}
            onClose={(status) => handlePopupClose(selectedCompany, status)}
          />
        )}

        <div className="w-full px-4 sm:px-6 pb-6 hidden sm:block">
          <Legend />
        </div>
      </div>
    </Suspense>
  );
};

export default Sauda;
