"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://hansariafood.in/');
const LOCAL_STORAGE_KEY = "sauda_notifications_cache";

export default function useSaudaNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const rateCacheRef = useRef({ data: [], lastFetched: 0 });

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
      const limited = filtered.slice(0, 200);

      const compact = limited.map((item) => ({
        company: item.company,
        location: item.location,
        commodity: item.commodity,
        tons: item.tons,
        date: item.date,
        time: item.time,
      }));

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(compact));
      } catch {}

      if (filtered.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      let allRates = [];
      try {
        const now = Date.now();
        if (
          rateCacheRef.current.data.length > 0 &&
          now - rateCacheRef.current.lastFetched < 5 * 60 * 1000
        ) {
          allRates = rateCacheRef.current.data;
        } else {
          const ratesRes = await axiosInstance.get("/rate?todayOnly=true");
          allRates = Array.isArray(ratesRes.data) ? ratesRes.data : [];
          rateCacheRef.current = { data: allRates, lastFetched: now };
        }
      } catch (err) {
        console.warn("Failed to fetch rates:", err);
      }

      const rateMap = new Map();
      allRates.forEach((rate) => {
        const key = `${rate.company}|${rate.location}|${rate.commodity}`;
        rateMap.set(key, rate);
      });

      const enriched = limited.map((item) => {
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

    const socket = io(socketUrl);

    socket.on("notification", (payload) => {
      if (payload.type === "sauda") {
        fetchNotifications();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchNotifications, filterAndSortToday]);

  useEffect(() => {
    const handleFocus = () => {
      fetchNotifications();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
