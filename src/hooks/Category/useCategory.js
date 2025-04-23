"use client";

import { useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export function useCategory() {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setCategory(e.target.value);
  }, []);

  const handleSave = useCallback(async () => {
    if (!category.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/categories", {
        name: category,
      });
      if (response.status === 201) {
        toast.success("Category saved successfully");
        setCategory("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to save category";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [category]);

  return {
    category,
    loading,
    handleChange,
    handleSave,
  };
}
