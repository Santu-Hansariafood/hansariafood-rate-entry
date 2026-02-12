"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, ChevronDown, ChevronUp, MapPin, Truck, IndianRupee } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));

export default function DDGSCompanyPopup({ isOpen, onClose, data, onRateUpdate }) {
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
      const baseCommodity = "Maize DDGS"; 
      
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

    setLoadingSave(true);
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-50 w-full max-w-6xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white/20"
      >
        {/* Modern Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex justify-between items-center shrink-0 shadow-lg">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group transition-transform hover:rotate-3">
              <MapPin className="text-white group-hover:scale-110 transition-transform" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">{data.name}</h2>
              <div className="flex items-center gap-3 mt-1 opacity-90">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 uppercase tracking-widest border border-white/10">Maize DDGS</span>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <span className="text-sm font-medium tracking-wide">{today}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90 hover:rotate-90 shadow-lg border border-white/10"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loadingFetch ? (
            <div className="h-full flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <div className="space-y-6">
              {data.location.map((loc) => (
                <motion.div 
                  layout
                  key={loc} 
                  className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => toggleLocation(loc)}
                    className={`w-full px-8 py-5 flex justify-between items-center transition-all ${
                      expandedLocations.includes(loc) 
                        ? "bg-gradient-to-r from-orange-50 to-amber-50" 
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full transition-colors ${
                        expandedLocations.includes(loc) ? "bg-orange-500" : "bg-slate-200"
                      }`} />
                      <span className="text-lg font-bold text-slate-700 tracking-tight">{loc}</span>
                    </div>
                    <div className={`p-2 rounded-xl transition-all ${
                      expandedLocations.includes(loc) ? "bg-orange-500 text-white rotate-180" : "bg-slate-100 text-slate-400"
                    }`}>
                      <ChevronDown size={20} />
                    </div>
                  </button>

                  {expandedLocations.includes(loc) && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 space-y-8 bg-white"
                    >
                      {rates[loc]?.map((item, index) => {
                        const isEditing = editing[`${loc}_${index}`];
                        const key = `${loc}_${index}`;

                        return (
                          <div key={index} className="relative group/card">
                            <div className="absolute -inset-4 rounded-[2.5rem] bg-slate-50/50 opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none" />
                            
                            <div className="relative flex justify-between items-center mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-sm">
                                  {item.commodity.charAt(0)}
                                </div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">{item.commodity}</h3>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {!isEditing ? (
                                  <button
                                    onClick={() => toggleEdit(loc, index)}
                                    className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm shadow-sm hover:border-orange-200 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-95"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/btn:bg-orange-400 transition-colors" />
                                    Modify Rates
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleEdit(loc, index)}
                                      className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSave(loc, index)}
                                      disabled={loadingSave}
                                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                      {loadingSave ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      ) : null}
                                      {loadingSave ? "Processing..." : "Commit Changes"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Rate Inputs */}
                              <div className="space-y-6">
                                <InputBox
                                  label="PREVIOUS CLOSING"
                                  value={item.oldRate}
                                  readOnly
                                  className="bg-slate-50/50"
                                />
                                <InputBox
                                  label="TODAY'S INDICATIVE"
                                  type="number"
                                  value={item.tempRate}
                                  readOnly={!isEditing}
                                  onChange={(e) => handleChange(loc, index, e.target.value)}
                                  className={isEditing ? "ring-2 ring-orange-500/20 border-orange-200" : ""}
                                />
                              </div>

                              {/* Logistics Details */}
                              <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                                    DESTINATION HUB
                                  </label>
                                  <div className="relative group/select">
                                    <select
                                      value={selectedDestinations[key] || ""}
                                      onChange={(e) => handleDestinationChange(loc, index, e.target.value)}
                                      className="w-full px-5 py-3.5 text-sm font-bold rounded-2xl border border-slate-200 bg-white hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all appearance-none cursor-pointer pr-10 text-slate-700 shadow-sm"
                                    >
                                      <option value="">Select Target Location</option>
                                      {destinationLocations.map((dLoc) => (
                                        <option key={dLoc} value={dLoc}>{dLoc}</option>
                                      ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-orange-500 transition-colors" />
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                                    FREIGHT ESTIMATE
                                  </label>
                                  <div className="px-5 py-3.5 text-sm rounded-2xl border border-slate-100 bg-slate-50/80 text-slate-700 font-black flex items-center justify-between group/freight">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-500">
                                        <Truck size={16} />
                                      </div>
                                      <span className="text-slate-400 text-xs font-medium">₹</span>
                                      <span className="text-lg">{(freightRates[key] || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm opacity-0 group-hover/freight:opacity-100 transition-opacity">PER MT</div>
                                  </div>
                                </div>
                              </div>

                              {/* Landing Cost Card */}
                              <div className="relative overflow-hidden p-[1px] rounded-[2.25rem] bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 shadow-xl shadow-orange-100 group/landing transition-transform hover:scale-[1.02]">
                                <div className="h-full bg-white/95 backdrop-blur-md p-6 rounded-[2.2rem] flex flex-col justify-between relative overflow-hidden">
                                  <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-orange-500/5 blur-2xl group-hover/landing:bg-orange-500/10 transition-colors" />
                                  <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-yellow-500/5 blur-2xl group-hover/landing:bg-yellow-500/10 transition-colors" />
                                  
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
                                      <IndianRupee size={14} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600/70">Final Landing Cost</span>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 tracking-tighter">
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

                            {/* Today's Rate Timeline */}
                            {item.tempRates.length > 0 && (
                              <div className="mt-8 pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Intraday Price Action</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                  {item.tempRates.map((tr, i) => {
                                    const prev = i === 0 ? item.oldRate : item.tempRates[i - 1].rate;
                                    const diff = tr.rate - prev;
                                    return (
                                      <div key={i} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group/item transition-colors hover:bg-white hover:border-orange-100 hover:shadow-sm">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-bold text-slate-400">{tr.time}</span>
                                          <span className="text-sm font-black text-slate-700 tracking-tight">₹{tr.rate.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg font-black text-[10px] ${
                                          diff > 0 ? "bg-emerald-50 text-emerald-600" : 
                                          diff < 0 ? "bg-rose-50 text-rose-600" : 
                                          "bg-slate-100 text-slate-500"
                                        }`}>
                                          {diff > 0 ? `+${diff}` : diff === 0 ? "UNCH" : diff}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
