"use client";

import React, { useMemo } from "react";
import { X, Copy } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSaudaNotifications from "@/hooks/SaudaData/useSaudaNotifications";
import DownloadExcelButton from "./DownloadExcelButton/DownloadExcelButton";
import Loading from "@/components/common/Loading/Loading";

const NotificationsPanel = ({ onClose }) => {
  const { loading, searchQuery, setSearchQuery, filteredNotifications } =
    useSaudaNotifications();

  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort((a, b) => {
      const saudaA = Number(a.saudaNo) || 0;
      const saudaB = Number(b.saudaNo) || 0;
      return saudaB - saudaA;
    });
  }, [filteredNotifications]);

  const handleCopy = (item) => {
    const lines = [
      `*✅ Sauda Confirmed*`,
      `\n`,
      `*Sauda details are as follows:*`,
      `*Date:* ${item.date}`,
      `*Location:* ${item.location}`,
      `*Commodity:* ${item.commodity}`,
      `*Tons:* ${item.tons}`,
      `*Rate:* ₹${item.rate ?? "N/A"}`,
      item.saudaNo ? `*Sauda No:* ${item.saudaNo}` : null,
      item.buyerName ? `*Buyer:* ${item.buyerName}` : null,
      item.sellerCompany ? `*Seller Company:* ${item.sellerCompany}` : null,
      item.payment !== null &&
      item.payment !== undefined &&
      String(item.payment).trim() !== ""
        ? `*Payment Terms:* ${item.payment} *Days*`
        : null,
      item.deliveryDate ? `*Delivery Date:* ${item.deliveryDate}` : null,
      item.others ? `*Notes:* ${item.others}` : null,
      `\n`,
      `*We are pleased to inform you that the Proper Sauda Contract will be shared with you shortly.*`,
      `*Kindly check your registered email address for the contract details.*`,
      `*Thank you for your patience and cooperation.*`,
      `\n`,
      `📱 *Play Store:* _https://play.google.com/store/apps/details?id=com.hansariafood.agriv2_`,
      `🌐 *Web App:* _https://vupix.in/hfood/auth/index.php_`,
      `*Thanks*,`,
      `*Purchasing Team*`,
      `*Hansaria Food Private Limited*`,
    ].filter(Boolean);

    navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => toast.success("📋 Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 sticky top-0 z-10">
        <h3 className="text-base font-semibold text-white">
          🗂️ Sauda Notifications
        </h3>
        <div className="flex items-center gap-2">
          <DownloadExcelButton data={filteredNotifications} />
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <input
            type="text"
            placeholder="Search company, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500"
          />
        </div>
        {loading && filteredNotifications.length === 0 ? (
          <Loading />
        ) : sortedNotifications.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 flex-1">
            {sortedNotifications.map((item, index) => (
              <li
                key={`${item.company}-${item.date}-${item.location}-${index}`}
                className="relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                      🏢 {item.company}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                      {item.date}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(item)}
                    className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                    title="Copy details"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                    📍 {item.location}
                  </span>
                  <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                    🌾 {item.commodity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-600 dark:text-gray-400">
                    🪶 Tons: <span className="font-semibold">{item.tons}</span>
                  </div>
                  {item.rate && (
                    <div className="text-gray-600 dark:text-gray-400">
                      💰 Rate:{" "}
                      <span className="font-semibold">₹{item.rate}</span>
                    </div>
                  )}
                </div>

                {item.payment !== null &&
                  item.payment !== undefined &&
                  String(item.payment).trim() !== "" && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      🧾 Payment Terms:{" "}
                      <span className="font-semibold">{item.payment} Days</span>
                    </div>
                  )}

                {item.deliveryDate && (
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded inline-block">
                    📦 Delivery Date: {item.deliveryDate}
                  </div>
                )}

                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                  {item.buyerName && <div>🧑‍💼 Buyer: {item.buyerName}</div>}
                  {item.sellerName && <div>🏭 Seller: {item.sellerName}</div>}
                  {item.sellerCompany && (
                    <div>🏢 Company: {item.sellerCompany}</div>
                  )}
                  {item.saudaNo && <div># Sauda No: {item.saudaNo}</div>}
                  {item.others && <div>✍️ Notes: {item.others}</div>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-1 flex justify-center items-center p-8 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="font-medium">No notifications found</p>
              <p className="text-xs mt-2">No sauda entries for today</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPanel;
