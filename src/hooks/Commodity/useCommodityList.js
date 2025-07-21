"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export function useCommodityList() {
  const [commodities, setCommodities] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const openModal = useCallback((type, data = null) => {
    setModal({ open: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, type: "", data: null });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchCommodities = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `/commodity?page=${currentPage}&limit=10&q=${encodeURIComponent(
          debouncedQuery
        )}`
      );
      setCommodities(response.data.commodities || []);
      setTotalEntries(response.data.total);
    } catch (error) {
      console.error("Error fetching commodities", error);
    }
  }, [currentPage, debouncedQuery]);

  useEffect(() => {
    fetchCommodities();
  }, [fetchCommodities]);

  const handleEdit = useCallback(
    (index, newName) => {
      const id = commodities[index]._id;
      axiosInstance
        .put(`/commodity/${id}`, { name: newName })
        .then((res) => {
          const updated = [...commodities];
          updated[index] = res.data.commodity;
          setCommodities(updated);
          closeModal();
        })
        .catch((error) => console.error("Error updating commodity", error));
    },
    [commodities, closeModal]
  );

  const handleDelete = useCallback(
    (index) => {
      const id = commodities[index]._id;
      axiosInstance
        .delete(`/commodity/${id}`)
        .then(() => {
          const updated = [...commodities];
          updated.splice(index, 1);
          setCommodities(updated);
          closeModal();
        })
        .catch((error) => console.error("Error deleting commodity", error));
    },
    [commodities, closeModal]
  );

  const handleView = useCallback((commodity) => {
    setSelectedCommodity(commodity);
  }, []);

  return {
    commodities,
    selectedCommodity,
    modal,
    currentPage,
    totalEntries,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    handleEdit,
    handleDelete,
    openModal,
    closeModal,
    handleView,
  };
}
