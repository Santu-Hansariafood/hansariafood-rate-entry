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
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (selectedDate) => {
    try {
      setLoading(true);

      const formattedDate = formatDateForAPI(selectedDate);
      const [saudaRes, statusRes] = await Promise.all([
        axiosInstance.get(
          `/save-sauda/get-by-date?date=${encodeURIComponent(formattedDate)}`
        ),
        axiosInstance.get("/sauda-status"),
      ]);

      const docs = saudaRes.data.entries || [];
      const flatEntries = docs.flatMap((doc) =>
        Object.entries(doc.saudaEntries || {}).flatMap(([unit, list]) =>
          list.map((item) => ({
            buyerName: doc.buyer || "",
            buyerCompany: doc.company || "",
            consignee: unit,
            unit: unit.split("-")[0],
            saudaNo: item.saudaNo,
            commodity: item.commodity,
            sellerName: item.sellerName,
            sellerCompany: item.sellerCompany,
            tons: item.tons,
            finalRate: item.finalRate,
            deliveryDate: item.deliveryDate,
            others: item.others,
          }))
        )
      );

      const withSerial = flatEntries
        .sort((a, b) => Number(a.saudaNo) - Number(b.saudaNo))
        .map((entry, index) => ({ sl: index + 1, ...entry }));

      setEntries(withSerial);
      const statusMap = {};
      (statusRes.data.statuses || []).forEach((s) => {
        statusMap[s.saudaNo] = s.status;
      });
      setStatuses(statusMap);
    } catch (err) {
      toast.error("Failed to fetch Sauda data");
      console.error("Error fetching:", err);
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
      console.error("Failed to fetch statuses:", err);
    }
  }, []);

  useEffect(() => {
    fetchData(date);
  }, [date, fetchData]);

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
    setStatuses,
    fetchData,
    fetchStatuses,
  };
};

export default usePreviousSauda;
