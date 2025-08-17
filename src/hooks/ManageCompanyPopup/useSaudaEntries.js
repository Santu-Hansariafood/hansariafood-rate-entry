"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { useToday } from "./useToday";

export function useSaudaEntries(company, rateMap) {
  const today = useToday();
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);

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

        const normalize = (s) => s?.trim().toLowerCase() || "";
        const init = {};
        company.location.forEach((loc) =>
          company.commodities.forEach((comm) => {
            const k = `${loc}-${comm}`;
            const keyNorm = `${normalize(loc)}-${normalize(comm)}`;
            const newRate = rateMap?.[keyNorm]?.newRate ?? "";

            init[k] = saved[k]?.map((entry) => ({
              tons: entry.tons || "",
              description: entry.description || "",
              saudaNo: entry.saudaNo || "",
              finalRate: entry.finalRate ?? newRate,
              others: entry.others || "",
            })) ?? [
              {
                tons: "",
                description: "",
                saudaNo: "",
                finalRate: newRate,
                others: "",
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
  }, [company, today, rateMap]);

  const handleChange = useCallback((key, idx, field, val) => {
    setEntries((prev) => {
      const list = [...prev[key]];
      list[idx] = { ...list[idx], [field]: val };
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
            description: "",
            saudaNo: "",
            finalRate: defaultRate,
            others: "",
          },
        ],
      })),
    []
  );

  const totalTons = useCallback(
    (key) => entries[key]?.reduce((s, e) => s + (+e.tons || 0), 0),
    [entries]
  );

  return { entries, handleChange, addRow, totalTons, loading };
}
