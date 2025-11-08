"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance"; // ✅ ensure path correctness
import Dropdown from "@/components/common/Dropdown/Dropdown";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Title from "@/components/common/Title/Title";

const SellerCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/companies?type=seller&limit=10000");
        const { companies } = response.data;
        const companyOptions = companies?.map((c) => ({
          label: c.name,
          value: c._id,
        }));

        setCompanies(companyOptions || []);
      } catch (error) {
        console.error("Error fetching seller companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSelect = () => {
    if (!selectedSeller) {
      alert("Please select a seller company!");
      return;
    }

    const selectedName = companies.find((c) => c.value === selectedSeller)?.label;
    alert(`✅ Seller company selected: ${selectedName}`);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-6">
          <Title text="Seller Company" />
        </div>

        <Dropdown
          label="Seller Company"
          options={companies}
          value={selectedSeller}
          onChange={setSelectedSeller}
          placeholder={loading ? "Loading seller companies..." : "Choose a company"}
        />

        <button
          onClick={handleSelect}
          disabled={!selectedSeller}
          className={`mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
            selectedSeller
              ? "bg-yellow-600 hover:bg-yellow-700 shadow-md"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <CheckCircle size={18} />
          Confirm Selection
        </button>
      </motion.div>
    </div>
  );
};

export default SellerCompany;
