"use client";

import { useState, useCallback, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const useManageCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        q: debouncedQuery,
      });

      if (typeFilter !== "All") {
        query.append("type", typeFilter.toLowerCase());
      }

      const { data } = await axiosInstance.get(
        `/managecompany?${query.toString()}`
      );

      const companiesList = data.companies || [];

      const formatted = companiesList.map((comp) => ({
        ...comp,
        location: comp.location || [],
        commodities: comp.commodities || [],
        subCommodities: comp.subCommodities || [],
        mobileNumbers: comp.mobileNumbers || [],
      }));

      setCompanies(formatted);
      setTotalCompanies(data.total || 0);
    } catch (error) {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedQuery, typeFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    totalCompanies,
    loading,
    selectedCompany,
    editingCompany,
    showModal,
    setSelectedCompany,
    setEditingCompany,
    setShowModal,
    searchQuery,
    handleSearchChange: setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    fetchCompanies,
    typeFilter,
    setTypeFilter,
  };
};

export default useManageCompanyList;
