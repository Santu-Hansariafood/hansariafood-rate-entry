import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const LOCAL_STORAGE_KEY = "sauda_notifications_cache";

export default function useSaudaNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/save-sauda/notifications");
      const all = res.data.notifications || [];
      const filtered = all.filter((item) => item.tons && item.tons > 0);

      setNotifications(filtered);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      setLoading(false);

      const enriched = await Promise.all(
        filtered.map(async (item) => {
          try {
            const res = await axiosInstance.get("/rate", {
              params: {
                company: item.company,
                location: item.location,
                commodity: item.commodity,
              },
            });
            const match = res.data.find(
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(enriched));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Error fetching notifications");
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      setNotifications(JSON.parse(cached));
      setLoading(false);
    } else {
      fetchNotifications();
    }

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
