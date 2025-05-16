"use client";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export function useCommodityList() {
  const [commodities, setCommodities] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const fetchCommodities = useCallback(async (page = 1) => {
    try {
      const response = await axiosInstance.get(
        `/commodity?page=${page}&limit=10`
      );
      setCommodities(response.data.commodities || []);
      setTotalEntries(response.data.total);
    } catch (error) {
      console.error("Error fetching commodities", error);
    }
  }, []);

  useEffect(() => {
    fetchCommodities(currentPage);
  }, [fetchCommodities, currentPage]);

  const handleEdit = useCallback(
    (index, newName, newSubCategories) => {
      const id = commodities[index]._id;
      axiosInstance
        .put(`/commodity/${id}`, {
          name: newName,
          subCategories: newSubCategories,
        })
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

  const openModal = useCallback((type, data = null) => {
    setModal({ open: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, type: "", data: null });
  }, []);

  const handleView = useCallback((commodity) => {
    setSelectedCommodity(commodity);
  }, []);

  return {
    commodities,
    selectedCommodity,
    modal,
    currentPage,
    totalEntries,
    setCurrentPage,
    handleEdit,
    handleDelete,
    openModal,
    closeModal,
    handleView,
  };
}
