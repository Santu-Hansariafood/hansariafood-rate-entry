"use client";
import { useState, useMemo } from "react";

export default function useNotificationFilter(
  notifications = [],
  parseUpdateTime
) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifications = useMemo(() => {
    let result = [...(notifications || [])]
      .filter((n) => n.newRate)
      .sort((a, b) => {
        const aDate = new Date(a.lastUpdated || a.updatedAt || a.newRateDate || 0);
        const bDate = new Date(b.lastUpdated || b.updatedAt || b.newRateDate || 0);

        const aTime = a.updateTime ? parseUpdateTime(a.updateTime) : 0;
        const bTime = b.updateTime ? parseUpdateTime(b.updateTime) : 0;
        
        return bDate.getTime() + bTime - (aDate.getTime() + aTime);
      });

    result = result.filter((n) => {
      if (filter === "read") return n.read;
      if (filter === "unread") return !n.read;
      return true;
    });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((n) =>
        (n.company || "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [notifications, filter, searchQuery, parseUpdateTime]);

  return { filter, setFilter, searchQuery, setSearchQuery, filteredNotifications };
}
