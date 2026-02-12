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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <motion.div className="bg-white w-full max-w-5xl h-[80vh] rounded-xl overflow-hidden flex flex-col">
        <div className="flex justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold">{data.name}</h2>
            <p className="text-sm text-gray-500">Date: {today}</p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
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
                                className="text-xs bg-blue-600 text-white px-3 py-1"
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
                                <MapPin size={12} className="text-blue-500" />
                                Destination
                              </label>
                              <div className="relative group">
                                <select
                                  value={selectedDestinations[key] || ""}
                                  onChange={(e) => handleDestinationChange(loc, index, e.target.value)}
                                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:border-blue-400 focus:border-blue-500 outline-none appearance-none cursor-pointer pr-8"
                                >
                                  <option value="">Select Destination</option>
                                  {destinationLocations.map((dLoc) => (
                                    <option key={dLoc} value={dLoc}>
                                      {dLoc}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                <Truck size={12} className="text-amber-500" />
                                Freight
                              </label>
                              <div className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 font-semibold flex items-center gap-1.5">
                                <span className="text-gray-400 text-xs">₹</span>
                                {freightRates[key] || 0}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                                <IndianRupee size={12} className="text-blue-500" />
                                Landing Cost
                              </label>
                              <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-blue-50 p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-blue-700 font-black text-xl">
                                    <span className="text-blue-400 text-sm mr-1">₹</span>
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
}
