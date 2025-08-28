"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useRateManagement() {
  const [allCompanies, setAllCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [completedCompanies, setCompletedCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "buyer" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const itemsPerPage = 10;

  const selectedCompanyObj = useMemo(() => {
    return allCompanies.find(
      (c) =>
        c.name.trim().toLowerCase() === selectedCompany?.trim().toLowerCase()
    );
  }, [allCompanies, selectedCompany]);

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

      params.append("excludeTodayNoBuying", "true");

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
  }, [filters, currentPage, checkAllCompanies]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    document.body.style.overflow = selectedCompany ? "hidden" : "auto";
  }, [selectedCompany]);

  return {
    companies,
    completedCompanies,
    loading,
    selectedCompany,
    setSelectedCompany,
    selectedCompanyObj,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage,
  };
}
