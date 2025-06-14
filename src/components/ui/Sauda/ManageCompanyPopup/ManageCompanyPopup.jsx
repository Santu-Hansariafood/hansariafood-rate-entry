"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { generateSaudaPDF } from "@/utils/generateSaudaPDF/generateSaudaPDF";
import { generateRatePDF } from "@/utils/generateSaudaPDF/generateRatePDF";
import { toast } from "react-toastify";
import { X, Save, Share2 } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const SaudaSharePopup = dynamic(() =>
  import("@/components/ui/Sauda/SaudaSharePopup/SaudaSharePopup")
);

const normalize = (s) => s?.trim().toLowerCase() || "";

const ManageCompanyPopup = ({ name, onClose }) => {
  const [companyData, setCompanyData] = useState(null);
  const [rateData, setRateData] = useState([]);
  const [saudaEntries, setSaudaEntries] = useState({});
  const [showSharePopup, setShowSharePopup] = useState(false);

  const today = () =>
    new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { companies = [] },
        } = await axiosInstance.get(`/managecompany?q=${name}`);

        if (!companies.length) {
          toast.error("Company details not found");
          return;
        }

        const company = companies[0];
        setCompanyData(company);

        const [{ data: rates }, saudaRes] = await Promise.all([
          axiosInstance.get(`/rate?company=${company.name}`),
          axiosInstance.get(
            `/save-sauda?company=${company.name}&date=${today()}`
          ),
        ]);
        setRateData(rates || []);

        const saved = saudaRes.data?.entry?.saudaEntries || {};
        if (!Object.keys(saved).length)
          toast.info("No previous sauda data, starting fresh.");

        const init = {};
        company.location.forEach((loc) =>
          company.commodities.forEach((comm) => {
            const k = `${loc}-${comm}`;
            init[k] = saved[k] || [{ tons: "", description: "", saudaNo: "" }];
          })
        );
        setSaudaEntries(init);
      } catch {
        toast.error("Failed to load data");
      }
    })();
  }, [name]);

  const rateMap = useMemo(() => {
    const m = {};
    rateData.forEach((r) => {
      m[`${normalize(r.location)}-${normalize(r.commodity)}`] = r.newRate ?? 0;
    });
    return m;
  }, [rateData]);

  const handleSaudaChange = (key, idx, field, val) => {
    setSaudaEntries((prev) => {
      const list = [...prev[key]];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, [key]: list };
    });
  };

  const addSaudaEntry = (key) =>
    setSaudaEntries((prev) => ({
      ...prev,
      [key]: [...prev[key], { tons: "", description: "", saudaNo: "" }],
    }));

  const totalTons = (key) =>
    saudaEntries[key]?.reduce((s, e) => s + (+e.tons || 0), 0);

  const handleSave = async () => {
    if (!companyData) return;
    const structured = {};
    for (const [k, list] of Object.entries(saudaEntries)) {
      const [unit, commodity] = k.split("-");
      structured[k] = list.map((e) => ({
        ...e,
        tons: +e.tons || 0,
        unit,
        commodity,
      }));
    }
    try {
      const { status, data } = await axiosInstance.post("/save-sauda", {
        company: companyData.name,
        date: today(),
        saudaEntries: structured,
      });
      if (status === 201 && data.entry) {
        toast.success("Updated successfully");
        const filled = Object.values(saudaEntries).some((l) =>
          l.some((e) => e.tons || e.description)
        );
        const allNos = Object.values(saudaEntries).every((l) =>
          l.every((e) => e.saudaNo)
        );
        onClose(filled ? (allNos ? "blue" : "yellow") : "green");
      } else toast.error(data.message || "Failed to save");
    } catch {
      toast.error("Error saving data");
    }
  };

  const handelDownload = () => {
    generateRatePDF({
      company: companyData.name,
      date: today(),
      rateData,
      saudaEntries,
    });
  };

  const handleShare = () => {
    if (!companyData || !rateData.length || !Object.keys(saudaEntries).length)
      return toast.warn("Data still loading.");
    generateSaudaPDF({
      company: companyData.name,
      date: today(),
      rateData,
      saudaEntries,
    });
    setShowSharePopup(true);
  };
  let sl = 0;

  return (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
          <button
            aria-label="Close"
            onClick={() => onClose("red")}
            className="absolute right-3 top-2 rounded-full p-1 text-gray-500 hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>

          {companyData ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <Title text={companyData.name} />
                <p className="text-red-600">Date: {today()}</p>
              </div>
              <table className="w-full overflow-hidden rounded-lg border text-sm shadow-sm">
                <thead>
                  <tr className="bg-green-500 text-left font-semibold text-gray-100">
                    <th className="px-3 py-2">Sl.</th>
                    <th className="px-3 py-2">Unit</th>
                    <th className="px-3 py-2">Commodity</th>
                    <th className="px-3 py-2">Rate</th>
                    <th className="px-3 py-2">Sauda (Tons + Desc)</th>
                    <th className="px-3 py-2">Sauda No</th>
                    <th className="px-3 py-2">Total Tons</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companyData.location.flatMap((unit) =>
                    companyData.commodities.map((commodity) => {
                      const keyNorm = `${normalize(unit)}-${normalize(
                        commodity
                      )}`;
                      const newRate = rateMap[keyNorm] || 0;
                      if (newRate === 0) return null;

                      const key = `${unit}-${commodity}`;
                      const list = saudaEntries[key] || [];
                      sl += 1;

                      return (
                        <tr
                          key={key}
                          className="transition-all hover:bg-gray-50"
                        >
                          <td className="px-3 py-2">{sl}</td>
                          <td className="px-3 py-2 font-medium text-gray-800">
                            {unit}
                          </td>
                          <td className="px-3 py-2">{commodity}</td>
                          <td className="whitespace-nowrap px-3 py-2 font-semibold text-blue-700">
                            ₹ {newRate}
                          </td>

                          <td className="space-y-1 px-3 py-2">
                            {list.map((e, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <span className="font-semibold text-gray-500">
                                  {String.fromCharCode(97 + idx)}.
                                </span>
                                <input
                                  className="w-16 rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-300"
                                  placeholder="Tons"
                                  type="number"
                                  value={e.tons}
                                  onChange={(ev) =>
                                    handleSaudaChange(
                                      key,
                                      idx,
                                      "tons",
                                      ev.target.value
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-500">
                                  Tons
                                </span>
                                <input
                                  className="min-w-[100px] rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-300"
                                  placeholder="Desc"
                                  style={{
                                    width: `${Math.max(
                                      (e.description || "").length * 8 + 20,
                                      100
                                    )}px`,
                                  }}
                                  type="text"
                                  value={e.description}
                                  onChange={(ev) =>
                                    handleSaudaChange(
                                      key,
                                      idx,
                                      "description",
                                      ev.target.value
                                    )
                                  }
                                />
                              </div>
                            ))}
                            <button
                              className="text-xs text-blue-600 hover:underline"
                              onClick={() => addSaudaEntry(key)}
                            >
                              + Add Sauda
                            </button>
                          </td>

                          <td className="px-3 py-2">
                            <div className="flex flex-col gap-2">
                              {list.map((e, idx) => (
                                <input
                                  key={idx}
                                  className="w-20 rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-300"
                                  placeholder="No"
                                  type="number"
                                  value={e.saudaNo}
                                  onChange={(ev) =>
                                    handleSaudaChange(
                                      key,
                                      idx,
                                      "saudaNo",
                                      ev.target.value
                                    )
                                  }
                                />
                              ))}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 font-bold text-green-700">
                            {totalTons(key)} Tons
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
                  date={today()}
                  saudaEntries={saudaEntries}
                  rateData={rateData}
                  onClose={() => setShowSharePopup(false)}
                />
              )}
              <div className="mt-4 flex gap-3">
                <button
                  className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4" /> Save
                </button>
                <button
                  className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>

                {/* ✅ New Export Button */}
                <button
                  className="flex items-center gap-2 rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                  onClick={handelDownload}
                >
                  <Share2 className="h-4 w-4" /> Export
                </button>
              </div>
            </>
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default ManageCompanyPopup;
