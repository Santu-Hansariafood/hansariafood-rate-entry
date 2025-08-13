"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";
import useCategories from "@/hooks/CardCategory/useCategories";

const CategoryCard = ({ onFilterChange }) => {
  const { categories, isLoading, selectedFilters, handleFilterClick } =
    useCategories(onFilterChange);

  if (isLoading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.slice(0, 15).map((category, index) => {
            const isSelected = selectedFilters[category._id];
            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-700/50
                           backdrop-blur-md bg-gradient-to-br from-white/80 to-gray-100/60 
                           dark:from-gray-900/60 dark:to-gray-800/40"
              >
                <div className="p-5 flex flex-col items-center text-center">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate w-full">
                    {category.name}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilterClick(category)}
                    className={`mt-3 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md hover:from-red-600 hover:to-pink-600"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:from-blue-600 hover:to-indigo-600"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isSelected ? "Remove Filter" : "Filter Category"}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Suspense>
  );
};

export default CategoryCard;
