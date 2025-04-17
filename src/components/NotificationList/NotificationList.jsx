"use client";
import { useState, useMemo } from "react";
import { CheckCircle, Info, List, Copy } from "lucide-react";
import { toast } from "react-toastify";

export default function NotificationList({ notifications }) {
  const [filter, setFilter] = useState("all");

  const formatTime = (time) => {
    const date = new Date(time);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCopy = (notification) => {
    const { company, location, newRate, updatedAt, newRateDate } = notification;
    const time = formatTime(updatedAt || newRateDate || Date.now());
    const copyText = `${company} (${location}) - ₹${newRate} (Updated on: ${time})`;

    navigator.clipboard.writeText(copyText);
    toast.success("Details copied to clipboard!");
  };

  const filteredNotifications = useMemo(() => {
    return [...notifications]
      .filter((n) => n.newRate)
      .sort((a, b) => {
        const aDate = new Date(a.updatedAt || a.newRateDate || a.createdAt || a.timestamp || 0);
        const bDate = new Date(b.updatedAt || b.newRateDate || b.createdAt || b.timestamp || 0);
        return bDate - aDate;
      })
      .filter((n) => {
        if (filter === "read") return n.read;
        if (filter === "unread") return !n.read;
        return true;
      });
  }, [notifications, filter]);

  const FilterButton = ({ title, icon: Icon, type }) => (
    <button
      onClick={() => setFilter(type)}
      aria-label={title}
      className={`p-2 rounded-full border transition-all duration-200 ${
        filter === type
          ? "bg-green-500 text-white border-green-500"
          : "bg-white text-gray-700 hover:bg-gray-200 border-gray-300"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[500px] overflow-y-auto border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-100">
        <h2 className="text-gray-800 font-semibold text-lg">
          <span className="sr-only">Notifications</span>🔔
        </h2>
        <div className="space-x-2 flex items-center">
          <FilterButton title="All" icon={List} type="all" />
          <FilterButton title="Unread" icon={Info} type="unread" />
          <FilterButton title="Read" icon={CheckCircle} type="read" />
        </div>
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No notifications</div>
      ) : (
        filteredNotifications.map((n, idx) => {
          const isRead = n.read;
          const time = formatTime(n.updatedAt || n.newRateDate || Date.now());
          const Icon = isRead ? CheckCircle : Info;
          const alignment = isRead ? "items-end text-right" : "items-start text-left";

          return (
            <div key={idx} className={`p-4 border-b flex flex-col gap-1 ${alignment}`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${isRead ? "text-green-500" : "text-blue-500"}`} />
                <div>
                  <div className="font-medium">{n.company} ({n.location})</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="font-medium">Maize -</span> ₹{n.newRate}
                    <button
                      onClick={() => handleCopy(n)}
                      className="hover:text-blue-600"
                      aria-label="Copy notification"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">Updated: {time}</div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
