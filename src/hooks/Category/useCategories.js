"use client";
import { useState, useCallback, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategories = useCallback(async (page = 1) => {
    try {
      const res = await axiosInstance.get(`/categories?page=${page}&limit=10`);
      setCategories(res.data.categories || []);
      setTotalEntries(res.data.total);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories(currentPage);
  }, [fetchCategories, currentPage]);

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
    updateCategory,
    deleteCategory,
    fetchCategories,
  };
};

export default useCategories;
