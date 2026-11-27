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
import useRateGroups from "@/hooks/Rate/useRateGroups";
import useRateDisplayNotifications from "@/hooks/Rate/useRateDisplayNotifications";
import { toTitleCase } from "@/utils/formatName/formatName";
import RateGroupCard from "@/components/ui/Rate/RateGroupCard";

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
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  { suspense: true }
);

const Sauda = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [viewMode, setViewMode] = useState("group");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const inactivityTimer = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    companies,
    companyNameToId,
    saudaStatusMap,
    loading,
    hasRate,
    filterType,
    setFilterType,
    updateCompanyStatus,
    refreshSaudaData,
  } = useSaudaData();
  const {
    groups,
    filteredGroups,
    visibleGroups,
    loading: groupsLoading,
    error: groupsError,
    currentPage: groupPage,
    setCurrentPage: setGroupPage,
    totalGroups,
    itemsPerPage: groupsPerPage,
  } = useRateGroups(debouncedSearchTerm);
  const { notifications } = useRateDisplayNotifications();

  const filteredCompanies = useMemo(() => {
    if (!companies.length) return [];

    const searchLower = debouncedSearchTerm.toLowerCase();
    const filterLower = filterType.toLowerCase();

    return companies.filter((c) => {
      if (!hasRate(c._id)) return false;

      if (
        searchLower &&
        !c.name.toLowerCase().includes(searchLower)
      )
        return false;

      if (filterLower !== "all") {
        const types = Array.isArray(c.type) ? c.type : [c.type];
        if (!types.some((t) => t?.toLowerCase() === filterLower)) return false;
      }

      return true;
    });
  }, [companies, debouncedSearchTerm, filterType, hasRate]);

  const visibleCompanies = useMemo(() => {
    if (viewMode !== "group" || !selectedGroup) return filteredCompanies;

    const groupCompanyNames = new Set(
      (selectedGroup.companies || [])
        .map((company) => company?.name?.trim().toLocaleLowerCase())
        .filter(Boolean),
    );
    return filteredCompanies.filter((company) =>
      groupCompanyNames.has(company.name?.trim().toLocaleLowerCase()),
    );
  }, [filteredCompanies, selectedGroup, viewMode]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedGroup(null);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setGroupPage(1);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setGroupPage(1);
  };

  const handlePopupClose = useCallback(
    (companyId, status = null) => {
      setSelectedCompany(null);
      if (status) updateCompanyStatus(companyId, status);
      clearTimeout(inactivityTimer.current);
    },
    [updateCompanyStatus]
  );

  useEffect(() => {
    if (selectedCompany) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        handlePopupClose(selectedCompany._id);
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
              placeholder={
                viewMode === "group" && !selectedGroup
                  ? "Search groups or companies…"
                  : "Search by company name…"
              }
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setGroupPage(1);
              }}
            />
            <BuyerSellerFilter value={filterType} onChange={setFilterType} />
          </div>
        </div>
        <div className="w-full px-4 sm:px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Group Wise", value: "group" },
              { label: "Company Wise", value: "company" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleViewModeChange(option.value)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === option.value
                    ? "bg-emerald-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full px-4 sm:px-6 pb-4">
          <div className="flex flex-col lg:flex-row gap-4 h-[78vh] min-h-[540px]">
            <div className="w-full lg:w-3/4 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800">
                <h3 className="text-base font-semibold text-white">
                  {viewMode === "group" && !selectedGroup
                    ? `📋 Company Groups (${totalGroups})`
                    : selectedGroup
                    ? `📋 ${selectedGroup.name} (${visibleCompanies.length})`
                    : `📋 Companies (${filteredCompanies.length})`}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {viewMode === "group" && !selectedGroup ? (
                  groupsLoading ? (
                    <Loading />
                  ) : groupsError ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                    >
                      {groupsError}
                    </p>
                  ) : filteredGroups.length ? (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {visibleGroups.map((group) => (
                          <RateGroupCard
                            key={group._id}
                            group={group}
                            notifications={notifications}
                            onClick={() => handleGroupSelect(group)}
                          />
                        ))}
                      </div>
                      <Pagination
                        totalItems={totalGroups}
                        itemsPerPage={groupsPerPage}
                        currentPage={groupPage}
                        onPageChange={setGroupPage}
                        showPageNumbers
                      />
                    </>
                  ) : (
                    <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                      <p className="font-medium">No groups found</p>
                      <p className="mt-2 text-xs">
                        {groups.length
                          ? "Try adjusting your search"
                          : "Create a group from the Company menu"}
                      </p>
                    </div>
                  )
                ) : loading ? (
                  <Loading />
                ) : (
                  <>
                    {selectedGroup && (
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                        <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                          {selectedGroup.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleBackToGroups}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          Back to Groups
                        </button>
                      </div>
                    )}
                    {visibleCompanies.length > 0 ? (
                      <div
                        className="
                      grid gap-3
                      grid-cols-1
                      sm:grid-cols-2
                      md:grid-cols-3
                      xl:grid-cols-4
                    "
                      >
                        {visibleCompanies.map((company) => {
                          const statusColor =
                            saudaStatusMap[company._id] || "green";

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
                              onClick={() => setSelectedCompany(company)}
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
                                {toTitleCase(company.name)}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {company.category}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                        <p className="font-medium">No companies found</p>
                        <p className="mt-2 text-xs">
                          {searchTerm
                            ? "Try adjusting your search or filter"
                            : "Please update rate for companies"}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="w-full lg:w-1/4 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <NotificationsPanel />
              </div>
            </div>
          </div>
        </div>
        {selectedCompany && (
          <ManageCompanyPopup
            company={selectedCompany}
            companyNameToId={companyNameToId}
            onClose={(status) => handlePopupClose(selectedCompany._id, status)}
            onSaudaAdded={refreshSaudaData}
          />
        )}
      </div>
    </Suspense>
  );
};

export default Sauda;
