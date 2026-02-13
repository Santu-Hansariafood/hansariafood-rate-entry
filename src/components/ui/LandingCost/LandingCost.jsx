"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IndianRupee, 
  Clock, 
  TrendingUp,
  History,
  Info,
  X
} from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));

export default function LandingCost() {
  const [landingRates, setLandingRates] = useState([]);
  const [landingLoading, setLandingLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLandingRates = async () => {
      try {
        setLandingLoading(true);
        setError(null);
        const res = await axiosInstance.get("/rate/today");
        setLandingRates(res.data || []);
      } catch (error) {
        console.error("Error fetching landing rates:", error);
        setError("Failed to fetch rates. Please try again later.");
      } finally {
        setLandingLoading(false);
      }
    };
    fetchLandingRates();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const isLoading = landingLoading;

  // Reset downstream selections when upstream changes
  useEffect(() => {
    setSelectedCommodity("");
    setSelectedCompany("");
    setSelectedLocation("");
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedCompany("");
    setSelectedLocation("");
  }, [selectedCommodity]);

  useEffect(() => {
    setSelectedLocation("");
  }, [selectedCompany]);

  // Options for dropdowns
  const categoryOptions = [
    { label: "Soya", value: "Soya" },
    { label: "M DOC", value: "M DOC" },
    { label: "DDGS", value: "DDGS" }
  ];

  const commodityOptions = useMemo(() => {
    if (!selectedCategory || !Array.isArray(landingRates)) return [];
    
    // Filter landingRates by category (commodity name match)
    const filtered = landingRates.filter(r => {
      const comm = r.commodity?.toLowerCase() || "";
      const cat = selectedCategory.toLowerCase();
      
      if (cat === "soya") return comm.includes("soya") || comm.includes("sbm");
      if (cat === "m doc") return comm.includes("mdoc") || comm.includes("m doc");
      if (cat === "ddgs") return comm.includes("ddgs");
      return false;
    });
    
    const uniqueCommodities = Array.from(new Set(filtered.map(r => r.commodity).filter(Boolean)));
    return uniqueCommodities.map(name => ({ label: name, value: name }));
  }, [selectedCategory, landingRates]);

  const companyOptions = useMemo(() => {
    if (!selectedCommodity || !selectedCategory || !Array.isArray(landingRates)) return [];
    const filtered = landingRates.filter(r => 
      r.commodity === selectedCommodity
    );
    const uniqueCompanies = Array.from(new Set(filtered.map(r => r.company).filter(Boolean)));
    return uniqueCompanies.map(name => ({ label: name, value: name }));
  }, [selectedCommodity, selectedCategory, landingRates]);

  const locationOptions = useMemo(() => {
    if (!selectedCompany || !selectedCommodity || !selectedCategory || !Array.isArray(landingRates)) return [];
    const filtered = landingRates.filter(r => 
      r.commodity === selectedCommodity && 
      r.company === selectedCompany
    );
    const uniqueLocations = Array.from(new Set(filtered.map(r => r.location).filter(Boolean)));
    return uniqueLocations.map(loc => ({ label: loc, value: loc }));
  }, [selectedCompany, selectedCommodity, selectedCategory, landingRates]);

  const finalRate = useMemo(() => {
    if (!selectedLocation || !selectedCompany || !selectedCommodity || !selectedCategory) return null;
    const rateData = landingRates.find(r => 
      r.commodity === selectedCommodity && 
      r.company === selectedCompany && 
      r.location === selectedLocation
    );

    if (!rateData) return null;

    return {
      ...rateData,
      rate: rateData.newRate, 
      date: rateData.lastUpdated,
      time: rateData.updateTime || "N/A"
    };
  }, [selectedLocation, selectedCompany, selectedCommodity, selectedCategory, landingRates]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
        <div className="text-center mb-12">
          <Title text="Landing Cost" />
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Select category, commodity, buyer company, and location to view real-time landing rates.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-10 mb-8 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <Dropdown
              label="1. Select Category"
              placeholder="Choose Category..."
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
            <Dropdown
              label="2. Select Commodity"
              placeholder="Choose Commodity..."
              options={commodityOptions}
              value={selectedCommodity}
              onChange={setSelectedCommodity}
              disabled={!selectedCategory}
            />
            <Dropdown
              label="3. Buyer company"
              placeholder="Choose Buyer company..."
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
              disabled={!selectedCommodity}
            />
            <Dropdown
              label="4. Select Location"
              placeholder="Choose Location..."
              options={locationOptions}
              value={selectedLocation}
              onChange={setSelectedLocation}
              disabled={!selectedCompany}
            />
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-10 text-center border-2 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-3xl"
              >
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-500">
                  <X size={32} />
                </div>
                <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Error Loading Data</h3>
                <p className="text-red-600 dark:text-red-500/70 mt-1">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Retry
                </button>
              </motion.div>
            ) : finalRate ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-12 p-8 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl text-white shadow-lg shadow-green-500/20"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-white/20 rounded-2xl backdrop-blur-md">
                      <TrendingUp size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {finalRate.commodity}
                        </span>
                        <p className="text-green-100 text-sm font-medium uppercase tracking-widest">Current Landing Rate</p>
                      </div>
                      <h3 className="text-4xl md:text-5xl font-black flex items-center gap-2">
                        <IndianRupee size={32} />
                        {finalRate.rate}
                        <span className="text-xl font-normal opacity-80">/MT</span>
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] uppercase opacity-60 mb-1">Updated At</p>
                      <p className="text-sm font-bold flex items-center gap-2">
                        <Clock size={14} /> {finalRate.time || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] uppercase opacity-60 mb-1">Date</p>
                      <p className="text-sm font-bold flex items-center gap-2">
                        <History size={14} /> {finalRate.date ? new Date(finalRate.date).toLocaleDateString('en-IN') : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : selectedCategory && !isLoading && commodityOptions.length === 0 ? (
              <motion.div
                key="no-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl"
              >
                <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Info size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Data Available</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">There are no rate updates for {selectedCategory} today.</p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl"
              >
                <p className="text-gray-400 font-medium">Please complete the selection above to view the rate.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brand Footer Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
                <TrendingUp size={24} />
             </div>
             <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Hansaria Food Private Limited</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reliable procurement through data-driven insights.</p>
             </div>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider">Live Market Data</span>
             </div>
          </div>
        </motion.div>
      </div>
    </Suspense>
  );
}
