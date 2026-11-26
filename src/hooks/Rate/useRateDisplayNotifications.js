"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export default function useRateDisplayNotifications({ enabled = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const socket = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/rate", {
        params: { todayOnly: true, sort: "updatedAt_desc", limit: 100 },
      });
      setNotifications(
        data.sort(
          (a, b) =>
            new Date(b.lastUpdated || b.updatedAt || 0) -
            new Date(a.lastUpdated || a.updatedAt || 0),
        ),
      );
    } catch (error) {
      console.error("Failed to fetch rate notifications:", error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    fetchNotifications();
    window.addEventListener("rates-updated", fetchNotifications);

    return () => {
      window.removeEventListener("rates-updated", fetchNotifications);
    };
  }, [enabled, fetchNotifications]);

  useEffect(() => {
    if (!enabled || !socket) return;

    const handleNotification = (payload) => {
      if (payload.type === "rate") {
        fetchNotifications();
      }
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [enabled, fetchNotifications, socket]);

  return { notifications, refreshNotifications: fetchNotifications };
}
