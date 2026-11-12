"use client";

import React, { useMemo } from "react";
import { X, Copy } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSaudaNotifications from "@/hooks/SaudaData/useSaudaNotifications";
import DownloadExcelButton from "./DownloadExcelButton/DownloadExcelButton";
import Loading from "@/components/common/Loading/Loading";
import { toTitleCase } from "@/utils/formatName/formatName";

const NotificationsPanel = ({ onClose }) => {
  const { loading, searchQuery, setSearchQuery, filteredNotifications } =
    useSaudaNotifications();

  const formatSaudaNo = (value) =>
    value ? value.toString().split("-").pop() : "";

  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort((a, b) => {
      const saudaA = parseInt(
        a.saudaNo ? a.saudaNo.toString().split("-").pop() : "0",
        10,
      );
      const saudaB = parseInt(
        b.saudaNo ? b.saudaNo.toString().split("-").pop() : "0",
        10,
      );
      return saudaB - saudaA;
    });
  }, [filteredNotifications]);

const handleCopy = (item) => {
  const lines = [
    `🌅🙏 *छठ पूजा की हार्दिक शुभकामनाएँ!* 🙏🌅`,
    `\n`,
    `✨ *Hansaria Food Private Limited* की ओर से हमारे सभी सम्मानित Buyers, Sellers एवं Business Partners को छठ महापर्व की हार्दिक बधाई एवं शुभकामनाएँ।`,
    ``,
    `छठी मैया और भगवान सूर्य देव की कृपा से आपके जीवन में सुख, शांति, समृद्धि, उत्तम स्वास्थ्य एवं सफलता बनी रहे।`,
    `आपका व्यापार निरंतर उन्नति करे और हमारे व्यावसायिक संबंध विश्वास एवं सहयोग के साथ और मजबूत हों।`,
    `\n`,
    `*✅ Sauda Confirmed*`,
    `\n`,
    `*Sauda का विवरण निम्नलिखित है:*`,
    item.saudaNo ? `*Sauda No:* ${formatSaudaNo(item.saudaNo)}` : null,
    `*Date:* ${item.date}`,
    `*Location:* ${item.location}`,
    `*Commodity:* ${item.commodity}`,
    `*Tons:* ${item.tons}`,
    `*Rate:* ₹${item.rate ?? "N/A"}`,
    item.buyerName ? `*Buyer:* ${toTitleCase(item.buyerName)}` : null,
    item.sellerCompany
      ? `*Seller Company:* ${toTitleCase(item.sellerCompany)}`
      : null,
    item.payment !== null &&
    item.payment !== undefined &&
    String(item.payment).trim() !== ""
      ? `*Payment Terms:* ${item.payment} *Days*`
      : null,
    item.deliveryDate ? `*Delivery Date:* ${item.deliveryDate}` : null,
    item.others ? `*Notes:* ${item.others}` : null,
    `\n`,
    `*आपको सूचित करते हुए हमें खुशी हो रही है कि Sauda का आधिकारिक Contract शीघ्र ही आपके साथ साझा किया जाएगा।*`,
    `*कृपया Contract की जानकारी के लिए अपना Registered Email Address चेक करें।*`,
    `*आपके धैर्य एवं सहयोग के लिए हार्दिक धन्यवाद।*`,
    `\n`,
    `🌞 *आइए, इस छठ पूजा के पावन अवसर पर नई उम्मीदों, मजबूत व्यावसायिक रिश्तों और सफलता की नई ऊँचाइयों का स्वागत करें।*`,
    `\n`,
    `📱 *Play Store:* _https://play.google.com/store/apps/details?id=com.hansariafood.bid_`,
    `🌐 *Web App:* _https://bid.hansariafood.in/manage-order/list-self-order_`,
    `\n`,
    `*सादर धन्यवाद एवं शुभकामनाओं सहित,*`,
    `*Purchase Team*`,
    `*Hansaria Food Private Limited*`,
    `\n`,
    `🌅🙏 *छठ पूजा की हार्दिक शुभकामनाएँ!* 🙏🌅`,
  ].filter(Boolean);

  navigator.clipboard
    .writeText(lines.join("\n"))
    .then(() => toast.success("🌅 छठ पूजा का Sauda मैसेज कॉपी हो गया!"))
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
                      🏢 {toTitleCase(item.company)}
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
                  {item.buyerName && (
                    <div>🧑‍💼 Buyer: {toTitleCase(item.buyerName)}</div>
                  )}
                  {item.sellerName && (
                    <div>🏭 Seller: {toTitleCase(item.sellerName)}</div>
                  )}
                  {item.sellerCompany && (
                    <div>🏢 Company: {toTitleCase(item.sellerCompany)}</div>
                  )}
                  {item.saudaNo && (
                    <div># Sauda No: {formatSaudaNo(item.saudaNo)}</div>
                  )}
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
