"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const Loading = dynamic(() => import("@/components/common/Loading/Loading"));
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const SearchBox = dynamic(
  () => import("@/components/common/SearchBox/SearchBox"),
  { ssr: false, loading: () => <Loading /> }
);
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  { loading: () => <Loading /> }
);
const Modal = dynamic(() => import("@/components/common/Modal/Modal"), {
  loading: () => <Loading />,
});
const SaudaDetails = dynamic(
  () => import("@/components/ui/SelfCompany/SaudaDetails/SaudaDetails"),
  { loading: () => <Loading /> }
);

const ITEMS_PER_PAGE = 12;

function useDebounce(value, delay = 600) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const SelfCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const debouncedSearch = useDebounce(search, 700);

  const fetchSelfCompanies = useCallback(async (p = 1, q = "") => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/managecompany?self=1&page=${p}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
          q
        )}`
      );
      setCompanies(res?.data?.companies || []);
      setTotal(res?.data?.total || 0);
    } catch (error) {
      console.error("Error fetching self companies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchSelfCompanies(page, debouncedSearch);
  }, [page, debouncedSearch, fetchSelfCompanies]);

  const cards = useMemo(() => {
    return (companies || []).map((c) => ({
      id: c._id,
      name: c.name,
      state: c.state,
      category: c.category,
      types: Array.isArray(c.type) ? c.type : [c.type].filter(Boolean),
      locations: Array.isArray(c.location) ? c.location : [],
      commodities: Array.isArray(c.commodities) ? c.commodities : [],
      subCommodities: Array.isArray(c.subCommodities) ? c.subCommodities : [],
    }));
  }, [companies]);

  return (
    <div className="p-4 md:p-6 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
      <Title text="Self Companies" />

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-green-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-sm text-green-900 dark:text-green-300">
          Showing {Math.min(ITEMS_PER_PAGE, cards.length)} of {total}
        </div>
        <div className="w-full md:w-1/2">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search self company..."
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loading />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          No self companies found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
              onClick={() => setSelectedCompany(card.name)}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {card.name}
                </h3>
                {card.state && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800">
                    {card.state}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {card.types.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                  >
                    {t}
                  </span>
                ))}
                {card.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                    {card.category}
                  </span>
                )}
              </div>

              {!!card.locations.length && (
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Locations:</span>{" "}
                  {card.locations.slice(0, 3).join(", ")}
                  {card.locations.length > 3 && (
                    <span className="ml-1 text-gray-400">
                      +{card.locations.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {!!card.commodities.length && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Commodities:</span>{" "}
                  {card.commodities.slice(0, 3).join(", ")}
                  {card.commodities.length > 3 && (
                    <span className="ml-1 text-gray-400">
                      +{card.commodities.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {!!card.subCommodities.length && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Sub-commodities:</span>{" "}
                  {card.subCommodities.slice(0, 3).join(", ")}
                  {card.subCommodities.length > 3 && (
                    <span className="ml-1 text-gray-400">
                      +{card.subCommodities.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pt-4">
        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>

      {selectedCompany && (
        <Modal
          onClose={() => setSelectedCompany(null)}
          className="w-[96vw] max-w-6xl"
        >
          <div className="p-4 md:p-6 text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                Sauda History - {selectedCompany}
              </h2>
              <button
                className="text-sm px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setSelectedCompany(null)}
              >
                Close
              </button>
            </div>
            <SaudaDetails companyName={selectedCompany} />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SelfCompany;
