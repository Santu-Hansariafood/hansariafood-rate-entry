"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

export default function useSoyaRates(date, search) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

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

        const history = rateRes.data || {};
        const locationMap = {};

        history.forEach((r) => {
          if (!locationMap[r.location]) {
            locationMap[r.location] = {};
          }
          locationMap[r.location][r.commodity] = r.newRate;
        });

        if (Object.keys(locationMap).length === 0) {
          tableRows.push({
            company: company.name,
            location: "-",
            ...Object.fromEntries(COMMODITIES.map((c) => [c, "-"])),
          });
        } else {
          Object.entries(locationMap).forEach(([location, rates]) => {
            const row = {
              company: company.name,
              location,
            };

            COMMODITIES.forEach((c) => {
              row[c] = rates[c] || "-";
            });

            tableRows.push(row);
          });
        }
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
    fetchData();
  }, [fetchData]);

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
