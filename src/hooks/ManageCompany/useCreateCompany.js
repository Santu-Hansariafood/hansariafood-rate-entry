"use client";

import { useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useCreateCompany() {
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async () => {
    if (!company.trim() || !category.trim() || !companyType.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsLoading(true);

      const { status } = await axiosInstance.post("/companies", {
        name: company,
        category,
        type: companyType,
      });

      if (status === 201) {
        toast.success("Company saved successfully");
        setCompany("");
        setCategory("");
        setCompanyType("");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save company");
    } finally {
      setIsLoading(false);
    }
  }, [company, category, companyType]);

  return {
    company,
    setCompany,
    category,
    setCategory,
    companyType,
    setCompanyType,
    isLoading,
    handleSave,
  };
}
