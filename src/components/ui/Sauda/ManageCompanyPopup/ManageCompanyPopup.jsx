"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import SaudaSharePopup from "@/components/ui/Sauda/SaudaSharePopup/SaudaSharePopup";
import { toast } from "react-toastify";

const ManageCompanyPopup = ({ name, onClose }) => {
  const [companyData, setCompanyData] = useState(null);
  const [rateData, setRateData] = useState([]);
  const [saudaEntries, setSaudaEntries] = useState({});
  const [showSharePopup, setShowSharePopup] = useState(false);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  const fetchSaudaData = async (companyName, currentDate) => {
    try {
      const res = await axiosInstance.get(
        `/save-sauda?company=${companyName}&date=${currentDate}`
      );
      if (res.data?.entry) {
        setSaudaEntries(res.data.entry.saudaEntries);
      } else {
        toast.info("No previous sauda data, starting fresh.");
      }
    } catch (error) {
      console.error("Error fetching saved sauda:", error);
      toast.error("Failed to fetch previous sauda data");
    }
  };

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const res = await axiosInstance.get(`/managecompany?q=${name}`);
        if (res.data?.companies?.length) {
          const data = res.data.companies[0];
          setCompanyData(data);

          const rateRes = await axiosInstance.get(`/rate?company=${data.name}`);
          if (rateRes.data?.length) {
            setRateData(rateRes.data);
          } else {
            toast.info("No rate data found");
          }

          const today = getCurrentDate();
          await fetchSaudaData(data.name, today);

          setSaudaEntries((prev) => {
            if (Object.keys(prev || {}).length > 0) return prev;
            const saudaInit = {};
            data.location.forEach((loc) => {
              data.commodities.forEach((comm) => {
                const key = `${loc}-${comm}`;
                saudaInit[key] = [{ tons: "", description: "", saudaNo: "" }];
              });
            });
            return saudaInit;
          });
        } else {
          toast.error("Company details not found");
        }
      } catch (error) {
        toast.error("Failed to load company or rate details");
      }
    };

    fetchCompanyDetails();
  }, [name]);

  const handleSave = async () => {
    if (!companyData) return;

    const structuredEntries = {};
    Object.entries(saudaEntries).forEach(([key, entries]) => {
      const [unit, commodity] = key.split("-");
      structuredEntries[key] = entries.map((entry) => ({
        ...entry,
        tons: Number(entry.tons) || 0, // Ensure tons is a number
        unit,
        commodity,
      }));
    });

    const payload = {
      company: companyData.name,
      date: getCurrentDate(),
      saudaEntries: structuredEntries,
    };

    try {
      const res = await axiosInstance.post("/save-sauda", payload);
      if (res.status === 201 && res.data.entry) {
        toast.success("Updated successfully");
        onClose();
      } else {
        toast.error(res.data.message || "Failed to save data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving sauda data");
    }
  };

  const handleSaudaChange = (unit, index, field, value) => {
    const updated = [...saudaEntries[unit]];
    updated[index][field] = value;
    setSaudaEntries((prev) => ({ ...prev, [unit]: updated }));
  };

  const addSaudaEntry = (unit) => {
    const updated = [
      ...saudaEntries[unit],
      { tons: "", description: "", saudaNo: "" },
    ];
    setSaudaEntries((prev) => ({ ...prev, [unit]: updated }));
  };

  const handleShare = () => {
    if (!companyData || !rateData.length || !Object.keys(saudaEntries).length) {
      toast.warn("Data still loading. Please wait a moment.");
      return;
    }
    setShowSharePopup(true);
  };

  const getTotalTons = (unit) => {
    const entries = saudaEntries[unit] || [];
    return entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.tons) || 0),
      0
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button className="absolute top-2 right-3 text-xl" onClick={onClose}>
          ×
        </button>

        {companyData ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{companyData.name}</h2>
              <p className="text-gray-600">Date: {getCurrentDate()}</p>
            </div>

            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200 text-sm">
                  <th className="py-1 px-2 text-left">Sl. No.</th>
                  <th className="py-1 px-2 text-left">Unit</th>
                  <th className="py-1 px-2 text-left">Commodity</th>
                  <th className="py-1 px-2 text-left">Rate</th>
                  <th className="py-1 px-2 text-left">Sauda (Tons + Desc)</th>
                  <th className="py-1 px-2 text-left">Sauda No</th>
                  <th className="py-1 px-2 text-left">Total Tons</th>
                </tr>
              </thead>
              <tbody>
                {companyData.location.map((unit, locationIndex) =>
                  companyData.commodities.map((commodity, commodityIndex) => {
                    const rateInfo = rateData.find(
                      (rate) =>
                        rate.location === unit &&
                        rate.company === companyData.name &&
                        rate.commodity === commodity
                    );

                    const saudaKey = `${unit}-${commodity}`;
                    const saudaList = saudaEntries[saudaKey] || [];

                    // Skip this row if rate is 0 or undefined/null
                    if (
                      !rateInfo ||
                      !rateInfo.newRate ||
                      rateInfo.newRate === 0
                    )
                      return null;

                    return (
                      <tr
                        key={`${unit}-${commodity}`}
                        className="border-t align-top text-sm"
                      >
                        <td className="py-1 px-2">{locationIndex + 1}</td>
                        <td className="py-1 px-2 font-semibold">{unit}</td>
                        <td className="py-1 px-2">{commodity}</td>
                        <td className="py-1 px-2">
                          {rateInfo?.newRate !== undefined
                            ? rateInfo.newRate
                            : "N/A"}
                        </td>
                        <td className="py-1 px-2">
                          {saudaList.map((entry, i) => (
                            <div
                              key={i}
                              className="flex items-center mb-1 gap-1"
                            >
                              <span>{String.fromCharCode(97 + i)}.</span>
                              <input
                                type="number"
                                value={entry.tons}
                                onChange={(e) =>
                                  handleSaudaChange(
                                    saudaKey,
                                    i,
                                    "tons",
                                    e.target.value
                                  )
                                }
                                placeholder="Tons"
                                className="w-16 border px-1 py-0.5"
                              />
                              <span>Tons</span>
                              <input
                                type="text"
                                value={entry.description}
                                onChange={(e) =>
                                  handleSaudaChange(
                                    saudaKey,
                                    i,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Desc"
                                className="w-28 border px-1 py-0.5"
                              />
                            </div>
                          ))}
                          <button
                            className="text-blue-600 mt-1 text-xs"
                            onClick={() => addSaudaEntry(saudaKey)}
                          >
                            + Add Sauda
                          </button>
                        </td>
                        <td className="py-1 px-2">
                          {saudaList.map((entry, i) => (
                            <div key={i} className="mb-1">
                              <input
                                type="number"
                                value={entry.saudaNo}
                                onChange={(e) =>
                                  handleSaudaChange(
                                    saudaKey,
                                    i,
                                    "saudaNo",
                                    e.target.value
                                  )
                                }
                                placeholder="No"
                                className="w-16 border px-1 py-0.5"
                              />
                            </div>
                          ))}
                        </td>
                        <td className="py-1 px-2 font-semibold">
                          {getTotalTons(saudaKey)} Tons
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {showSharePopup && (
              <SaudaSharePopup
                company={companyData.name}
                date={getCurrentDate()}
                saudaEntries={saudaEntries}
                rateData={rateData}
                onClose={() => setShowSharePopup(false)}
              />
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleShare}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Share
              </button>
            </div>
          </>
        ) : (
          <p>No Unit Added</p>
        )}
      </div>
    </div>
  );
};

export default ManageCompanyPopup;
