"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const ITEMS_PER_PAGE = 10;

export default function useCompanyList() {
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "" });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axiosInstance.get(
          `/companies?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        setCompanies(res.data.companies || []);
        setTotalCompanies(res.data.total || 0);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, [currentPage]);

  const handleDelete = useCallback(async (id) => {
    try {
      await axiosInstance.delete(`/companies/${id}`);
      setCompanies((prev) => prev.filter((company) => company._id !== id));
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  }, []);

  const handleEdit = useCallback(
    (company) => {
      const index = companies.findIndex((c) => c._id === company._id);
      setSelectedIndex(index);
      setSelectedCompany(company);
      setFormData({ name: company.name, category: company.category });
      setEditMode(true);
      setModalOpen(true);
    },
    [companies]
  );

  const handleSaveEdit = useCallback(async () => {
    if (selectedIndex === null) return;

    try {
      await axiosInstance.put(
        `/companies/${companies[selectedIndex]._id}`,
        formData
      );
      setCompanies((prev) => {
        const updated = [...prev];
        updated[selectedIndex] = { ...updated[selectedIndex], ...formData };
        return updated;
      });
      setModalOpen(false);
      setEditMode(false);
      setSelectedIndex(null);
    } catch (error) {
      console.error("Error updating company:", error);
    }
  }, [formData, selectedIndex, companies]);

  const handleView = useCallback(async (id) => {
    try {
      const res = await axiosInstance.get(`/companies/${id}`);
      setSelectedCompany(res.data);
      setEditMode(false);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  }, []);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= Math.ceil(totalCompanies / ITEMS_PER_PAGE)) {
        setCurrentPage(page);
      }
    },
    [totalCompanies]
  );

  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  const paginatedData = useMemo(() => {
    return companies.map((company) => {
      const capitalizedName = capitalizeWords(company.name);
      const capitalizedCategory = capitalizeWords(company.category);
      return {
        name: capitalizedName,
        category: capitalizedCategory,
        actions: {
          title: capitalizedName,
          id: company._id,
          onDelete: () => handleDelete(company._id),
          onEdit: () => handleEdit(company),
          onView: () => handleView(company._id),
        },
      };
    });
  }, [companies, handleDelete, handleEdit, handleView]);

  return {
    currentPage,
    totalCompanies,
    ITEMS_PER_PAGE,
    paginatedData,
    modalOpen,
    selectedCompany,
    formData,
    editMode,
    handlePageChange,
    setModalOpen,
    handleSaveEdit,
    handleChange,
  };
}
