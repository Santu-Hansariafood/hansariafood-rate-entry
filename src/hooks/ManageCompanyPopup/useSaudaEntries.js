"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { useToday } from "./useToday";

export function useSaudaEntries(company, rateMap) {
  const today = useToday();
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const normalize = useCallback((s) => s?.trim().toLowerCase() || "", []);

  useEffect(() => {
    if (!company) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/save-sauda?company=${company.name}&date=${today}`
        );
        const saved = data?.entry?.saudaEntries ?? {};

        if (!Object.keys(saved).length) {
          toast.info("No previous sauda data, starting fresh.");
        }

        const init = {};
        company.location.forEach((loc) =>
          company.commodities.forEach((comm) => {
            const k = `${loc}-${comm}`;
            const keyNorm = `${normalize(loc)}-${normalize(comm)}`;
            const newRate = rateMap?.[keyNorm]?.newRate ?? "";

            init[k] = saved[k]?.map((entry) => ({
              tons: entry.tons || "",
              saudaNo: entry.saudaNo || "",
              finalRate: entry.finalRate ?? newRate,
              others: entry.others || "",
              sellerName: entry.sellerName || "",
              sellerCompany: entry.sellerCompany || "",
              deliveryDate: entry.deliveryDate || "",
            })) ?? [
              {
                tons: "",
                saudaNo: "",
                finalRate: newRate,
                others: "",
                sellerName: "",
                sellerCompany: "",
                deliveryDate: "",
              },
            ];
          })
        );

        mounted && setEntries(init);
      } catch {
        toast.error("Failed to load sauda data");
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [company, today, rateMap, normalize]);

  const handleChange = useCallback((key, idx, field, val) => {
    setEntries((prev) => {
      const list = [...prev[key]];
      const currentEntry = list[idx];
      if (field === "saudaNo" && currentEntry.saudaNo) {
        return prev;
      }

      list[idx] = { ...currentEntry, [field]: val };
      return { ...prev, [key]: list };
    });
  }, []);

  const addRow = useCallback(
    (key, defaultRate = "") =>
      setEntries((prev) => ({
        ...prev,
        [key]: [
          ...prev[key],
          {
            tons: "",
            saudaNo: "",
            finalRate: defaultRate,
            others: "",
            sellerName: "",
            sellerCompany: "",
            deliveryDate: "",
          },
        ],
      })),
    []
  );

  const removeRow = useCallback((key, idx) => {
    setEntries((prev) => {
      const list = [...prev[key]];
      if (list.length > 1) {
        list.splice(idx, 1);
        return { ...prev, [key]: list };
      }
      return prev;
    });
  }, []);

  const totalTons = useCallback(
    (key) => entries[key]?.reduce((s, e) => s + (+e.tons || 0), 0),
    [entries]
  );

  const applyServerEntries = useCallback(
    (key, serverList) => {
      setEntries((prev) => {
        if (!prev[key]) return prev;
        const [loc, comm] = key.split("-");
        const keyNorm = `${normalize(loc)}-${normalize(comm)}`;
        const newRate = rateMap?.[keyNorm]?.newRate ?? "";
        const list = Array.isArray(serverList) ? serverList : [];
        const mapped =
          list.length > 0
            ? list.map((entry) => ({
                tons: entry.tons || "",
                saudaNo: entry.saudaNo || "",
                finalRate: entry.finalRate ?? newRate,
                others: entry.others || "",
                sellerName: entry.sellerName || "",
                sellerCompany: entry.sellerCompany || "",
                deliveryDate: entry.deliveryDate || "",
              }))
            : [
                {
                  tons: "",
                  saudaNo: "",
                  finalRate: newRate,
                  others: "",
                  sellerName: "",
                  sellerCompany: "",
                  deliveryDate: "",
                },
              ];
        return { ...prev, [key]: mapped };
      });
    },
    [normalize, rateMap]
  );

  return {
    entries,
    handleChange,
    addRow,
    removeRow,
    totalTons,
    applyServerEntries,
    loading,
  };
}
