"use client";

import { useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useCreateCompany() {
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [isSelfCompany, setIsSelfCompany] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async () => {
    const name = company.trim();
    const categoryValue = category.trim();
    const type = companyType.trim().toLowerCase();

    if (!name || !categoryValue || !["buyer", "seller"].includes(type)) {
      toast.error("All fields are required and must be valid");
      return;
    }

    try {
      setIsLoading(true);

      const { status } = await axiosInstance.post("/companies", {
        name,
        category: categoryValue,
        type,
        isSelfCompany,
      });

      if (status === 201) {
        toast.success("Company saved successfully");
        setCompany("");
        setCategory("");
        setCompanyType("");
        setIsSelfCompany(false);
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
    isSelfCompany,
    setIsSelfCompany,
    isLoading,
    handleSave,
  };
}
