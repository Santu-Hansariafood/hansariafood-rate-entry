"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useCreateCompany() {
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!company.trim() || !category.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsLoading(true);
      const { status } = await axiosInstance.post("/companies", {
        name: company,
        category,
      });

      if (status === 201) {
        toast.success("Company saved successfully");
        setCompany("");
        setCategory("");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save company");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    company,
    setCompany,
    category,
    setCategory,
    isLoading,
    handleSave,
  };
}
