"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const formatDateForAPI = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
};

const todayISO = new Date().toISOString().split("T")[0];

const usePreviousSauda = () => {
  const [date, setDate] = useState(todayISO);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState({});

  const fetchSauda = useCallback(async (selectedDate) => {
    try {
      setLoading(true);
      const formattedDate = formatDateForAPI(selectedDate);
      const res = await axiosInstance.get(
        `/save-sauda/get-by-date?date=${encodeURIComponent(formattedDate)}`
      );

      const docs = res.data.entries || [];

      const flatEntries = docs.flatMap((doc) =>
        Object.entries(doc.saudaEntries || {}).flatMap(([unit, list]) =>
          list.map((item) => ({
            unit: unit.split("-")[0],
            saudaNo: item.saudaNo,
            commodity: item.commodity,
            sellerName: item.sellerName,
            sellerCompany: item.sellerCompany,
            tons: item.tons,
            finalRate: item.finalRate,
            others: item.others,
          }))
        )
      );

      const withSerial = flatEntries
        .sort((a, b) => Number(a.saudaNo) - Number(b.saudaNo))
        .map((entry, index) => ({
          sl: index + 1,
          ...entry,
        }));

      setEntries(withSerial);
    } catch (err) {
      toast.error("Failed to fetch Sauda entries");
      console.error("Error fetching sauda:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/sauda-status");
      const statusMap = {};
      (res.data.statuses || []).forEach((s) => {
        statusMap[s.saudaNo] = s.status;
      });
      setStatuses(statusMap);
    } catch (err) {
      console.error("Error fetching statuses:", err);
    }
  }, []);

  useEffect(() => {
    fetchSauda(date);
    fetchStatuses();
  }, [date, fetchSauda, fetchStatuses]);

  const filteredEntries = useMemo(() => {
    if (!search) return entries;
    return entries.filter((item) =>
      item.saudaNo?.toLowerCase().includes(search.toLowerCase())
    );
  }, [entries, search]);

  return {
    date,
    setDate,
    entries: filteredEntries,
    loading,
    search,
    setSearch,
    statuses,
    fetchStatuses,
  };
};

export default usePreviousSauda;
