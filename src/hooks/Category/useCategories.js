"use client";

import { useState, useCallback, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 1000);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCategories = useCallback(async (page = 1, search = "") => {
    try {
      const res = await axiosInstance.get(
        `/categories?page=${page}&limit=10&search=${encodeURIComponent(search)}`
      );
      setCategories(res.data.categories || []);
      setTotalEntries(res.data.total);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories(currentPage, debouncedSearchQuery);
  }, [fetchCategories, currentPage, debouncedSearchQuery]);

  const updateCategory = useCallback(
    async (index, newName) => {
      const id = categories[index]._id;
      const res = await axiosInstance.put(`/categories/${id}`, {
        name: newName,
      });
      const updated = [...categories];
      updated[index].name = res.data.category.name;
      setCategories(updated);
    },
    [categories]
  );

  const deleteCategory = useCallback(
    async (index) => {
      const id = categories[index]._id;
      await axiosInstance.delete(`/categories/${id}`);
      const updated = [...categories];
      updated.splice(index, 1);
      setCategories(updated);
    },
    [categories]
  );

  return {
    categories,
    totalEntries,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    updateCategory,
    deleteCategory,
    fetchCategories,
  };
};

export default useCategories;
