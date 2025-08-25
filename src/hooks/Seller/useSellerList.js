"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import useDebouncedSearch from "@/hooks/useDebouncedSearch/useDebouncedSearch";

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

  const debouncedSearch = useDebouncedSearch(searchQuery, 350);
  const requestAbortRef = useRef(null);

  const fetchSellers = useCallback(
    async (page, query) => {
      try {
        if (requestAbortRef.current) {
          requestAbortRef.current.abort();
        }
        const controller = new AbortController();
        requestAbortRef.current = controller;

        const res = await axiosInstance.get(
          `/seller?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
            query || ""
          )}`,
          { signal: controller.signal }
        );

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
      const res = await axiosInstance.get("/companies?limit=all");
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
    // normalize id so subsequent operations have _id available
    const normalizedId = seller?._id || seller?.id;
    setSelectedSeller({ ...seller, _id: normalizedId });

    const companyNames =
      seller?.companies?.map((c) => c?.name).filter(Boolean) || [];

    setFormData({
      sellerName: seller?.sellerName || "",
      companies: companyNames,
    });
    setModalOpen(true);
  };

  const handleView = (seller) => {
    setEditMode(false);
    const normalizedId = seller?._id || seller?.id;
    setSelectedSeller({ ...seller, _id: normalizedId });
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

  const handleDelete = async (seller) => {
    try {
      const id = seller?._id || seller?.id;
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
    try {
      const id = selectedSeller?._id || selectedSeller?.id;
      if (!id) {
        toast.error("Missing seller id");
        return;
      }
      const payload = {
        sellerName: formData.sellerName.trim(),
        companies: formData.companies,
      };
      await axiosInstance.put(`/seller/${id}`, payload);
      toast.success("Seller updated");
      setModalOpen(false);
      await fetchSellers(currentPage, debouncedSearch);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update seller");
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
    setSearchQuery,
    handlePageChange,
    handleEdit,
    handleView,
    handleDelete,
    handleSaveEdit,
    ITEMS_PER_PAGE,
  };
};

export default useSellerList;
