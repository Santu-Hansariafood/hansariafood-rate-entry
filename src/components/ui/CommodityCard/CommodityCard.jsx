'use client';

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

const STORAGE_KEY = process.env.NEXT_PUBLIC_COMMODITY_STORAGE_KEY || "selectedCommodities";

const getInitialFilters = () => {
  if (typeof window !== "undefined") {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (err) {
      console.error("Failed to parse filters from localStorage");
    }
  }
  return {};
};

const CommodityCard = ({ onFilterChange }) => {
  const [commodities, setCommodities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState(getInitialFilters);

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/commodity");
        setCommodities(response.data.commodities);
      } catch (error) {
        console.error("Error fetching commodities:", error);
        toast.error("Failed to load commodities");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommodities();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFilters));
    }
    if (onFilterChange) {
      onFilterChange(selectedFilters);
    }
  }, [selectedFilters, onFilterChange]);

  const handleFilterClick = useCallback((commodity) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      const isRemoving = !!newFilters[commodity._id];

      if (isRemoving) {
        delete newFilters[commodity._id];
      } else {
        newFilters[commodity._id] = commodity.name;
      }

      toast[isRemoving ? "info" : "success"](
        `${isRemoving ? "Filter removed" : "Filter added"}: ${commodity.name}`
      );

      return newFilters;
    });
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {commodities.slice(0, 15).map((commodity, index) => (
            <motion.div
              key={commodity._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-800 truncate">
                  {commodity.name}
                </h3>
                {commodity.subCategories && commodity.subCategories.length > 0 && (
                  <p className="text-xs text-gray-500 truncate">
                    {commodity.subCategories.join(", ")}
                  </p>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFilterClick(commodity)}
                  className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors duration-200 ${
                    selectedFilters[commodity._id]
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  {selectedFilters[commodity._id]
                    ? "Remove Filter"
                    : "Filter Commodity"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Suspense>
  );
};

export default CommodityCard;
