"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const LOCAL_STORAGE_KEY = "sauda_notifications_cache";

export default function useSaudaNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const prevRawData = useRef("");

  const getTodayString = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
  };

  const filterAndSortToday = (items) => {
    const todayString = getTodayString();
    return items
      .filter((item) => item.tons > 0 && item.date === todayString)
      .sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        if (a.time < b.time) return 1;
        if (a.time > b.time) return -1;
        return 0;
      });
  };

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/save-sauda/notifications");
      const all = res.data.notifications || [];

      const filtered = filterAndSortToday(all);

      const rawDataString = JSON.stringify(filtered);
      if (rawDataString === prevRawData.current) return;

      prevRawData.current = rawDataString;
      localStorage.setItem(LOCAL_STORAGE_KEY, rawDataString);

      const enriched = await Promise.all(
        filtered.map(async (item) => {
          try {
            const rateRes = await axiosInstance.get("/rate", {
              params: {
                company: item.company,
                location: item.location,
                commodity: item.commodity,
              },
            });
            const match = rateRes.data.find(
              (r) =>
                r.company === item.company &&
                r.location === item.location &&
                r.commodity === item.commodity
            );
            return {
              ...item,
              rate: item.rate ?? match?.newRate ?? null,
            };
          } catch {
            return item;
          }
        })
      );

      setNotifications(enriched);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Error fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const filteredCache = filterAndSortToday(cachedData);
        setNotifications(filteredCache);
      } catch (e) {
        console.warn("Invalid cache format:", e);
      }
      setLoading(false);
    }

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredNotifications = useMemo(() => {
    if (!searchQuery) return notifications;
    const query = searchQuery.toLowerCase();
    return notifications.filter(
      (item) =>
        item.company.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.commodity.toLowerCase().includes(query)
    );
  }, [searchQuery, notifications]);

  return {
    loading,
    searchQuery,
    setSearchQuery,
    filteredNotifications,
  };
}
