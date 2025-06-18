"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const normalize = (s = "") => s.trim().toLowerCase();

export function useRateData(companyName) {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyName) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/rate?company=${companyName}`);
        mounted && setRates(data ?? []);
      } catch {
        toast.error("Failed to load rate data");
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [companyName]);

  const rateMap = useMemo(() => {
    const map = {};
    rates.forEach((r) => {
      map[`${normalize(r.location)}-${normalize(r.commodity)}`] =
        r.newRate ?? 0;
    });
    return map;
  }, [rates]);

  return { rates, rateMap, loading };
}
