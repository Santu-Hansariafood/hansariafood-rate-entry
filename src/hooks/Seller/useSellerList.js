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

  // modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [formData, setFormData] = useState({ sellerName: "", companies: [] });
  const [editMode, setEditMode] = useState(false);

  // search state
  const [searchQuery, setSearchQuery] = useState("");

  /** 📌 Fetch sellers with pagination + search */
  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/seller", {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchQuery,
        },
      });

      setSellers(res.data.sellers || []);
      setTotalSellers(res.data.total || 0);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  /** 📌 Pagination */
  const handlePageChange = (page) => setCurrentPage(page);

  /** 📌 Edit seller (item is passed directly) */
  const handleEdit = (seller) => {
    setSelectedSeller(seller);
    setFormData({
      sellerName: seller.sellerName,
      companies: seller.companies,
    });
    setEditMode(true);
    setModalOpen(true);
  };

  /** 📌 View seller (Actions sends id only) */
  const handleView = async (idOrSeller) => {
    try {
      const sellerId = typeof idOrSeller === "string" ? idOrSeller : idOrSeller._id;
      const res = await axiosInstance.get(`/seller/${sellerId}`);
      setSelectedSeller(res.data);
      setEditMode(false);
      setModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch seller details");
    }
  };

  /** 📌 Form input change */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "companies") {
      let companiesArr = [];
      if (Array.isArray(value)) {
        companiesArr = value;
      } else if (typeof value === "string") {
        companiesArr = value.split(",").map((c) => c.trim()).filter(Boolean);
      }
      setFormData((prev) => ({
        ...prev,
        companies: companiesArr,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /** 📌 Save after edit */
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

  /** 📌 Create seller */
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

  /** 📌 Delete seller (Actions sends id only) */
  const handleDelete = async (idOrSeller) => {
    const sellerId = typeof idOrSeller === "string" ? idOrSeller : idOrSeller._id;

    if (!window.confirm("Are you sure you want to delete this seller?")) return;

    try {
      await axiosInstance.delete(`/seller/${sellerId}`);
      toast.success("Seller deleted successfully");
      fetchSellers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete seller");
    }
  };

  const paginatedData = sellers; // API already paginates

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
