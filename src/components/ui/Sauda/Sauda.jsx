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
import Pagination from "@/components/common/Pagination/Pagination";
import { toTitleCase } from "@/utils/formatName/formatName";
import { Building2, Search } from "lucide-react";

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

const Sauda = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("company");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSearch, setGroupSearch] = useState("");
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
    loaded: groupsLoaded,
    error: groupsError,
    currentPage: groupPage,
    setCurrentPage: setGroupPage,
    totalGroups,
    itemsPerPage: groupsPerPage,
  } = useRateGroups(groupSearch);

  const groupedCompanyIds = useMemo(
    () =>
      new Set(
        groups.flatMap((group) =>
          (group.companies || [])
            .map((company) => company?._id?.toString())
            .filter(Boolean),
        ),
      ),
    [groups],
  );

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
    if (selectedGroup) {
      const selectedCompanyIds = new Set(
        (selectedGroup.companies || []).map((company) =>
          company?._id?.toString(),
        ),
      );
      return filteredCompanies.filter((company) =>
        selectedCompanyIds.has(company._id.toString()),
      );
    }

    return viewMode === "company"
      ? filteredCompanies.filter(
          (company) => !groupedCompanyIds.has(company._id.toString()),
        )
      : filteredCompanies;
  }, [filteredCompanies, groupedCompanyIds, selectedGroup, viewMode]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedGroup(null);
    setSelectedCompany(null);
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
              placeholder="Search by company name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <BuyerSellerFilter value={filterType} onChange={setFilterType} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-4 sm:px-6 pb-4">
          {[
            { label: "Company Wise", value: "company" },
            { label: "Group Wise", value: "group" },
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
        <div className="w-full px-4 sm:px-6 pb-4">
          <div className="flex flex-col lg:flex-row gap-4 h-[78vh] min-h-[540px]">
            <div className="w-full lg:w-3/4 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800">
                <h3 className="text-base font-semibold text-white">
                  {selectedGroup
                    ? `${selectedGroup.name} (${visibleCompanies.length})`
                    : viewMode === "group"
                      ? `📋 Company Groups (${totalGroups})`
                      : `📋 Companies (${visibleCompanies.length})`}
                </h3>
                {selectedGroup && (
                  <button
                    type="button"
                    onClick={() => setSelectedGroup(null)}
                    className="rounded-md border border-white/50 px-3 py-1 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Back to Groups
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {loading ||
                (viewMode === "company" && !groupsLoaded && !groupsError) ? (
                  <Loading />
                ) : viewMode === "group" && !selectedGroup ? (
                  <div className="space-y-4">
                    <label className="relative block w-full sm:max-w-sm">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="search"
                        value={groupSearch}
                        onChange={(event) => {
                          setGroupSearch(event.target.value);
                          setGroupPage(1);
                        }}
                        placeholder="Search groups or companies..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </label>
                    {groupsLoading ? (
                      <Loading />
                    ) : groupsError ? (
                      <p
                        role="alert"
                        className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                      >
                        {groupsError}
                      </p>
                    ) : filteredGroups.length ? (
                      <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                          {visibleGroups.map((group) => (
                            <button
                              key={group._id}
                              type="button"
                              onClick={() => setSelectedGroup(group)}
                              className="group flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40"
                            >
                              <span className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/50">
                                <Building2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                  {group.name}
                                </span>
                                <span className="block text-xs text-emerald-700 dark:text-emerald-300">
                                  {(group.companies || []).length} companies
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                        <Pagination
                          currentPage={groupPage}
                          totalItems={totalGroups}
                          itemsPerPage={groupsPerPage}
                          onPageChange={setGroupPage}
                          showPageNumbers
                        />
                      </>
                    ) : (
                      <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                        {groups.length
                          ? "No groups match your search."
                          : groupsLoaded
                            ? "No company groups found."
                            : "Loading groups..."}
                      </div>
                    )}
                  </div>
                ) : viewMode === "company" && groupsError ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                  >
                    {groupsError}
                  </p>
                ) : visibleCompanies.length > 0 ? (
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
