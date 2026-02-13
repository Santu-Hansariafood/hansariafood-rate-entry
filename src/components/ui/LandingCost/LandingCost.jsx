"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp,
  Info,
  X,
  IndianRupee,
  Clock,
  History
} from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));

export default function LandingCost() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState("Feed Mills");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);

  const handleClear = () => {
    setSelectedCompany("");
    setSelectedCommodity("");
    setSelectedLocation("");
    setRates([]);
  };
  
  // Fetch companies from managecompany
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        // Using limit=1000 to get all companies in this category
        const res = await axiosInstance.get("/managecompany?category=Feed Mills&limit=1000");
        setCompanies(res.data?.companies || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to fetch companies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch rates when commodity is selected
  useEffect(() => {
    const fetchAllRates = async () => {
      if (!selectedCommodity) {
        setRates([]);
        return;
      }

      try {
        setRatesLoading(true);
        
        // Filter companies that deal with the selected commodity
        const filteredCompanies = companies.filter(company => {
          if (!company.commodities || !Array.isArray(company.commodities)) return false;
          return company.commodities.some(comm => 
            comm.toLowerCase().includes(selectedCommodity.toLowerCase())
          );
        });

        if (filteredCompanies.length === 0) {
          setRates([]);
          return;
        }

        // Fetch history for all filtered companies in parallel
        const historyPromises = filteredCompanies.map(company => 
          axiosInstance.get(`/ratehistory/${company._id}`)
            .then(res => ({
              companyName: company.name,
              data: res.data || []
            }))
            .catch(err => {
              console.error(`Error fetching history for ${company.name}:`, err);
              return { companyName: company.name, data: [] };
            })
        );

        const results = await Promise.all(historyPromises);
        
        // Flatten and filter for today's rates matching the selected commodity
        const todayStr = new Date().toISOString().split("T")[0];
        const allLocationRates = [];

        results.forEach(result => {
          result.data.forEach(r => {
            const commodityMatch = r.commodity.toLowerCase().includes(selectedCommodity.toLowerCase());
            const isUpdatedToday = r.newRate !== "" && r.newRate !== null;
            
            if (commodityMatch && isUpdatedToday) {
              allLocationRates.push({
                ...r,
                companyName: result.companyName
              });
            }
          });
        });

        // Sort by rate: High to Low
        allLocationRates.sort((a, b) => (parseFloat(b.newRate) || 0) - (parseFloat(a.newRate) || 0));

        setRates(allLocationRates);
      } catch (error) {
        console.error("Error fetching all rates:", error);
        setRates([]);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchAllRates();
  }, [selectedCommodity, companies]);

  // Reset downstream selections
  useEffect(() => {
    setSelectedCommodity("");
    setSelectedLocation("");
  }, [selectedCompany]);

  useEffect(() => {
    setSelectedLocation("");
  }, [selectedCommodity]);

  // Constants
  const VALID_COMMODITIES = ["soya", "ddgs", "mdoc", "sbm"];

  // Dropdown Options
  const categoryOptions = [{ label: "Feed Mills", value: "Feed Mills" }];

  const companyOptions = useMemo(() => {
    return companies
      .filter(company => {
        if (!company.commodities || !Array.isArray(company.commodities)) return false;
        return company.commodities.some(comm => 
          VALID_COMMODITIES.some(v => comm.toLowerCase().includes(v))
        );
      })
      .map(c => ({ label: c.name, value: c.name }));
  }, [companies]);

  const commodityOptions = useMemo(() => {
    if (!selectedCompany) {
      // If no company selected, show all valid commodities from any company
      const allComms = companies.flatMap(c => c.commodities || []);
      const uniqueComms = [...new Set(allComms)]
        .filter(comm => VALID_COMMODITIES.some(v => comm.toLowerCase().includes(v)));
      return uniqueComms.map(name => ({ label: name, value: name }));
    }
    
    const company = companies.find(c => c.name === selectedCompany);
    if (!company || !company.commodities) return [];
    
    return company.commodities
      .filter(comm => VALID_COMMODITIES.some(v => comm.toLowerCase().includes(v)))
      .map(name => ({ label: name, value: name }));
  }, [selectedCompany, companies]);

  const locationOptions = useMemo(() => {
    // Show unique locations from the fetched rates for the selected commodity
    if (rates.length > 0) {
      const uniqueLocations = [...new Set(rates.map(r => r.location))].sort();
      return uniqueLocations.map(loc => ({ label: loc, value: loc }));
    }
    return [];
  }, [rates]);

  const filteredDisplayRates = useMemo(() => {
    if (!selectedLocation) return rates;
    return rates.filter(r => r.location === selectedLocation);
  }, [rates, selectedLocation]);

  const isSelectionComplete = selectedCommodity;

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
        <div className="text-center mb-12">
          <Title text="Landing Cost" />
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Select category, buyer company, commodity, and location to manage landing cost details.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <Dropdown
              label="1. Select Category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
            <Dropdown
              label="2. Buyer company"
              placeholder="Choose Buyer company..."
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
              disabled={loading}
            />
            <Dropdown
              label="3. Select Commodity"
              placeholder="Choose Commodity..."
              options={commodityOptions}
              value={selectedCommodity}
              onChange={setSelectedCommodity}
            />
            <Dropdown
              label="4. Select Location"
              placeholder="Choose Location..."
              options={locationOptions}
              value={selectedLocation}
              onChange={setSelectedLocation}
              disabled={!selectedCommodity}
            />
          </div>

          <div className="mt-8 flex justify-end relative z-10">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
            >
              <X size={18} />
              Clear All
            </button>
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
            ) : ratesLoading ? (
              <div className="mt-12 flex justify-center">
                <Loading />
              </div>
            ) : filteredDisplayRates.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Today's {selectedCommodity} Rates
                  </h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {filteredDisplayRates.length} Rates Found
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDisplayRates.map((rate, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl text-white shadow-lg shadow-green-500/20"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                              <TrendingUp size={20} />
                            </div>
                            <div>
                              <p className="text-green-100 text-[10px] font-medium uppercase tracking-widest">{rate.companyName}</p>
                              <p className="text-sm font-bold">{rate.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <h4 className="text-2xl font-black flex items-center justify-end gap-1">
                              <IndianRupee size={18} />
                              {rate.newRate}
                            </h4>
                            <div className="flex flex-col items-end">
                              <p className="text-[10px] text-green-100 opacity-80">per MT</p>
                              {rate.oldRate > 0 && (
                                <p className="text-[10px] text-red-200 line-through opacity-60">Prev: ₹{rate.oldRate}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2 text-[10px] opacity-80">
                            <Clock size={12} />
                            Today
                          </div>
                          <div className="flex items-center gap-2 text-[10px] opacity-80 justify-end">
                            <History size={12} />
                            {new Date(rate.date).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : selectedLocation && !ratesLoading ? (
              <motion.div
                key="no-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl"
              >
                <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Info size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Rate Updated</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">There is no rate update for {selectedCommodity} today.</p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl"
              >
                <p className="text-gray-400 font-medium">Please complete the selection above to continue.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
