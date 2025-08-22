"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

const useSellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [totalSellers, setTotalSellers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [formData, setFormData] = useState({ sellerName: "", companies: [] });
  const [editMode, setEditMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchSellers = useCallback(
    async (page = currentPage, search = searchQuery) => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/seller", {
          params: {
            page,
            limit: ITEMS_PER_PAGE,
            search,
          },
        });

        setSellers(res.data.sellers || []);
        setTotalSellers(res.data.total || 0);
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to fetch sellers");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, searchQuery]
  );

  useEffect(() => {
    fetchSellers();
  }, [currentPage, fetchSellers]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchSellers(1, searchQuery);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, fetchSellers]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleEdit = (seller) => {
    setSelectedSeller(seller);
    setFormData({
      sellerName: seller.sellerName,
      companies: seller.companies,
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleView = async (idOrSeller) => {
    try {
      const sellerId =
        typeof idOrSeller === "string" ? idOrSeller : idOrSeller._id;
      const res = await axiosInstance.get(`/seller/${sellerId}`);
      setSelectedSeller(res.data);
      setEditMode(false);
      setModalOpen(true);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to fetch seller details"
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "companies") {
      let companiesArr = [];
      if (Array.isArray(value)) {
        companiesArr = value;
      } else if (typeof value === "string") {
        companiesArr = value
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }
      setFormData((prev) => ({
        ...prev,
        companies: companiesArr,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updated = {
        sellerName: formData.sellerName.trim(),
        companies: formData.companies,
      };

      await axiosInstance.put(`/seller/${selectedSeller._id}`, updated);
      toast.success("Seller updated successfully");
      setModalOpen(false);
      setFormData({ sellerName: "", companies: [] });
      fetchSellers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update seller");
    }
  };

  const handleCreate = async () => {
    try {
      const newSeller = {
        sellerName: formData.sellerName.trim(),
        companies: formData.companies,
      };

      await axiosInstance.post("/seller", newSeller);
      toast.success("Seller created successfully");
      setModalOpen(false);
      setFormData({ sellerName: "", companies: [] });
      fetchSellers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create seller");
    }
  };

  const handleDelete = async (idOrSeller) => {
    const sellerId =
      typeof idOrSeller === "string" ? idOrSeller : idOrSeller._id;

    if (!window.confirm("Are you sure you want to delete this seller?")) return;

    try {
      await axiosInstance.delete(`/seller/${sellerId}`);
      toast.success("Seller deleted successfully");
      fetchSellers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete seller");
    }
  };

  const paginatedData = sellers;

  return {
    currentPage,
    totalSellers,
    ITEMS_PER_PAGE,
    paginatedData,
    modalOpen,
    selectedSeller,
    formData,
    editMode,
    handlePageChange,
    setModalOpen,
    handleEdit,
    handleView,
    handleSaveEdit,
    handleCreate,
    handleChange,
    handleDelete,
    searchQuery,
    setSearchQuery,
    loading,
  };
};

export default useSellerList;
