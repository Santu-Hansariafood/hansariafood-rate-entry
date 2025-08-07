"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";

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
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  { loading: () => <Loading /> }
);

export default function Rate() {
  const { mobile } = useUser();

  const [allCompanies, setAllCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [completedCompanies, setCompletedCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const handleFilterChange = useCallback((newFilters) => {
    const selectedCategories = Object.values(newFilters);
    setFilters((prev) => ({
      ...prev,
      category: selectedCategories,
    }));
  }, []);

  const selectedCompanyObj = useMemo(() => {
    return allCompanies.find(
      (c) =>
        c.name.trim().toLowerCase() === selectedCompany?.trim().toLowerCase()
    );
  }, [allCompanies, selectedCompany]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (!value || value === "all") return;

        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.append(key, value);
        }
      });
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const { data } = await axiosInstance.get(`/managecompany?${params}`);
      setAllCompanies(data.companies);
      setTotalItems(data.total);

      const companyMap = {};
      const names = [];

      data.companies.forEach((c) => {
        names.push(c.name);
        companyMap[c.name] = c.commodities || [];
      });

      setCompanies(names);

      if (names.length > 0) {
        await checkAllCompanies(companyMap);
      }
    } catch {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  const checkAllCompanies = useCallback(async (companyCommoditiesMap) => {
    try {
      const statusMap = {};

      await Promise.all(
        Object.entries(companyCommoditiesMap).map(
          async ([company, commodities]) => {
            try {
              if (commodities.length === 0) {
                statusMap[company] = false;
                return;
              }

              const responses = await Promise.all(
                commodities.map(async (cmd) => {
                  try {
                    const { data } = await axiosInstance.get(
                      `/rate?company=${encodeURIComponent(
                        company
                      )}&commodity=${encodeURIComponent(cmd)}`
                    );
                    return data.every(
                      (r) => r.hasNewRateToday && r.commodity === cmd
                    );
                  } catch {
                    return false;
                  }
                })
              );

              statusMap[company] = responses.every(Boolean);
            } catch {
              statusMap[company] = false;
            }
          }
        )
      );

      setCompletedCompanies(statusMap);
    } catch (e) {
      console.error("Error in checkAllCompanies:", e);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (!selectedCompany) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }
  }, [selectedCompany]);

  const renderCompanySelector = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CompanyTypeFilter
        selectedType={filters.type}
        onChange={(type) =>
          setFilters((prev) => ({
            ...prev,
            type,
          }))
        }
      />

      <CompanyList
        companies={companies}
        completedCompanies={completedCompanies}
        loading={loading}
        onCompanySelect={setSelectedCompany}
      />
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );

  const renderRateTable = (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl relative">
          <button
            onClick={() => {
              setSelectedCompany(null);
            }}
            className="absolute top-2 right-2"
          >
            ✕
          </button>
          <RateTable
            selectedCompany={selectedCompany}
            commodities={selectedCompanyObj?.commodities || []} // 👈 all commodities
            onClose={() => {
              setSelectedCompany(null);
            }}
          />
        </div>
      </div>
    </Suspense>
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <ToastContainer position="top-right" />
        <Title text="Rate Management" />
        <CategoryCard onFilterChange={handleFilterChange} />
        {!selectedCompany && renderCompanySelector}
        {selectedCompany && renderRateTable}
      </div>
    </Suspense>
  );
}
