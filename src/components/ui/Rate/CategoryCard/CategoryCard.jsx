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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {categories.slice(0, 15).map((category, index) => {
            const isSelected = selectedFilters[category._id];

            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.04, duration: 0.4 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative rounded-2xl overflow-hidden border border-white/20 dark:border-white/10
                  bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-xl" />
                </div>

                <div className="relative z-10 p-6 flex flex-col items-center text-center gap-4">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                    {category.name}
                  </h3>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleFilterClick(category)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all
                      ${
                        isSelected
                          ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/30"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      }
                    `}
                  >
                    <motion.span
                      initial={false}
                      animate={{ rotate: isSelected ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </motion.span>

                    {isSelected ? "Selected" : "Add Filter"}
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
