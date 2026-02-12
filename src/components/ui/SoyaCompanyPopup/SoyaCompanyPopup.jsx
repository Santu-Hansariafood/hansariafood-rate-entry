"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, ChevronDown, ChevronUp, MapPin, Truck, IndianRupee } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";
import SoyaNotification from "../SoyaNotification/SoyaNotification";

const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));

export default function SoyaCompanyPopup({ isOpen, onClose, data, onRateUpdate }) {
  const [expandedLocations, setExpandedLocations] = useState([]);
  const [rates, setRates] = useState({});
  const [editing, setEditing] = useState({});
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const [destinationLocations, setDestinationLocations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState({});
  const [freightRates, setFreightRates] = useState({});

  const today = new Date().toLocaleDateString("en-GB");

  useEffect(() => {
    if (!isOpen || !data?._id) return;
    loadExistingHistory();
    fetchDestinationLocations();
    setNotificationData(null);
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
      // while in SoyaCompanyPopup it's specific (SBM 46%, etc.)
      const baseCommodity = "Soya"; 
      
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

      setNotificationData({
        companyName: data.name,
        location: loc,
        date: today,
        rate: item.tempRate,
        commodity: item.commodity,
      });

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
  const todayDate = new Date().toLocaleDateString("en-GB");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <motion.div className="bg-white w-full max-w-5xl h-[80vh] rounded-xl overflow-hidden flex flex-col">
        <div className="flex justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold">{data.name}</h2>
            <p className="text-sm text-gray-500">Date: {todayDate}</p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="px-4 py-2 bg-gray-50 border-b">
          <SoyaNotification data={notificationData} />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loadingFetch ? (
            <Loading />
          ) : (
            data.location.map((loc) => (
              <div key={loc} className="border rounded mb-3">
                <button
                  onClick={() => toggleLocation(loc)}
                  className="w-full px-4 py-3 flex justify-between bg-gray-50"
                >
                  <span>{loc}</span>
                  {expandedLocations.includes(loc) ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </button>

                {expandedLocations.includes(loc) && (
                  <div className="p-4 space-y-4">
                    {rates[loc]?.map((item, index) => {
                      const isEditing = editing[`${loc}_${index}`];
                      const key = `${loc}_${index}`;

                      return (
                        <div key={index} className="bg-gray-50 p-4 rounded">
                          <div className="flex justify-between mb-3">
                            <strong>{item.commodity}</strong>
                            {!isEditing ? (
                              <button
                                onClick={() => toggleEdit(loc, index)}
                                className="text-xs border px-3 py-1"
                              >
                                Edit
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSave(loc, index)}
                                className="text-xs bg-green-600 text-white px-3 py-1"
                              >
                                {loadingSave ? "Saving..." : "Save"}
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputBox
                              label="Yesterday Rate"
                              value={item.oldRate}
                              readOnly
                            />

                            <InputBox
                              label="Temp Rate (Today)"
                              type="number"
                              value={item.tempRate}
                              readOnly={!isEditing}
                              onChange={(e) =>
                                handleChange(loc, index, e.target.value)
                              }
                            />

                            <InputBox
                              label="Final Rate (Auto)"
                              value={
                                item.tempRates.length
                                  ? item.tempRates[item.tempRates.length - 1]
                                      .rate
                                  : item.finalRate || 0
                              }
                              readOnly
                            />

                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                <MapPin size={12} className="text-emerald-500" />
                                Destination
                              </label>
                              <div className="relative group">
                                <select
                                  value={selectedDestinations[key] || ""}
                                  onChange={(e) => handleDestinationChange(loc, index, e.target.value)}
                                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer pr-8"
                                >
                                  <option value="">Select Destination</option>
                                  {destinationLocations.map((dLoc) => (
                                    <option key={dLoc} value={dLoc}>
                                      {dLoc}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                <Truck size={12} className="text-amber-500" />
                                Freight
                              </label>
                              <div className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 font-semibold flex items-center gap-1.5 shadow-inner">
                                <span className="text-gray-400 text-xs">₹</span>
                                {freightRates[key] || 0}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                                <IndianRupee size={12} className="text-blue-500" />
                                Landing Cost
                              </label>
                              <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-[1px] shadow-sm">
                                <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-[11px] flex items-center justify-between">
                                  <span className="text-blue-700 font-black text-base">
                                    <span className="text-blue-400 text-xs mr-0.5">₹</span>
                                    {(() => {
                                      const currentRate = item.tempRate || (item.tempRates.length ? item.tempRates[item.tempRates.length - 1].rate : item.finalRate) || 0;
                                      const freight = freightRates[key] || 0;
                                      return (Number(currentRate) + Number(freight)).toLocaleString('en-IN');
                                    })()}
                                  </span>
                                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {item.tempRates.length > 0 && (
                            <div className="mt-3 text-sm">
                              <p className="font-semibold mb-1">Today Rates</p>
                              {item.tempRates.map((tr, i) => {
                                const prev =
                                  i === 0
                                    ? item.oldRate
                                    : item.tempRates[i - 1].rate;
                                const diff = tr.rate - prev;

                                return (
                                  <div
                                    key={i}
                                    className="flex justify-between text-xs"
                                  >
                                    <span>{tr.time}</span>
                                    <span>{tr.rate}</span>
                                    <span
                                      className={
                                        diff > 0
                                          ? "text-green-600"
                                          : diff < 0
                                          ? "text-red-600"
                                          : "text-gray-500"
                                      }
                                    >
                                      {diff > 0 ? `+${diff}` : diff}
                                    </span>
                                  </div>
                                );
                              })}
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
                                  <div className="w-1 h-4 rounded-full bg-emerald-400" />
                                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Today's Price Action</h4>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {item.tempRates.map((tr, i) => {
                                    const prev = i === 0 ? item.oldRate : item.tempRates[i - 1].rate;
                                    const diff = tr.rate - prev;
                                    const isPositive = diff > 0;
                                    const isNeutral = diff === 0;

                                    return (
                                      <div key={i} className="flex flex-col items-center bg-gray-50/50 border border-gray-100 rounded-2xl p-3 min-w-[100px] transition-all hover:bg-white hover:shadow-md hover:border-emerald-100 group/item">
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
