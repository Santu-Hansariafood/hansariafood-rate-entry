"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const useSellerForm = () => {
  const [sellerName, setSellerName] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axiosInstance.get("/companies?limit=all");

        if (res.data && Array.isArray(res.data.companies)) {
          const sellerCompanies = res.data.companies.filter(
            (c) => Array.isArray(c.type) && c.type.includes("seller")
          );

          setCompanyOptions(
            sellerCompanies.map((c) => ({
              label: c.name,
              value: c.name,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        toast.error("Failed to load companies");
      }
    };

    fetchCompanies();
  }, []);

  const handleSave = async () => {
    if (!sellerName.trim()) {
      toast.warning("Seller name is required!");
      return;
    }
    if (selectedCompanies.length === 0) {
      toast.warning("Please select at least one company!");
      return;
    }

    const payload = { sellerName, companies: selectedCompanies };

    try {
      setLoading(true);
      const res = await axiosInstance.post("/seller", payload);
      toast.success(res.data.message || "Seller created successfully!");
      setSellerName("");
      setSelectedCompanies([]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create seller");
    } finally {
      setLoading(false);
    }
  };

  return {
    sellerName,
    setSellerName,
    companyOptions,
    selectedCompanies,
    setSelectedCompanies,
    handleSave,
    loading,
  };
};

export default useSellerForm;
