"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export function useRateCountData() {
  const [rateData, setRateData] = useState([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axiosInstance.get("/rate/stats");
        const stats = Array.isArray(res.data) ? res.data : [];

        const parsedData = stats.map((item) => {
          const [year, month, day] = item._id.split("-").map(Number);
          return {
            date: new Date(year, month - 1, day),
            count: item.count || 0,
            label: new Date(year, month - 1, day).toLocaleDateString(
              "en-GB"
            ),
          };
        });

        setRateData(parsedData);
      } catch (err) {
        toast.error("Failed to load rate data.");
        console.error("Fetch error:", err);
      }
    };

    fetchRates();
  }, []);

  return rateData;
}
