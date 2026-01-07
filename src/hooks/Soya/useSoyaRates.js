"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const COMMODITIES = [
  "SBM 46%",
  "SBM 47%",
  "SBM 48%",
  "SBM 49%",
  "SBM 50%",
  "SBM 51%",
];

const formatRate = (newRate, oldRate) => {
  if (!newRate) return "-";

  const diff =
    oldRate !== undefined && oldRate !== null
      ? Number(newRate) - Number(oldRate)
      : 0;

  return (
    <span className="font-medium text-gray-800">
      {newRate}
      {diff !== 0 && (
        <span
          className={`ml-1 text-sm font-semibold ${
            diff > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ({diff > 0 ? `+${diff}` : diff})
        </span>
      )}
    </span>
  );
};

export default function useSoyaRates(date, search) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const lastFetchedDateRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const companyRes = await axiosInstance.get("/soyacompany");
      const companies = companyRes.data?.companies || [];

      const tableRows = [];

      for (const company of companies) {
        const rateRes = await axiosInstance.get(
          `/ratehistory/${company._id}?date=${date}`
        );

        const history = rateRes.data || [];
        const locationMap = {};

        history.forEach((r) => {
          if (!locationMap[r.location]) locationMap[r.location] = {};
          locationMap[r.location][r.commodity] = {
            newRate: r.newRate,
            oldRate: r.oldRate,
          };
        });

        if (Object.keys(locationMap).length === 0) continue;

        Object.entries(locationMap).forEach(([location, rates]) => {
          const row = { company: company.name, location };
          let hasAnyRate = false;

          COMMODITIES.forEach((c) => {
            const rateObj = rates[c];
            if (rateObj?.newRate) hasAnyRate = true;

            row[c] = rateObj
              ? formatRate(rateObj.newRate, rateObj.oldRate)
              : "-";
          });

          if (hasAnyRate) tableRows.push(row);
        });
      }

      setRows(tableRows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Soya rates");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (lastFetchedDateRef.current === date) return;
    lastFetchedDateRef.current = date;

    fetchData();
  }, [date, fetchData]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;

    return rows.filter(
      (r) =>
        r.company.toLowerCase().includes(search.toLowerCase()) ||
        r.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  return {
    loading,
    rows: filteredRows,
    commodities: COMMODITIES,
  };
}
