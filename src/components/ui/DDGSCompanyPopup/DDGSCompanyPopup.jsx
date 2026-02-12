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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-5xl h-[85vh] rounded-xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-orange-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <MapPin size={20} />
            <div>
              <h2 className="text-lg font-bold">{data.name}</h2>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider opacity-80">
                <span>Maize DDGS Rates</span>
                <span>•</span>
                <span>{today}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
          {loadingFetch ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loading />
              <p className="text-gray-500 mt-2 text-sm">Loading market data...</p>
            </div>
          ) : (
            data.location.map((loc) => (
              <div key={loc} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleLocation(loc)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-orange-500" />
                    <span className="font-bold text-gray-700">{loc}</span>
                  </div>
                  <div className={`transition-transform ${expandedLocations.includes(loc) ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-gray-400" />
                  </div>
                </button>

                {expandedLocations.includes(loc) && (
                  <div className="px-5 pb-5 pt-2 space-y-4">
                    <div className="h-px bg-gray-100" />
                    
                    {rates[loc]?.map((item, index) => {
                      const isEditing = editing[`${loc}_${index}`];
                      const key = `${loc}_${index}`;

                      return (
                        <div key={index} className={`p-5 rounded-xl border transition-all ${
                          isEditing ? 'border-orange-200 bg-orange-50/10' : 'border-gray-100 bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-800">{item.commodity}</h3>
                            <div className="flex gap-2">
                              {!isEditing ? (
                                <button
                                  onClick={() => toggleEdit(loc, index)}
                                  className="px-4 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50"
                                >
                                  Edit Rates
                                </button>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => toggleEdit(loc, index)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSave(loc, index)}
                                    disabled={loadingSave}
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                                  >
                                    {loadingSave ? "Saving..." : "Save"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Rates Section */}
                            <div className="space-y-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-gray-400">Yesterday</label>
                                <span className="text-sm font-bold text-gray-600">₹{item.oldRate}</span>
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-orange-600">Temp Rate (Today)</label>
                                <div className="flex items-center gap-1 border-b border-orange-200 pb-1">
                                  <span className="text-orange-600 text-sm">₹</span>
                                  <input
                                    type="number"
                                    value={item.tempRate}
                                    readOnly={!isEditing}
                                    onChange={(e) => handleChange(loc, index, e.target.value)}
                                    className="w-full bg-transparent font-bold text-lg outline-none text-orange-700"
                                    placeholder="0"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-gray-400">Final Rate</label>
                                <span className="text-sm font-bold text-gray-800">
                                  ₹{item.tempRates.length
                                    ? item.tempRates[item.tempRates.length - 1].rate
                                    : item.finalRate || 0}
                                </span>
                              </div>
                            </div>

                            {/* Destination & Freight */}
                            <div className="space-y-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Destination</label>
                                <select
                                  value={selectedDestinations[key] || ""}
                                  onChange={(e) => handleDestinationChange(loc, index, e.target.value)}
                                  className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white focus:border-orange-500 outline-none"
                                >
                                  <option value="">Select Destination</option>
                                  {destinationLocations.map((dLoc) => (
                                    <option key={dLoc} value={dLoc}>{dLoc}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Freight Rate</label>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
                                  <div className="flex items-center gap-2">
                                    <Truck size={14} className="text-orange-600" />
                                    <span className="text-[10px] font-bold text-orange-800 uppercase">Freight</span>
                                  </div>
                                  <span className="text-lg font-bold text-orange-700">
                                    ₹{freightRates[key] || 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Landing Cost */}
                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1">
                                <IndianRupee size={12} className="text-orange-500" />
                                Landing Cost
                              </label>
                              <div className="relative overflow-hidden rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-[1px] shadow-sm">
                                <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-[11px] flex items-center justify-between">
                                  <span className="text-orange-700 font-black text-base">
                                    <span className="text-orange-400 text-xs mr-0.5">₹</span>
                                    {(() => {
                                      const currentRate = item.tempRate || (item.tempRates.length ? item.tempRates[item.tempRates.length - 1].rate : item.finalRate) || 0;
                                      const freight = freightRates[key] || 0;
                                      return (Number(currentRate) + Number(freight)).toLocaleString('en-IN');
                                    })()}
                                  </span>
                                  <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Price Action Timeline */}
                          {item.tempRates.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-50">
                              <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-3">Today's Price Action</h4>
                              <div className="flex flex-wrap gap-2">
                                {item.tempRates.map((tr, i) => {
                                  const prev = i === 0 ? item.oldRate : item.tempRates[i - 1].rate;
                                  const diff = tr.rate - prev;
                                  return (
                                    <div key={i} className="flex flex-col bg-gray-50 rounded-lg p-2 min-w-[80px]">
                                      <span className="text-[9px] font-bold text-gray-400 uppercase">{tr.time}</span>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-gray-700">₹{tr.rate}</span>
                                        {diff !== 0 && (
                                          <span className={`text-[9px] font-bold ${diff > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {diff > 0 ? '+' : ''}{diff}
                                          </span>
                                        )}
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
