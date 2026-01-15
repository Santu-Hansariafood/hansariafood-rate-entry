"use client";

import React, { Suspense, useMemo } from "react";
import { XCircle, CalendarDays, Factory, Package, Hash, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));

// Utility function to format rate properly
const formatRate = (rate) => {
  if (rate === null || rate === undefined || rate === "") return "—";
  const numRate = Number(rate);
  if (isNaN(numRate) || numRate <= 0) return "—";
  return `₹${numRate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Utility function to format tons properly
const formatTons = (tons) => {
  if (tons === null || tons === undefined || tons === "") return "0.00";
  const numTons = Number(tons);
  if (isNaN(numTons) || numTons < 0) return "0.00";
  return numTons.toFixed(2);
};

// Utility function to validate and calculate value
const calculateValue = (tons, rate) => {
  const numTons = Number(tons) || 0;
  const numRate = Number(rate) || 0;
  if (isNaN(numTons) || isNaN(numRate) || numTons <= 0 || numRate <= 0) return 0;
  return numTons * numRate;
};

const SaudaDetails = ({
  selectedSeller,
  saudaDetails,
  loading,
  error,
  onClearSelection,
}) => {
  const sortDaysByDate = (days) => {
    if (!Array.isArray(days)) return [];
    return [...days].sort((a, b) => {
      try {
        const [da, ma, ya] = (a.date || "").split("-");
        const [db, mb, yb] = (b.date || "").split("-");
        const ta = new Date(Number(ya), Number(ma) - 1, Number(da)).getTime();
        const tb = new Date(Number(yb), Number(mb) - 1, Number(db)).getTime();
        if (isNaN(ta) || isNaN(tb)) return 0;
        return tb - ta;
      } catch (err) {
        console.error("Error sorting dates:", err);
        return 0;
      }
    });
  };

  // Validate and process sauda details
  const validatedSaudaDetails = useMemo(() => {
    if (!Array.isArray(saudaDetails)) return [];
    
    return saudaDetails.map((company) => {
      if (!company || !company.days || !Array.isArray(company.days)) return company;
      
      const processedDays = company.days.map((day) => {
        if (!day || !day.units || !Array.isArray(day.units)) return day;
        
        const processedUnits = day.units.map((unit) => {
          if (!unit || !unit.commodities || !Array.isArray(unit.commodities)) return unit;
          
          const processedCommodities = unit.commodities.map((commodity) => {
            if (!commodity || !commodity.saudas || !Array.isArray(commodity.saudas)) return commodity;
            
            const processedSaudas = commodity.saudas.map((sauda) => {
              const validatedSauda = {
                ...sauda,
                tons: formatTons(sauda.tons),
                finalRate: sauda.finalRate ? Number(sauda.finalRate) : 0,
                value: calculateValue(sauda.tons, sauda.finalRate),
              };
              
              // Validate rate
              if (!validatedSauda.finalRate || validatedSauda.finalRate <= 0) {
                validatedSauda.hasInvalidRate = true;
              }
              
              return validatedSauda;
            });
            
            // Recalculate total tons for commodity
            const commodityTotalTons = processedSaudas.reduce(
              (sum, s) => sum + (Number(s.tons) || 0),
              0
            );
            
            return {
              ...commodity,
              saudas: processedSaudas,
              totalTons: commodityTotalTons,
            };
          });
          
          // Recalculate unit total tons
          const unitTotalTons = processedCommodities.reduce(
            (sum, c) => sum + (Number(c.totalTons) || 0),
            0
          );
          
          return {
            ...unit,
            commodities: processedCommodities,
            unitTotalTons,
          };
        });
        
        // Recalculate day total tons
        const dayTotalTons = processedUnits.reduce(
          (sum, u) => sum + (Number(u.unitTotalTons) || 0),
          0
        );
        
        return {
          ...day,
          units: processedUnits,
          dayTotalTons,
        };
      });
      
      // Recalculate company total tons
      const companyTotalTons = processedDays.reduce(
        (sum, d) => sum + (Number(d.dayTotalTons) || 0),
        0
      );
      
      return {
        ...company,
        days: processedDays,
        companyTotalTons,
      };
    });
  }, [saudaDetails]);

  if (!selectedSeller) {
    return (
      <Suspense fallback={<Loading />}>
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Title text="Select a Seller" />
            <p className="text-gray-500 dark:text-gray-400 mt-3 italic">
              Choose a seller from the left sidebar to view their sauda details.
            </p>
          </div>
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="lg:col-span-3">
        <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <Title text={`${selectedSeller} - Sauda Details`} />
            <button
              onClick={onClearSelection}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-lg shadow-md transition-all"
            >
              <XCircle size={18} /> Clear
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Please try again or contact support if the issue persists.
              </p>
            </div>
          ) : validatedSaudaDetails?.length ? (
            <div className="space-y-6">
              {validatedSaudaDetails.map((company) => (
                <div
                  key={company.company}
                  className="border border-purple-300 dark:border-purple-600 rounded-xl p-6 bg-gradient-to-r from-purple-50 to-fuchsia-100 dark:from-purple-800 dark:to-fuchsia-900 shadow-md"
                >
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                      <Factory size={20} />{" "}
                      <span className="italic">{company.company}</span>
                    </h3>
                    <span className="px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow">
                      Total: <i>{formatTons(company.companyTotalTons)}</i>{" "}
                      Tons
                    </span>
                  </div>
                  <div className="space-y-5">
                    {sortDaysByDate(company.days).map((day, i) => (
                      <div
                        key={`${day.date}-${i}`}
                        className="rounded-lg p-4 border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-800 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                            <CalendarDays size={18} />{" "}
                            <span className="italic">{day.date}</span>
                          </h4>
                          <span className="text-sm bg-amber-600 text-white px-3 py-1 rounded-full shadow font-medium">
                            Day Total:{" "}
                            <i>{formatTons(day.dayTotalTons)}</i> Tons
                          </span>
                        </div>
                        <div className="space-y-4">
                          {day.units.map((unitObj, uIdx) => (
                            <div
                              key={`${unitObj.unit}-${uIdx}`}
                              className="rounded-lg p-4 border border-blue-300 bg-gradient-to-r from-blue-50 to-sky-100 dark:from-blue-900 dark:to-sky-800 shadow-sm"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-semibold text-sky-900 dark:text-sky-200 flex items-center gap-2">
                                  <Package size={18} />{" "}
                                  <span className="italic">{unitObj.unit}</span>
                                </h5>
                                <span className="text-xs bg-sky-600 text-white px-2 py-1 rounded-full shadow font-semibold">
                                  Total Saudas:{" "}
                                  <i>
                                    {formatTons(unitObj.unitTotalTons)}
                                  </i>{" "}
                                  Tons
                                </span>
                              </div>
                              <div className="space-y-3">
                                {unitObj.commodities.map((com, j) => (
                                  <div
                                    key={j}
                                    className="rounded-lg p-3 border border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-800 shadow-md"
                                  >
                                    <h6 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                                      🧺{" "}
                                      <span className="italic">
                                        {com.commodity}
                                      </span>{" "}
                                      (<i>{formatTons(com.totalTons)}</i>{" "}
                                      Tons)
                                    </h6>
                                    <div className="space-y-2">
                                      {com.saudas.map((s, k) => (
                                        <div
                                          key={k}
                                          className={`flex items-center justify-between text-sm px-3 py-2 rounded-md border transition-all duration-200 hover:scale-[1.01] ${
                                            k % 2 === 0
                                              ? "bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500"
                                              : "bg-gray-50 dark:bg-gray-500 border-gray-200 dark:border-gray-600"
                                          }`}
                                        >
                                          <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                            <Hash size={14} /> Sauda No.{" "}
                                            <span className="italic font-medium">
                                              {" "}
                                              — {s.saudaNo || "—"}
                                            </span>
                                          </span>
                                          <div className="flex flex-col items-end gap-1">
                                            <span className={`text-gray-700 dark:text-gray-100 font-bold italic ${
                                              s.hasInvalidRate ? "text-red-600 dark:text-red-400" : ""
                                            }`}>
                                              {formatTons(s.tons)} Tons {com.commodity} at{" "}
                                              {s.unit} Location @ {formatRate(s.finalRate)}
                                            </span>
                                            {s.hasInvalidRate && (
                                              <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                Invalid Rate
                                              </span>
                                            )}
                                            {s.value > 0 && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Value: {formatRate(s.value)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg italic">
                No sauda entries for {selectedSeller} yet.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg italic">
                {selectedSeller} is not selling anything through Hansaria Food
                Private Limited.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg italic">
                please choose a different seller to view their sauda details.
              </p>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default SaudaDetails;
