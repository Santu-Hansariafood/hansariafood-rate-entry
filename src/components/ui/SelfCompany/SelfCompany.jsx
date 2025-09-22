"use client";

import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X, Building2, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";
import Purchase from "./Purchase/Purchase";
import Title from "@/components/common/Title/Title";
import Loading from "@/components/common/Loading/Loading";
import InputBox from "@/components/common/InputBox/InputBox";

const SelfCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [mode, setMode] = useState("combined");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchSelfCompanies = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/managecompany?self=true&limit=50");
      setCompanies(res.data?.companies || []);
    } catch (error) {
      console.error("Error fetching self companies:", error);
      toast.error(error.response?.data?.error || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setMode("combined");
    setFromDate("");
    setToDate("");
  };

  useEffect(() => {
    fetchSelfCompanies();
  }, []);

  // Filtered companies by search
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  // Status mapping with icons
  const getStatus = (company) => {
    const status = company.status || "green"; // fallback
    switch (status) {
      case "yellow":
        return {
          bg: "from-yellow-400 to-yellow-500",
          icon: <AlertTriangle className="w-5 h-5 mr-2" />,
        };
      case "blue":
        return {
          bg: "from-blue-400 to-blue-500",
          icon: <Info className="w-5 h-5 mr-2" />,
        };
      default:
        return {
          bg: "from-green-500 to-emerald-600",
          icon: <CheckCircle className="w-5 h-5 mr-2" />,
        };
    }
  };

  return (
    <div className="p-4">
      <Title text="Self Companies" />
      <div className="w-full max-w-md mx-auto my-4">
        <InputBox
          name="company-search"
          placeholder="Search by company name…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading />
      ) : filteredCompanies.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">
          No self companies found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {filteredCompanies.map((company) => {
            const { bg, icon } = getStatus(company);
            return (
              <motion.button
                key={company._id}
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center justify-center px-5 py-3 rounded-xl 
                  bg-gradient-to-r ${bg} text-white font-semibold shadow-lg 
                  transition-all duration-300`}
                onClick={() => setSelectedCompany(company)}
              >
                {icon}
                <Building2 className="w-5 h-5 mr-2 opacity-80" />
                {company.name}
              </motion.button>
            );
          })}
        </div>
      )}

      {selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-5xl h-[85%] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Sauda History - {selectedCompany.name}
              </h3>
              <button
                onClick={() => setSelectedCompany(null)}
                className="hover:text-red-300 transition"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow">
                <div className="flex gap-2 flex-wrap">
                  {["purchase", "sell", "combined"].map((opt) => (
                    <motion.button
                      key={opt}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMode(opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        mode === opt
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </motion.button>
                  ))}
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 
                               text-white font-medium shadow hover:from-gray-700 hover:to-gray-800 
                               transform transition-all duration-200"
                  >
                    Clear
                  </motion.button>
                </div>
              </div>
              <Purchase
                company={selectedCompany?.name}
                mode={mode}
                fromDate={fromDate}
                toDate={toDate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfCompany;
