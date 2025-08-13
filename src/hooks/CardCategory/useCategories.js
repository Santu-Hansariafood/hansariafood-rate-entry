"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;

export default function useCategories(onFilterChange) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    }
    return {};
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/categories");
        setCategories(response.data.categories);
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
    if (onFilterChange) {
      onFilterChange(selectedFilters);
    }
  }, [selectedFilters]);

  const handleFilterClick = (category) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      const isRemoving = newFilters[category._id];

      if (isRemoving) {
        delete newFilters[category._id];
      } else {
        newFilters[category._id] = category.name;
      }

      return newFilters;
    });

    setTimeout(() => {
      if (selectedFilters[category._id]) {
        toast.info(`Filter removed: ${category.name}`);
      } else {
        toast.success(`Filter added: ${category.name}`);
      }
    }, 0);
  };

  return {
    categories,
    isLoading,
    selectedFilters,
    handleFilterClick,
  };
}
