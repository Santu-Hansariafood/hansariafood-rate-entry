"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const LOCAL_STORAGE_KEY = "sauda_notifications_cache";

export default function useSaudaNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const getTodayString = useCallback(() => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
  }, []);

  const filterAndSortToday = useCallback(
    (items) => {
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
    },
    [getTodayString]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/save-sauda/notifications");
      const all = res.data.notifications || [];

      const filtered = filterAndSortToday(all);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

      if (filtered.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      let allRates = [];
      try {
        const ratesRes = await axiosInstance.get("/rate");
        allRates = ratesRes.data || [];
      } catch (err) {
        console.warn("Failed to fetch rates:", err);
      }

      const rateMap = new Map();
      allRates.forEach((rate) => {
        const key = `${rate.company}|${rate.location}|${rate.commodity}`;
        rateMap.set(key, rate);
      });

      const enriched = filtered.map((item) => {
        const key = `${item.company}|${item.location}|${item.commodity}`;
        const match = rateMap.get(key);

        return {
          ...item,
          rate: item.rate ?? match?.newRate ?? null,
          others: item.others || match?.others || "",
          payment: match?.payment ?? null,
        };
      });

      setNotifications(enriched);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Error fetching notifications");
    } finally {
      setLoading(false);
    }
  }, [filterAndSortToday]);

  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const filteredCache = filterAndSortToday(cachedData);
        if (filteredCache.length > 0) {
          setNotifications(filteredCache);
          setLoading(false);
        }
      } catch {}
    }

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications, filterAndSortToday]);

  useEffect(() => {
    const handler = () => fetchNotifications();
    window.addEventListener("sauda_updated", handler);
    return () => window.removeEventListener("sauda_updated", handler);
  }, [fetchNotifications]);

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
    notifications,
    filteredNotifications,
  };
}
