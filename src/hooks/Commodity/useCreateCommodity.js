"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export function useCreateCommodity() {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingCategories, setExistingCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/commodity")
      .then((res) => {
        if (res.data?.commodities && Array.isArray(res.data.commodities)) {
          const names = res.data.commodities
            .map((item) => item.category)
            .filter((name) => typeof name === "string" && name.trim() !== "");
          setExistingCategories(names);
        }
      })
      .catch(() => {
        toast.error("Failed to load existing commodities");
      });
  }, []);

  useEffect(() => {
    if (category.length > 1) {
      const filtered = existingCategories.filter(
        (name) =>
          typeof name === "string" &&
          name.toLowerCase().startsWith(category.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [category, existingCategories]);

  const handleChange = useCallback((e) => {
    setCategory(e.target.value);
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedCategory = category.trim();

    if (!trimmedCategory) {
      toast.error("Commodity name cannot be empty");
      return;
    }

    if (existingCategories.includes(trimmedCategory)) {
      toast.error("Commodity already exists");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/commodity", {
        name: trimmedCategory,
      });

      if (response.status === 201) {
        toast.success("Commodity saved successfully");
        setCategory("");
        setExistingCategories((prev) => [...prev, trimmedCategory]);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to save commodity";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [category, existingCategories]);

  return {
    commodity: category,
    setCommodity: setCategory,
    loading,
    suggestions,
    handleChange,
    handleSave,
  };
}
