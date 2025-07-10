"use client";
import { useState, useMemo } from "react";

export default function useNotificationFilter(
  notifications = [],
  parseUpdateTime
) {
  const [filter, setFilter] = useState("all");

  const filteredNotifications = useMemo(() => {
    return [...(notifications || [])]
      .filter((n) => n.newRate)
      .sort((a, b) => {
        const aDate = new Date(a.newRateDate || a.updatedAt || 0);
        const bDate = new Date(b.newRateDate || b.updatedAt || 0);

        const aTime = a.updateTime ? parseUpdateTime(a.updateTime) : 0;
        const bTime = b.updateTime ? parseUpdateTime(b.updateTime) : 0;
        return bDate.getTime() + bTime - (aDate.getTime() + aTime);
      })
      .filter((n) => {
        if (filter === "read") return n.read;
        if (filter === "unread") return !n.read;
        return true;
      });
  }, [notifications, filter, parseUpdateTime]);

  return { filter, setFilter, filteredNotifications };
}
