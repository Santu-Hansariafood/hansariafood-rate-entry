"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const STORAGE_KEY = "CATEGORY_FILTERS_STORAGE";

export default function useCategories(onFilterChange) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedFilters(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get("/categories");
        setCategories(res.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFilters));
    }

    if (typeof onFilterChange === "function") {
      onFilterChange(selectedFilters);
    }
  }, [selectedFilters]);

  const handleFilterClick = useCallback((category) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };

      if (newFilters[category._id]) {
        delete newFilters[category._id];
        toast.info(`Filter removed: ${category.name}`);
      } else {
        newFilters[category._id] = category.name;
        toast.success(`Filter added: ${category.name}`);
      }

      return newFilters;
    });
  }, []);

  return {
    categories,
    isLoading,
    selectedFilters,
    handleFilterClick,
  };
}
