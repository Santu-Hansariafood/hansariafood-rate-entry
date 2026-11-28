"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "@/utils/toast/toast";
import { useSocket } from "@/context/SocketContext";

const LOCAL_STORAGE_KEY = "sauda_notifications_cache_v2";

export default function useSaudaNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const rateCacheRef = useRef({ data: [], lastFetched: 0 });
  const socket = useSocket();

  const sortNotifications = useCallback((items) => {
    const getDateValue = (value) => {
      const [day, month, year] = String(value || "").split("-").map(Number);
      if (day && month && year) {
        return new Date(year, month - 1, day).getTime();
      }
      return new Date(value).getTime() || 0;
    };

    const getSerialNumber = (value) =>
      Number.parseInt(String(value || "").split("-").pop(), 10) || 0;

    return items
      .filter((item) => Number(item.tons) > 0)
      .sort((a, b) => {
        const dateDifference = getDateValue(b.date) - getDateValue(a.date);
        if (dateDifference) return dateDifference;

        const serialDifference =
          getSerialNumber(b.saudaNo) - getSerialNumber(a.saudaNo);
        if (serialDifference) return serialDifference;

        return String(b.time || "").localeCompare(String(a.time || ""));
      });
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/save-sauda/notifications");
      const all = res.data.notifications || [];

      const filtered = sortNotifications(all);
      const limited = filtered.slice(0, 200);

      if (limited.length === 0) {
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

      const today = new Date();
      const todayString = `${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${today.getFullYear()}`;
      const enriched = limited.map((item) => {
        const key = `${item.company}|${item.location}|${item.commodity}`;
        const match = item.date === todayString ? rateMap.get(key) : null;

        return {
          ...item,
          rate: item.rate ?? match?.newRate ?? null,
          others: item.others || match?.others || "",
          payment: match?.payment ?? null,
        };
      });

      setNotifications(enriched);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(enriched));
      } catch {}
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Error fetching notifications");
    } finally {
      setLoading(false);
    }
  }, [sortNotifications]);

  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const filteredCache = sortNotifications(cachedData).slice(0, 200);
        if (filteredCache.length > 0) {
          setNotifications(filteredCache);
          setLoading(false);
        }
      } catch {}
    }

    fetchNotifications();

    if (!socket) return;

    const handleNotification = (payload) => {
      if (payload.type === "sauda") {
        fetchNotifications();
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [fetchNotifications, sortNotifications, socket]);

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
