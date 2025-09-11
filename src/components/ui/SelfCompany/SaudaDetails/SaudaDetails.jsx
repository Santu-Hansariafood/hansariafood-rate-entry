"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

const SaudaDetails = ({ companyName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!companyName) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(
          `/save-sauda/sauda-descriptions?companyName=${encodeURIComponent(
            companyName
          )}&page=1`
        );
        const results = res?.data?.data?.[0];
        const days = results?.days || [];
        if (mounted) setData(days);
      } catch (e) {
        if (mounted) setError("Failed to load sauda details");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [companyName]);

  const orderedDays = useMemo(() => {
    const monthMap = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      sept: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };

    const toTimestamp = (value) => {
      const s = String(value).trim();
      if (!s) return -Infinity;
      const native = Date.parse(s);
      if (!Number.isNaN(native)) return native;
      let m = /^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/.exec(s);
      if (m) {
        const yyyy = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10) - 1;
        const dd = parseInt(m[3], 10);
        return new Date(yyyy, mm, dd).getTime();
      }
      m = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/.exec(s);
      if (m) {
        const dd = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10) - 1;
        const yyyy = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
        return new Date(yyyy, mm, dd).getTime();
      }
      m = /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{2,4})$/.exec(s);
      if (m) {
        const dd = parseInt(m[1], 10);
        const mon = monthMap[m[2].toLowerCase()];
        const yyyy = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
        if (mon !== undefined) return new Date(yyyy, mon, dd).getTime();
      }
      m = /^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{2,4})$/.exec(s);
      if (m) {
        const mon = monthMap[m[1].toLowerCase()];
        const dd = parseInt(m[2], 10);
        const yyyy = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
        if (mon !== undefined) return new Date(yyyy, mon, dd).getTime();
      }

      return -Infinity;
    };

    const startTs = startDate ? toTimestamp(startDate) : -Infinity;
    const endTs = endDate ? toTimestamp(endDate) : Infinity;

    const withinRange = (d) => {
      const ts = toTimestamp(d.date);
      return ts >= startTs && ts <= endTs;
    };

    const filtered = data.filter(withinRange);
    return [...filtered].sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
  }, [data, startDate, endDate]);

  if (loading)
    return (
      <Loading/>
    );
  if (error) return <div className="py-6 text-sm text-red-500">{error}</div>;
  if (!orderedDays.length)
    return (
      <div className="py-6 text-sm text-gray-500 dark:text-gray-400">
        No sauda found for this company.
      </div>
    );

  return (
    <div className="space-y-4 max-h-[72vh] overflow-auto pr-1">
      <div className="flex flex-wrap items-end gap-3 sticky top-0 bg-gray-50 dark:bg-gray-800/50 py-2 z-10">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1"
          />
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="text-xs px-3 py-1 rounded bg-red-200 dark:bg-red-700 text-gray-800 dark:text-gray-200"
          >
            Clear
          </button>
        )}
      </div>
      {orderedDays.map((day) => (
        <div
          key={day.date}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{day.date}</h3>
            <span className="text-xs text-gray-500">
              Total Tons: {day.dayTotalTons}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-md border border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900">
              <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                Purchase History
              </div>
              {day.units.map((u, idx) => (
                <div key={`buy-${idx}`} className="mb-3 last:mb-0">
                  <div className="text-xs font-medium mb-1">Unit: {u.unit}</div>
                  <div className="space-y-2">
                    {u.commodities.map((co, cidx) => (
                      <div key={`buy-${idx}-${cidx}`}>
                        <div className="text-xs font-medium">
                          {co.commodity}{" "}
                          <span className="text-[10px] text-gray-500">
                            ({co.totalTons} Tons)
                          </span>
                        </div>
                        <div className="mt-1 border-t border-gray-100 dark:border-gray-700 pt-1 space-y-1">
                          {co.saudas.map((s, sidx) => {
                            const totalPrice =
                              (Number(s.finalRate) || 0) *
                              (Number(s.tons) || 0);
                            return (
                              <div
                                key={`buy-${idx}-${cidx}-${sidx}`}
                                className="text-[11px] flex items-center justify-between"
                              >
                                <div className="truncate">
                                  <span className="text-green-700 dark:text-green-300 font-semibold">
                                    #{s.saudaNo || "-"}
                                  </span>{" "}
                                  • {s.sellerName || "-"}
                                  {s.sellerCompany
                                    ? ` (${s.sellerCompany})`
                                    : ""}
                                </div>
                                <div className="text-right min-w-[160px]">
                                  <span className="mr-2">{s.tons}Tons</span>
                                  <span className="font-semibold text-green-700 dark:text-green-300">
                                    {s.finalRate}
                                  </span>
                                  <span className="text-gray-500 ml-1">
                                    {s.unit}
                                  </span>
                                  <div className="text-[10px] text-green-800 dark:text-green-300">
                                    = {totalPrice.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900">
              <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                Sales History
              </div>
              {day.units.map((u, idx) => (
                <div key={`sell-${idx}`} className="mb-3 last:mb-0">
                  <div className="text-xs font-medium mb-1">Unit: {u.unit}</div>
                  <div className="space-y-2">
                    {u.commodities.map((co, cidx) => (
                      <div key={`sell-${idx}-${cidx}`}>
                        <div className="text-xs font-medium">
                          {co.commodity}{" "}
                          <span className="text-[10px] text-gray-500">
                            ({co.totalTons} Tons)
                          </span>
                        </div>
                        <div className="mt-1 border-t border-gray-100 dark:border-gray-700 pt-1 space-y-1">
                          {co.saudas.map((s, sidx) => {
                            const totalPrice =
                              (Number(s.finalRate) || 0) *
                              (Number(s.tons) || 0);
                            return (
                              <div
                                key={`sell-${idx}-${cidx}-${sidx}`}
                                className="text-[11px] flex items-center justify-between"
                              >
                                <div className="truncate">
                                  <span className="text-yellow-700 dark:text-yellow-300 font-semibold">
                                    #{s.saudaNo || "-"}
                                  </span>{" "}
                                  • {s.sellerName || "-"}
                                  {s.sellerCompany
                                    ? ` (${s.sellerCompany})`
                                    : ""}
                                </div>
                                <div className="text-right min-w-[160px]">
                                  <span className="mr-2">{s.tons}Tons</span>
                                  <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                                    {s.finalRate}
                                  </span>
                                  <span className="text-gray-500 ml-1">
                                    {s.unit}
                                  </span>
                                  <div className="text-[10px] text-yellow-800 dark:text-yellow-300">
                                    = &#8377; {totalPrice.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SaudaDetails;
