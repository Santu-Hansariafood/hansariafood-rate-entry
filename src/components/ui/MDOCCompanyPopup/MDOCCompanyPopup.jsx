"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, ChevronDown, ChevronUp, MapPin, Truck, IndianRupee } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));

export default function MDOCCompanyPopup({ isOpen, onClose, data, onRateUpdate }) {
  const [expandedLocations, setExpandedLocations] = useState([]);
  const [rates, setRates] = useState({});
  const [editing, setEditing] = useState({});
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [destinationLocations, setDestinationLocations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState({});
  const [freightRates, setFreightRates] = useState({});

  const today = new Date().toLocaleDateString("en-GB");

  useEffect(() => {
    if (!isOpen || !data?._id) return;
    loadExistingHistory();
    fetchDestinationLocations();
  }, [isOpen, data]);

  const fetchDestinationLocations = async () => {
    try {
      const res = await axiosInstance.get("/managecompany", {
        params: { type: "buyer", limit: 1000 },
      });
      const companies = res.data?.companies || [];
      const locations = [...new Set(companies.flatMap((c) => c.location))].sort();
      setDestinationLocations(locations);
    } catch (err) {
      console.error("Error fetching destinations:", err);
    }
  };

  const fetchFreightRate = async (sourceLoc, destLoc, commodity) => {
    try {
      // Find freight rate between source and destination for the commodity
      // The commodity in Freight model is simple (Soya, M DOC, Maize DDGS)
      const baseCommodity = "M DOC"; 
      
      const res = await axiosInstance.get("/freight", {
        params: {
          commodity: baseCommodity,
          limit: 1000,
        }
      });
      
      const allFreights = res.data?.freights || [];
      const match = allFreights.find(f => 
        f.location === sourceLoc && 
        f.deliveryLocation === destLoc
      );
      
      return match ? match.freightRate : 0;
    } catch (err) {
      console.error("Error fetching freight rate:", err);
      return 0;
    }
  };

  const handleDestinationChange = async (sourceLoc, index, destLoc) => {
    const key = `${sourceLoc}_${index}`;
    setSelectedDestinations((prev) => ({
      ...prev,
      [key]: destLoc,
    }));

    // If not already in editing mode, activate it so the user can see the Save button
    if (!editing[key]) {
      setEditing((prev) => ({
        ...prev,
        [key]: true,
      }));
    }

    if (destLoc) {
      const item = rates[sourceLoc][index];
      const rate = await fetchFreightRate(sourceLoc, destLoc, item.commodity);
      setFreightRates(p => ({
        ...p,
        [`${sourceLoc}_${index}`]: rate
      }));
    } else {
      setFreightRates(p => ({
        ...p,
        [`${sourceLoc}_${index}`]: 0
      }));
    }
  };

  const loadExistingHistory = async () => {
    try {
      setLoadingFetch(true);
      const res = await axiosInstance.get(`/ratehistory/${data._id}`);
      const history = res.data || [];

      const initial = {};
      const initialDestinations = {};
      const initialFreightRates = {};

      data.location.forEach((loc) => {
        initial[loc] = data.commodities.map((commodity, index) => {
          const entry = history.find(
            (r) => r.location === loc && r.commodity === commodity
          );

          if (entry?.destinationLocation) {
            initialDestinations[`${loc}_${index}`] = entry.destinationLocation;
            initialFreightRates[`${loc}_${index}`] = entry.freightRate || 0;
          }

          return {
            commodity,
            oldRate: entry?.oldRate || 0,
            tempRate: "",
            tempRates: entry?.tempRates || [],
            finalRate: entry?.newRate || "",
            others: entry?.others || "",
          };
        });
      });

      setRates(initial);
      setSelectedDestinations(initialDestinations);
      setFreightRates(initialFreightRates);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoadingFetch(false);
    }
  };

  const toggleLocation = (loc) => {
    setExpandedLocations((p) =>
      p.includes(loc) ? p.filter((x) => x !== loc) : [...p, loc]
    );
  };

  const toggleEdit = (loc, index) => {
    setEditing((p) => ({
      ...p,
      [`${loc}_${index}`]: !p[`${loc}_${index}`],
    }));
  };

  const handleChange = (loc, index, value) => {
    setRates((p) => {
      const copy = { ...p };
      copy[loc][index].tempRate = value;
      return copy;
    });
  };

  const handleSave = async (loc, index) => {
    const item = rates[loc][index];
    const destination = selectedDestinations[`${loc}_${index}`] || "";
    const freight = freightRates[`${loc}_${index}`] || 0;

    // Allow save if there is a temp rate OR a destination selected
    if (!item.tempRate && !destination) {
      // If nothing to save, just toggle back to view mode
      toggleEdit(loc, index);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        locationName: loc,
        commodityName: item.commodity,
        destinationLocation: destination,
        freightRate: freight,
      };

      // Only include tempRate if it has a value
      if (item.tempRate) {
        payload.tempRate = item.tempRate;
      }

      await axiosInstance.post(`/ratehistory/${data._id}`, payload);

      if (onRateUpdate) {
        onRateUpdate({
          companyName: data.name,
          location: loc,
          date: today,
          rate: item.tempRate,
          commodity: item.commodity,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }

      toggleEdit(loc, index);
      loadExistingHistory();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoadingSave(false);
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-100"
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <MapPin className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{data.name}</h2>
              <div className="flex items-center gap-2 mt-0.5 opacity-90">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">M DOC Rates</span>
                <span className="text-xs opacity-75">•</span>
                <span className="text-xs font-medium">{today}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
          {loadingFetch ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loading />
              <p className="text-gray-400 font-medium animate-pulse text-sm">Loading market data...</p>
            </div>
          ) : (
            data.location.map((loc) => (
              <div key={loc} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                <button
                  onClick={() => toggleLocation(loc)}
                  className={`w-full px-6 py-5 flex items-center justify-between transition-colors ${
                    expandedLocations.includes(loc) ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${
                      expandedLocations.includes(loc) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <MapPin size={18} />
                    </div>
                    <span className="font-bold text-gray-800 tracking-tight text-lg">{loc}</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedLocations.includes(loc) ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}>
                    <ChevronDown size={24} />
                  </div>
                </button>

                {expandedLocations.includes(loc) && (
                  <div className="p-6 pt-0 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mb-6" />
                    
                    {rates[loc]?.map((item, index) => {
                      const isEditing = editing[`${loc}_${index}`];
                      const key = `${loc}_${index}`;

                      return (
                        <div key={index} className="relative group">
                          {/* Commodity Card */}
                          <div className={`p-6 rounded-[2rem] border transition-all duration-300 ${
                            isEditing 
                              ? 'border-blue-200 bg-blue-50/30 ring-4 ring-blue-500/5 shadow-lg' 
                              : 'border-gray-100 bg-white hover:border-blue-200 shadow-sm'
                          }`}>
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-8 rounded-full bg-blue-500" />
                                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{item.commodity}</h3>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!isEditing ? (
                                  <button
                                    onClick={() => toggleEdit(loc, index)}
                                    className="px-5 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
                                  >
                                    Edit Rates
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleEdit(loc, index)}
                                      className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSave(loc, index)}
                                      disabled={loadingSave}
                                      className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-200 disabled:opacity-50"
                                    >
                                      {loadingSave ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      ) : null}
                                      Save Changes
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Rate Fields */}
                              <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Yesterday</label>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-gray-400 text-sm font-bold">₹</span>
                                    <span className="text-lg font-bold text-gray-600">{item.oldRate}</span>
                                  </div>
                                </div>
                                
                                <div className={`p-4 rounded-2xl border transition-all ${
                                  isEditing ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50/80 border-gray-100'
                                }`}>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Temp Rate (Today)</label>
                                  <div className="flex items-center gap-2">
                                    <span className="text-blue-600 text-sm font-bold">₹</span>
                                    <input
                                      type="number"
                                      value={item.tempRate}
                                      readOnly={!isEditing}
                                      onChange={(e) => handleChange(loc, index, e.target.value)}
                                      className={`w-full bg-transparent font-black text-xl outline-none ${
                                        isEditing ? 'text-blue-700' : 'text-gray-700'
                                      }`}
                                      placeholder="0"
                                    />
                                  </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Final Rate</label>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-gray-400 text-sm font-bold">₹</span>
                                    <span className="text-lg font-bold text-gray-800">
                                      {item.tempRates.length
                                        ? item.tempRates[item.tempRates.length - 1].rate
                                        : item.finalRate || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Logistics Fields */}
                              <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5 ml-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    Destination
                                  </label>
                                  <div className="relative group/select">
                                    <select
                                      value={selectedDestinations[key] || ""}
                                      onChange={(e) => handleDestinationChange(loc, index, e.target.value)}
                                      className="w-full pl-4 pr-10 py-3.5 text-sm font-bold rounded-2xl border border-gray-200 bg-white hover:border-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                                    >
                                      <option value="">Select Destination</option>
                                      {destinationLocations.map((dLoc) => (
                                        <option key={dLoc} value={dLoc}>{dLoc}</option>
                                      ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover/select:text-amber-500 transition-colors" />
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5 ml-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    Freight Details
                                  </label>
                                  <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-inner group/freight hover:bg-blue-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-md">
                                        <Truck size={14} />
                                      </div>
                                      <span className="text-xs font-bold text-blue-800 uppercase tracking-tighter">Est. Freight</span>
                                    </div>
                                    <div className="flex items-baseline gap-0.5">
                                      <span className="text-blue-400 text-[10px] font-bold">₹</span>
                                      <span className="text-xl font-black text-blue-700 tracking-tight">
                                        {freightRates[key] || 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Landing Cost Card */}
                              <div className="relative overflow-hidden p-[1px] rounded-[2.25rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-100 group/landing transition-transform hover:scale-[1.02]">
                                <div className="h-full bg-white/95 backdrop-blur-md p-6 rounded-[2.2rem] flex flex-col justify-between relative overflow-hidden">
                                  {/* Background Decorative Circles */}
                                  <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-indigo-500/5 blur-2xl group-hover/landing:bg-indigo-500/10 transition-colors" />
                                  <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-pink-500/5 blur-2xl group-hover/landing:bg-pink-500/10 transition-colors" />
                                  
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                                      <IndianRupee size={14} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70">Final Landing Cost</span>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tighter">
                                        <span className="text-sm mr-1">₹</span>
                                        {(() => {
                                          const currentRate = item.tempRate || (item.tempRates.length ? item.tempRates[item.tempRates.length - 1].rate : item.finalRate) || 0;
                                          const freight = freightRates[key] || 0;
                                          return (Number(currentRate) + Number(freight)).toLocaleString('en-IN');
                                        })()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex -space-x-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 border border-white" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 border border-white" />
                                      </div>
                                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse">Live Calculation</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Today Rates Timeline */}
                            {item.tempRates.length > 0 && (
                              <div className="mt-8 pt-8 border-t border-gray-50">
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="w-1 h-4 rounded-full bg-blue-400" />
                                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Today's Price Action</h4>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {item.tempRates.map((tr, i) => {
                                    const prev = i === 0 ? item.oldRate : item.tempRates[i - 1].rate;
                                    const diff = tr.rate - prev;
                                    const isPositive = diff > 0;
                                    const isNeutral = diff === 0;

                                    return (
                                      <div key={i} className="flex flex-col items-center bg-gray-50/50 border border-gray-100 rounded-2xl p-3 min-w-[100px] transition-all hover:bg-white hover:shadow-md hover:border-blue-100 group/item">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">{tr.time}</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-sm font-black text-gray-800 tracking-tight">₹{tr.rate}</span>
                                          {!isNeutral && (
                                            <div className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                              isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                              {isPositive ? '+' : ''}{diff}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
