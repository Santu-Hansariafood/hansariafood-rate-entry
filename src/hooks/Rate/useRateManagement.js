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

  const checkAllCompanies = useCallback((companyCommoditiesMap, rates) => {
    const statusMap = {};

    const rateMap = new Map();
    (Array.isArray(rates) ? rates : []).forEach((rate) => {
      if (!rate || !rate.company || !rate.commodity) return;
      const key = `${rate.company}|||${rate.commodity}`;
      const list = rateMap.get(key) || [];
      list.push(rate);
      rateMap.set(key, list);
    });

    Object.entries(companyCommoditiesMap).forEach(([company, commodities]) => {
      if (!Array.isArray(commodities) || commodities.length === 0) {
        statusMap[company] = false;
        return;
      }

      const allComplete = commodities.every((cmd) => {
        const key = `${company}|||${cmd}`;
        const list = rateMap.get(key) || [];
        return list.some(
          (r) => r.hasNewRateToday && r.commodity === cmd
        );
      });

      statusMap[company] = allComplete;
    });

    setCompletedCompanies(statusMap);
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
      setLoading(false);

      if (names.length > 0) {
        axiosInstance
          .get("/rate")
          .then((ratesRes) => {
            const allRates = Array.isArray(ratesRes.data)
              ? ratesRes.data
              : [];
            checkAllCompanies(companyMap, allRates);
          })
          .catch(() => {
            setCompletedCompanies({});
          });
      } else {
        setCompletedCompanies({});
      }
    } catch {
      toast.error("Failed to fetch companies");
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
