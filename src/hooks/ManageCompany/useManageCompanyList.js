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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/managecompany?page=${currentPage}&limit=${itemsPerPage}&q=${encodeURIComponent(
          debouncedQuery
        )}`
      );

      const transformed = (response.data.companies || []).map((company) => ({
        ...company,
        location: Array.isArray(company.location) ? company.location : [],
        commodities: Array.isArray(company.commodities)
          ? company.commodities
          : [],
        subCommodities: Array.isArray(company.subCommodities)
          ? company.subCommodities
          : [],
        mobileNumbers: Array.isArray(company.mobileNumbers)
          ? company.mobileNumbers
          : [],
      }));

      setCompanies(transformed);
      setTotalCompanies(response.data.total || 0);
    } catch (error) {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedQuery]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

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
    currentPage,
    itemsPerPage,
    setCurrentPage,
    fetchCompanies,
    handleSearchChange,
  };
};

export default useManageCompanyList;
