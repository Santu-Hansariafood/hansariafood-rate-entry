"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { useToday } from "./useToday";

export function useSaudaEntries(company) {
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

        const init = {};
        company.location.forEach((loc) =>
          company.commodities.forEach((comm) => {
            const k = `${loc}-${comm}`;
            init[k] = saved[k] ?? [{ tons: "", description: "", saudaNo: "" }];
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
  }, [company, today]);

  const handleChange = useCallback((key, idx, field, val) => {
    setEntries((prev) => {
      const list = [...prev[key]];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, [key]: list };
    });
  }, []);

  const addRow = useCallback(
    (key) =>
      setEntries((prev) => ({
        ...prev,
        [key]: [...prev[key], { tons: "", description: "", saudaNo: "" }],
      })),
    []
  );

  const totalTons = useCallback(
    (key) => entries[key]?.reduce((s, e) => s + (+e.tons || 0), 0),
    [entries]
  );

  return { entries, handleChange, addRow, totalTons, loading };
}
