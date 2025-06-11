"use client";

import React, { Suspense, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import SaudaSharePopup from "@/components/ui/Sauda/SaudaSharePopup/SaudaSharePopup";
import { generateSaudaPDF } from "@/utils/generateSaudaPDF/generateSaudaPDF";
import { toast } from "react-toastify";
import { X, Save, Share2 } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";
import Title from "@/components/common/Title/Title";

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
        tons: Number(entry.tons) || 0,
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
        let status = "green";

        const hasSaudaFilled = Object.values(saudaEntries).some((entries) =>
          entries.some((entry) => entry.tons || entry.description)
        );

        const allSaudaNosFilled = Object.values(saudaEntries).every((entries) =>
          entries.every((entry) => entry.saudaNo)
        );

        if (hasSaudaFilled) {
          status = "yellow";
        }
        if (hasSaudaFilled && allSaudaNosFilled) {
          status = "blue";
        }

        onClose(status);
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

    generateSaudaPDF({
      company: companyData.name,
      date: getCurrentDate(),
      rateData,
      saudaEntries,
    });

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
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-500 hover:text-red-500 p-1 rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {companyData ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <Title text={`${companyData.name}`} />
                <p className="text-red-600">Date: {getCurrentDate()}</p>
              </div>

              <table className="w-full text-sm border border-gray-300 shadow-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-green-500 text-gray-100 font-semibold text-left">
                    <th className="py-2 px-3 border-b">Sl. No.</th>
                    <th className="py-2 px-3 border-b">Unit</th>
                    <th className="py-2 px-3 border-b">Commodity</th>
                    <th className="py-2 px-3 border-b">Rate</th>
                    <th className="py-2 px-3 border-b">Sauda (Tons + Desc)</th>
                    <th className="py-2 px-3 border-b">Sauda No</th>
                    <th className="py-2 px-3 border-b">Total Tons</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
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

                      if (!rateInfo?.newRate || rateInfo.newRate === 0)
                        return null;

                      return (
                        <tr
                          key={`${unit}-${commodity}`}
                          className="hover:bg-gray-50 transition-all"
                        >
                          <td className="py-2 px-3">{locationIndex + 1}</td>
                          <td className="py-2 px-3 font-medium text-gray-800">
                            {unit}
                          </td>
                          <td className="py-2 px-3">{commodity}</td>
                          <td className="py-2 px-3 text-blue-700 font-semibold whitespace-nowrap">
                            ₹ {rateInfo.newRate}
                          </td>
                          <td className="py-2 px-3 space-y-1">
                            {saudaList.map((entry, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-gray-500 font-semibold">
                                  {String.fromCharCode(97 + i)}.
                                </span>
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
                                  className="w-16 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                <span className="text-sm text-gray-500">
                                  Tons
                                </span>
                                <input
                                  type="text"
                                  value={entry.description || ""}
                                  onChange={(e) =>
                                    handleSaudaChange(
                                      saudaKey,
                                      i,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Desc"
                                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                  style={{
                                    width: `${Math.max(
                                      (entry.description || "").length * 8 + 20,
                                      100
                                    )}px`,
                                    minWidth: "100px",
                                  }}
                                />
                              </div>
                            ))}
                            <button
                              className="text-xs text-blue-600 hover:underline"
                              onClick={() => addSaudaEntry(saudaKey)}
                            >
                              + Add Sauda
                            </button>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-col gap-2">
                              {saudaList.map((entry, i) => (
                                <input
                                  key={i}
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
                                  className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                              ))}
                            </div>
                          </td>

                          <td className="py-2 px-3 font-bold text-green-700 whitespace-nowrap">
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
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>

                <button
                  onClick={handleShare}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </>
          ) : (
            <p>No Unit Added</p>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default ManageCompanyPopup;
