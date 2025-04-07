"use client";

import React, { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;

const CategoryCard = ({ onFilterChange }) => {
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
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.categories);
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.slice(0, 15).map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-800 truncate">
                  {category.name}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFilterClick(category)}
                  className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors duration-200 ${
                    selectedFilters[category._id]
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  {selectedFilters[category._id]
                    ? "Remove Filter"
                    : "Filter Category"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Suspense>
  );
};

export default CategoryCard;
