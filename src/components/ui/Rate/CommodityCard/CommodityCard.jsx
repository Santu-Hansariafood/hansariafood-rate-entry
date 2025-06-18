"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

const COMMODITY_STORAGE_KEY =
  process.env.NEXT_PUBLIC_COMMODITY_STORAGE_KEY || "selectedCommodities";

export default function CommodityCard({ onFilterChange, maxItems = 15 }) {
  const [commodities, setCommodities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFilters, setSelectedFilters] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(COMMODITY_STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const ctrl = new AbortController();

    const fetchCommodities = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get("/commodity?limit=100", {
          signal: ctrl.signal,
        });
        setCommodities(data.commodities);
      } catch (err) {
        if (!axiosInstance.isCancel(err)) {
          console.error(err);
          toast.error("Failed to load commodities");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommodities();
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        COMMODITY_STORAGE_KEY,
        JSON.stringify(selectedFilters)
      );
    }
    onFilterChange?.(selectedFilters);
  }, [selectedFilters, onFilterChange]);

  const handleFilterClick = useCallback((commodity) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      const isRemoving = Boolean(updated[commodity._id]);

      if (isRemoving) {
        delete updated[commodity._id];
        toast.info(`Filter removed: ${commodity.name}`);
      } else {
        updated[commodity._id] = commodity.name;
        toast.success(`Filter added: ${commodity.name}`);
      }
      return updated;
    });
  }, []);

  if (isLoading) return <Loading />;

  if (!commodities.length) {
    return <p className="text-center text-gray-500">No commodities found.</p>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {commodities.slice(0, maxItems).map((commodity, index) => (
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
                {selectedFilters[commodity._id] ? "Remove Filter" : "Filter Commodity"}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
