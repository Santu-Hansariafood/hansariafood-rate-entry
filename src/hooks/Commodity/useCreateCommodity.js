"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export function useCreateCommodity() {
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [hasSubCategory, setHasSubCategory] = useState(false);
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

  const handleSubCategoryChange = useCallback((e) => {
    setSubCategory(e.target.value);
  }, []);

  const handleToggleSubCategory = useCallback(() => {
    setHasSubCategory((prev) => !prev);
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
        name: trimmedCategory,  // Changed from category to name
        subCategories: hasSubCategory ? [subCategory.trim()] : []  // Changed to match schema
      });

      if (response.status === 201) {
        toast.success("Commodity saved successfully");
        setCategory("");
        setSubCategory("");
        setHasSubCategory(false);
        setExistingCategories((prev) => [...prev, trimmedCategory]);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to save commodity";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [category, subCategory, hasSubCategory, existingCategories]);

  return {
    commodity: category,
    setCommodity: setCategory,
    subCategory,
    hasSubCategory,
    loading,
    suggestions,
    handleChange,
    handleSubCategoryChange,
    handleToggleSubCategory,
    handleSave,
  };
}
