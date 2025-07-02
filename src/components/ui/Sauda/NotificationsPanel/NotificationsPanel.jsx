"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Copy } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const LOCAL_STORAGE_KEY = "sauda_notifications_cache";

const NotificationsPanel = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/save-sauda/notifications");
      const all = res.data.notifications || [];

      const filtered = all.filter((item) => item.tons && item.tons > 0);

      const ratePromises = filtered.map((item) =>
        axiosInstance
          .get("/rate", {
            params: {
              company: item.company,
              location: item.location,
              commodity: item.commodity,
            },
          })
          .then((res) => {
            const match = res.data.find(
              (r) =>
                r.company === item.company &&
                r.location === item.location &&
                r.commodity === item.commodity
            );
            return match?.newRate ?? null;
          })
          .catch(() => null)
      );

      const rates = await Promise.all(ratePromises);

      const enriched = filtered.map((item, idx) => ({
        ...item,
        rate: item.rate ?? rates[idx] ?? null,
      }));

      setNotifications(enriched);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(enriched));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Error fetching notifications");
    } finally {
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
    return notifications.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.company.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.commodity.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, notifications]);

  const handleCopy = (item) => {
    const lines = [
      `*✅ Sauda Confirmed*`,
      `*Company:* ${item.company}`,
      `*Date:* ${item.date}`,
      `*Location:* ${item.location}`,
      `*Commodity:* ${item.commodity}`,
      `*Tons:* ${item.tons}`,
      `*Rate:* ₹${item.rate ?? "N/A"}`,
      item.saudaNo ? `*Sauda No:* ${item.saudaNo}` : null,
      item.buyerName ? `*Buyer:* ${item.buyerName}` : null,
      item.sellerName ? `*Seller:* ${item.sellerName}` : null,
      item.description ? `*Seller Name:* ${item.description}` : null,
      `*Paymet Terms: *`,
      `*_Proper sauda Contract will be shared shortly. Please check email_*`,
      ` `,
      `*Thanks*`,
      `*Hansaria Food Private Limited*`,
    ].filter(Boolean);

    navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => toast.success("📋 Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  };

  return (
    <div className="absolute top-14 right-0 w-80 max-h-[30rem] overflow-auto bg-white border shadow-lg rounded-xl z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100 rounded-t-xl">
        <h3 className="text-base font-semibold text-gray-700">
          🗂️ Sauda Notifications
        </h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-2 border-b">
        <input
          type="text"
          placeholder="Search company, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      {loading ? (
        <div className="p-4 text-gray-500">Loading notifications...</div>
      ) : filteredNotifications.length > 0 ? (
        <ul className="divide-y">
          {filteredNotifications.map((item, index) => (
            <li
              key={`${item.company}-${item.date}-${item.location}-${index}`}
              className="relative px-4 py-3 hover:bg-gray-50 transition text-sm space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">
                  {item.company}
                </span>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>

              <div className="text-xs text-gray-600">
                📍 Location: {item.location}
              </div>
              <div className="text-xs text-gray-600">
                🌾 Commodity: {item.commodity}
              </div>
              <div className="text-xs text-gray-600">🪶 Tons: {item.tons}</div>
              {item.rate && (
                <div className="text-xs text-gray-600">
                  💰 Rate: ₹{item.rate}
                </div>
              )}
              {item.buyerName && (
                <div className="text-xs text-gray-600">
                  🧑‍💼 Buyer: {item.buyerName}
                </div>
              )}
              {item.sellerName && (
                <div className="text-xs text-gray-600">
                  🏭 Seller: {item.sellerName}
                </div>
              )}
              {item.saudaNo && (
                <div className="text-xs text-gray-500">
                  # Sauda No: {item.saudaNo}
                </div>
              )}
              {item.description && (
                <div className="text-xs text-gray-500">
                  📝 {item.description}
                </div>
              )}

              <button
                onClick={() => handleCopy(item)}
                className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-gray-700"
                title="Copy details"
              >
                <Copy className="w-4 h-4" />
                Copy Details
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-gray-500">No notifications found</div>
      )}
    </div>
  );
};

export default NotificationsPanel;
