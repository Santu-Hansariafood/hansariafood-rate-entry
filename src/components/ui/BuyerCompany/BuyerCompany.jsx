"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance"; // ✅ make sure path is correct
import Dropdown from "@/components/common/Dropdown/Dropdown"; // ✅ your existing dropdown
import { motion } from "framer-motion";
import { Building2, CheckCircle } from "lucide-react";
import Title from "@/components/common/Title/Title";

const BuyerCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          "/companies?type=buyer&limit=10000"
        );
        const { companies } = response.data;
        const companyOptions = companies?.map((c) => ({
          label: c.name,
          value: c._id,
        }));

        setCompanies(companyOptions || []);
      } catch (error) {
        console.error("Error fetching buyer companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSelect = () => {
    if (!selectedBuyer) {
      alert("Please select a buyer company!");
      return;
    }

    const selectedName = companies.find(
      (c) => c.value === selectedBuyer
    )?.label;
    alert(`Buyer company selected: ${selectedName}`);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-6">
          <Title text="Buyer Company" />
        </div>

        <Dropdown
          label="Buyer Company"
          options={companies}
          value={selectedBuyer}
          onChange={setSelectedBuyer}
          placeholder={
            loading ? "Loading buyer companies..." : "Choose a company"
          }
        />

        <button
          onClick={handleSelect}
          disabled={!selectedBuyer}
          className={`mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
            selectedBuyer
              ? "bg-green-600 hover:bg-green-700 shadow-md"
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

export default BuyerCompany;
