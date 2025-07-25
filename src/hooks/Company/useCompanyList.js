"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const ITEMS_PER_PAGE = 10;

const capitalizeWords = (str = "") =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

function useDebounce(value, delay = 1000) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function useCompanyList() {
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: [],
  });

  const fetchCompanies = useCallback(async (page = 1, search = "") => {
    try {
      const res = await axiosInstance.get(
        `/companies?page=${page}&limit=1000&search=${encodeURIComponent(search)}`
      );
      setCompanies(res.data.companies || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies(1, debouncedSearchQuery);
    setCurrentPage(1);
  }, [debouncedSearchQuery, fetchCompanies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesType = typeFilter ? company.type.includes(typeFilter) : true;
      return matchesType;
    });
  }, [companies, typeFilter]);

  const totalCompanies = filteredCompanies.length;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredCompanies.slice(start, end).map((company) => {
      const capitalizedName = capitalizeWords(company.name);
      const capitalizedCategory = capitalizeWords(company.category);
      const capitalizedType = Array.isArray(company.type)
        ? company.type.map(capitalizeWords).join(", ")
        : capitalizeWords(company.type || "");

      return {
        name: capitalizedName,
        category: capitalizedCategory,
        type: capitalizedType,
        actions: {
          title: capitalizedName,
          id: company._id,
          onDelete: () => handleDelete(company._id),
          onEdit: () => handleEdit(company),
          onView: () => handleView(company._id),
        },
      };
    });
  }, [filteredCompanies, currentPage]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= Math.ceil(totalCompanies / ITEMS_PER_PAGE)) {
        setCurrentPage(page);
      }
    },
    [totalCompanies]
  );

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

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

  const handleEdit = useCallback(
    (company) => {
      const index = companies.findIndex((c) => c._id === company._id);
      if (index === -1) return;

      setSelectedIndex(index);
      setSelectedCompany(company);
      setFormData({
        name: company.name,
        category: company.category,
        type: Array.isArray(company.type) ? company.type : [company.type],
      });

      setEditMode(true);
      setModalOpen(true);
    },
    [companies]
  );

  const handleSaveEdit = useCallback(async () => {
    if (selectedIndex === null) return;

    try {
      const id = companies[selectedIndex]._id;
      await axiosInstance.put(`/companies/${id}`, formData);
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
  }, [companies, selectedIndex, formData]);

  const handleDelete = useCallback(async (id) => {
    try {
      await axiosInstance.delete(`/companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    if (name === "type") {
      setFormData((prev) => {
        let updatedTypes = [...prev.type];
        if (checked) {
          if (!updatedTypes.includes(value)) updatedTypes.push(value);
        } else {
          updatedTypes = updatedTypes.filter((t) => t !== value);
        }
        return { ...prev, type: updatedTypes };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  return {
    currentPage,
    totalCompanies,
    ITEMS_PER_PAGE,
    paginatedData,
    modalOpen,
    selectedCompany,
    formData,
    editMode,
    searchQuery,
    setSearchQuery: handleSearchChange,
    handlePageChange,
    setModalOpen,
    handleSaveEdit,
    handleChange,
    typeFilter,
    setTypeFilter,
  };
}
