"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const ITEMS_PER_PAGE = 10;

const useSellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [totalSellers, setTotalSellers] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [formData, setFormData] = useState({ sellerName: "", companies: [] });
  const [saving, setSaving] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  const requestAbortRef = useRef(null);

  const fetchSellers = useCallback(
    async (page, query) => {
      try {
        if (requestAbortRef.current) {
          requestAbortRef.current.abort();
        }
        const controller = new AbortController();
        requestAbortRef.current = controller;

        const res = await axiosInstance.get("/seller", {
          signal: controller.signal,
          params: {
            page,
            limit: ITEMS_PER_PAGE,
            search: query || "",
          },
        });

        if (res.data && Array.isArray(res.data.sellers)) {
          const companiesSnapshot = companies;
          const processedSellers = res.data.sellers.map((seller) => {
            let processedCompanies = [];

            if (seller.companies && Array.isArray(seller.companies)) {
              if (typeof seller.companies[0] === "string") {
                processedCompanies = seller.companies.map((name) => ({ name }));
              } else if (typeof seller.companies[0] === "object") {
                processedCompanies = seller.companies.map((company) => {
                  if (company.name) return { name: company.name };
                  if (company.companyId) {
                    const match = companiesSnapshot.find(
                      (c) => c._id === company.companyId
                    );
                    return { name: match?.name || "Unknown" };
                  }
                  return { name: "Unknown" };
                });
              }
            }
            return { ...seller, companies: processedCompanies };
          });

          setSellers(processedSellers);
          setTotalSellers(res.data.total || 0);
        }
      } catch (error) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
          return;
        }
        console.error(error);
        toast.error("Failed to load sellers");
      }
    },
    [companies]
  );

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/companies", {
        params: { limit: "all" },
      });

      if (res.data && Array.isArray(res.data.companies)) {
        const sellerCompanies = res.data.companies.filter(
          (c) => Array.isArray(c.type) && c.type.includes("seller")
        );
        const sorted = sellerCompanies.sort((a, b) =>
          (a?.name || "").localeCompare(b?.name || "")
        );
        setCompanies(sorted);
        setCompanyOptions(
          sorted.map((c) => ({
            label: c?.name || "Unknown",
            value: c?.name || "Unknown",
          }))
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load companies");
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchSellers(currentPage, debouncedSearch);
    return () => {
      if (requestAbortRef.current) {
        requestAbortRef.current.abort();
      }
    };
  }, [currentPage, debouncedSearch, fetchSellers]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleEdit = (seller) => {
    setEditMode(true);
    const normalizedId = seller?._id || seller?.id;
    setSelectedSeller({ ...seller, _id: normalizedId });

    const companyNames =
      seller?.companies?.map((c) => {
        if (typeof c === "string") return c.trim();
        if (typeof c === "object" && c?.name) return c.name.trim();
        return String(c).trim();
      }).filter(Boolean) || [];

    setFormData({
      sellerName: seller?.sellerName || "",
      companies: companyNames,
    });
    setModalOpen(true);
  };

  const handleView = (sellerOrId) => {
    setEditMode(false);
    const isPrimitive =
      typeof sellerOrId === "string" || typeof sellerOrId === "number";
    const normalizedId = isPrimitive
      ? String(sellerOrId)
      : sellerOrId?._id || sellerOrId?.id;
    const normalizedSeller = isPrimitive
      ? { _id: normalizedId }
      : { ...sellerOrId, _id: normalizedId };
    setSelectedSeller(normalizedSeller);
    setModalOpen(true);
  };

  const refreshAfterDelete = async () => {
    const newTotal = Math.max(0, totalSellers - 1);
    const newTotalPages = Math.max(1, Math.ceil(newTotal / ITEMS_PER_PAGE));
    const nextPage = Math.min(currentPage, newTotalPages);

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
    } else {
      await fetchSellers(nextPage, debouncedSearch);
    }
  };

  const handleDelete = async (sellerOrId) => {
    try {
      const id =
        typeof sellerOrId === "string" || typeof sellerOrId === "number"
          ? String(sellerOrId)
          : sellerOrId?._id || sellerOrId?.id;
      if (!id) {
        toast.error("Missing seller id");
        return;
      }
      await axiosInstance.delete(`/seller/${id}`);
      toast.success("Seller deleted");
      await refreshAfterDelete();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete seller");
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.sellerName || !formData.sellerName.trim()) {
      toast.error("Seller name is required");
      return;
    }

    if (!formData.companies || !Array.isArray(formData.companies) || formData.companies.length === 0) {
      toast.error("At least one company is required");
      return;
    }

    const companyNames = formData.companies.map((c) => {
      if (typeof c === "string") return c.trim();
      if (typeof c === "object" && c?.name) return c.name.trim();
      if (typeof c === "object" && c?.value) return c.value.trim();
      return String(c).trim();
    }).filter(Boolean);

    if (companyNames.length === 0) {
      toast.error("At least one valid company is required");
      return;
    }

    const id = selectedSeller?._id || selectedSeller?.id;
    if (!id) {
      toast.error("Missing seller id");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sellerName: formData.sellerName.trim(),
        companies: companyNames,
      };
      
      const response = await axiosInstance.put(`/seller/${id}`, payload);
      
      if (response.data && response.status === 200) {
        toast.success("Seller updated successfully");
        setModalOpen(false);
        setEditMode(false);
        await fetchSellers(currentPage, debouncedSearch);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to update seller";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return {
    sellers,
    totalSellers,
    companies,
    companyOptions,
    currentPage,
    searchQuery,
    modalOpen,
    editMode,
    selectedSeller,
    formData,
    setFormData,
    setModalOpen,
    setEditMode,
    setSearchQuery,
    handlePageChange,
    handleEdit,
    handleView,
    handleDelete,
    handleSaveEdit,
    saving,
    ITEMS_PER_PAGE,
  };
};

export default useSellerList;
