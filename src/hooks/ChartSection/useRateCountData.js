"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export function useRateCountData() {
  const [rateData, setRateData] = useState([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axiosInstance.get("/rate");
        const data = res.data;

        const allRates = [];

        data.forEach((item) => {
          item.oldRates.forEach((entry) => {
            const [rateStr, dateStr] = entry.split(" (");
            const date = dateStr?.replace(")", "").trim();
            allRates.push({ date, rate: parseFloat(rateStr) });
          });

          if (item.hasNewRateToday && item.newRate !== "") {
            const today = new Date(item.lastUpdated).toLocaleDateString(
              "en-GB"
            );
            allRates.push({ date: today, rate: parseFloat(item.newRate) });
          }
        });

        const groupedByDate = {};
        allRates.forEach(({ date }) => {
          if (!groupedByDate[date]) groupedByDate[date] = 0;
          groupedByDate[date]++;
        });

        const parsedData = Object.entries(groupedByDate).map(
          ([dateStr, count]) => {
            const [day, month, year] = dateStr.split("/").map(Number);
            return {
              date: new Date(year, month - 1, day),
              count,
              label: dateStr,
            };
          }
        );

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
