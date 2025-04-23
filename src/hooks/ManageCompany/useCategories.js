"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchAllCategories = async () => {
      let all = [];
      let page = 1;
      let hasMore = true;

      try {
        while (hasMore) {
          const res = await axiosInstance.get(`/categories?page=${page}`);
          const data = Array.isArray(res.data)
            ? res.data
            : res.data.categories || [];

          if (data.length > 0) {
            all = [...all, ...data];
            page++;
          } else {
            hasMore = false;
          }
        }
        setCategories(all);
      } catch (error) {
        toast.error("Failed to fetch categories");
      }
    };

    fetchAllCategories();
  }, []);

  return categories;
}
