"use client";

import { useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export function useCreateCommodity() {
  const [commodity, setCommodity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setCommodity(e.target.value);
  }, []);

  const handleSave = useCallback(async () => {
    if (!commodity.trim()) {
      toast.error("Commodity name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/commodity", {
        name: commodity,
      });

      if (response.status === 201) {
        toast.success("Commodity saved successfully");
        setCommodity("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to save commodity";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [commodity]);

  return {
    commodity,
    loading,
    handleChange,
    handleSave,
  };
}
