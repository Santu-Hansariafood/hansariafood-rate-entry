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
  
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
        
        // Filter companies that deal with the selected commodity or its base type
        const filteredCompanies = companies.filter(company => {
          if (!company.commodities || !Array.isArray(company.commodities)) return false;
          
          return company.commodities.some(comm => {
            const cLower = comm.toLowerCase();
            const sLower = selectedCommodity.toLowerCase();
            
            // Direct match or substring
            if (cLower.includes(sLower) || sLower.includes(cLower)) return true;
            
            // Base type match (e.g., if selected is "SBM 50%", match companies with "SBM")
            const baseTypes = ["soya", "ddgs", "mdoc", "sbm"];
            const selectedBase = baseTypes.find(b => sLower.includes(b));
            if (!selectedBase) return false;
            
            return cLower.includes(selectedBase);
          });
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
        
        // Generate rates for all filtered companies and their locations
        const allLocationRates = [];

        filteredCompanies.forEach(company => {
          const companyHistory = results.find(res => res.companyName === company.name)?.data || [];
          
          // Show all locations for each company that deals with this commodity
          company.location.forEach(loc => {
            const existingRate = companyHistory.find(r => 
              r.location === loc && 
              (r.commodity.toLowerCase().includes(selectedCommodity.toLowerCase()) || 
               selectedCommodity.toLowerCase().includes(r.commodity.toLowerCase()))
            );

            allLocationRates.push({
              companyName: company.name,
              location: loc,
              commodity: selectedCommodity,
              newRate: existingRate?.newRate || "",
              oldRate: existingRate?.oldRate || 0,
              date: existingRate?.date || new Date().toISOString().split("T")[0],
              ...existingRate
            });
          });
        });

        // Sort by rate (lowest to highest), putting N/A rates at the end
        allLocationRates.sort((a, b) => {
          const rateA = parseFloat(a.newRate) || parseFloat(a.oldRate) || 0;
          const rateB = parseFloat(b.newRate) || parseFloat(b.oldRate) || 0;
          
          if (rateA === 0 && rateB !== 0) return 1;
          if (rateA !== 0 && rateB === 0) return -1;
          return rateA - rateB;
        });

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

  // Fetch specific history when location is selected
  useEffect(() => {
    const fetchSpecificHistory = async () => {
      if (!selectedCompany || !selectedCommodity || !selectedLocation) {
        setHistory([]);
        return;
      }

      try {
        setHistoryLoading(true);
        const company = companies.find(c => c.name === selectedCompany);
        if (!company) return;

        const res = await axiosInstance.get(`/ratehistory/${company._id}?fullHistory=true`);
        const allData = res.data || [];
        
        // Find the doc matching location and commodity
        const match = allData.find(d => 
          d.location === selectedLocation && 
          d.commodity.toLowerCase().includes(selectedCommodity.toLowerCase())
        );

        if (match && match.history) {
          // Sort history by date descending
          const sortedHistory = [...match.history].sort((a, b) => new Date(b.date) - new Date(a.date));
          setHistory(sortedHistory);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Error fetching specific history:", error);
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchSpecificHistory();
  }, [selectedCompany, selectedCommodity, selectedLocation, companies]);

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
    if (!selectedCompany) return [];
    const company = companies.find(c => c.name === selectedCompany);
    if (!company || !company.commodities) return [];
    
    return company.commodities
      .filter(comm => VALID_COMMODITIES.some(v => comm.toLowerCase().includes(v)))
      .map(name => ({ label: name, value: name }));
  }, [selectedCompany, companies]);

  const locationOptions = useMemo(() => {
    if (!selectedCompany) return [];
    const company = companies.find(c => c.name === selectedCompany);
    if (!company || !company.location) return [];
    
    return company.location.map(loc => ({ label: loc, value: loc }));
  }, [selectedCompany, companies]);

  const isSelectionComplete = selectedCompany && selectedCommodity && selectedLocation;

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
              disabled={!selectedCompany}
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
            ) : rates.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Latest {selectedCommodity} Market Rates
                  </h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {rates.length} Rates Found
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rates.map((rate, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-3xl text-white shadow-lg ${
                        rate.newRate || rate.oldRate 
                          ? "bg-gradient-to-br from-green-600 to-green-700 shadow-green-500/20" 
                          : "bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-500/20"
                      }`}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                              <TrendingUp size={20} />
                            </div>
                            <div>
                              <p className="text-green-100 text-[10px] font-medium uppercase tracking-widest opacity-70">{rate.companyName}</p>
                              <p className="text-sm font-bold">{rate.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <h4 className="text-2xl font-black flex items-center justify-end gap-1">
                              <IndianRupee size={18} />
                              {rate.newRate || rate.oldRate || "N/A"}
                            </h4>
                            <div className="flex flex-col items-end">
                              <p className="text-[10px] text-green-100 opacity-80">per MT</p>
                              {rate.newRate && rate.oldRate > 0 && (
                                <p className="text-[10px] text-red-200 line-through opacity-60">Prev: ₹{rate.oldRate}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2 text-[10px] opacity-80">
                            <Clock size={12} />
                            {rate.newRate ? "Today" : (rate.oldRate ? "Latest Available" : "No Rate Available")}
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

                {/* Specific Selection History */}
                {selectedLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rate History</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Showing historical rates for {selectedCompany} at {selectedLocation}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <History size={14} />
                        {history.length} Records
                      </div>
                    </div>

                    {historyLoading ? (
                      <div className="flex justify-center py-12">
                        <Loading />
                      </div>
                    ) : history.length > 0 ? (
                      <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Previous Rate</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Final Rate</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Changes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {history.map((h, i) => {
                              const diff = h.finalRate - h.oldRate;
                              return (
                                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                        <Clock size={14} />
                                      </div>
                                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                        {new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    ₹{h.oldRate || 0}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                      ₹{h.finalRate || 0}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {diff !== 0 ? (
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        diff > 0 
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      }`}>
                                        {diff > 0 ? "+" : ""}{diff}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <p className="text-gray-500 dark:text-gray-400">No historical data available for this selection.</p>
                      </div>
                    )}
                  </motion.div>
                )}
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
