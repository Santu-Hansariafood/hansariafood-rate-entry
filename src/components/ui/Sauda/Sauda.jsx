"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useSaudaData from "@/hooks/SaudaData/useSaudaData";

const ManageCompanyPopup = dynamic(() =>
  import("@/components/ui/Sauda/ManageCompanyPopup/ManageCompanyPopup")
);
const Title = dynamic(() => import("@/components/common/Title/Title"));

const Sauda = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    companies,
    rateData,
    saudaStatusMap,
    loading,
    hasRate,
    updateCompanyStatus,
  } = useSaudaData();

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => hasRate(company.name))
      .filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [companies, rateData, searchTerm, hasRate]);

  const handlePopupClose = useCallback(
    (companyName, status = null) => {
      setSelectedCompany(null);
      if (status) {
        updateCompanyStatus(companyName, status);
      }
    },
    [updateCompanyStatus]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 space-y-6 min-h-screen flex flex-col items-center">
        <Title text="Check Sauda List" />

        <input
          type="text"
          placeholder="Search by company name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
                      ? "bg-blue-50 border-blue-400"
                      : statusColor === "yellow"
                      ? "bg-yellow-50 border-yellow-400"
                      : "bg-green-50 border-green-400";
                  const textColor =
                    statusColor === "blue"
                      ? "text-blue-700"
                      : statusColor === "yellow"
                      ? "text-yellow-700"
                      : "text-green-700";

                  return (
                    <div
                      key={company._id}
                      onClick={() => setSelectedCompany(company.name)}
                      className={`p-4 rounded-xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform border ${bgColor}`}
                    >
                      <h2 className={`text-lg font-bold ${textColor}`}>
                        {company.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {company.category}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No companies found Please Update Rate.
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

        <div className="mt-10 w-full max-w-4xl px-4">
          <Title text="Legend"/>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
              <span>Green: No Sauda entered yet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              <span>Yellow: Partial Sauda filled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
              <span>Blue: Sauda + Sauda No filled</span>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Sauda;
