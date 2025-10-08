"use client";

import React from "react";
import { X, Copy } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSaudaNotifications from "@/hooks/SaudaData/useSaudaNotifications";
import DownloadExcelButton from "./DownloadExcelButton/DownloadExcelButton";
import Loading from "@/components/common/Loading/Loading";

const NotificationsPanel = ({ onClose }) => {
  const { loading, searchQuery, setSearchQuery, filteredNotifications } =
    useSaudaNotifications();

  const handleCopy = (item) => {
    const lines = [
      `*✅ Sauda Confirmed*`,
      `\n`,
      `*Sauda details are as follows:*`,
      `*Buyer Name:* ${item.company}`,
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
      item.others ? `*Notes:* ${item.others}` : null,
      `*Delivery Days:*`,
      `\n`,
      `*We are pleased to inform you that the Proper Sauda Contract will be shared with you shortly.*`,
      `*Kindly check your registered email address for the contract details.*`,
      `*Thank you for your patience and cooperation.*`,
      `\n`,
      `*हमें आपको यह सूचित करते हुए खुशी हो रही है कि सौदा अनुबंध (Sauda Contract) शीघ्र ही आपके साथ साझा किया जाएगा।*`,
      `*कृपया अनुबंध से संबंधित विवरण के लिए अपने पंजीकृत ईमेल पते की जाँच करें।*`,
      `*आपके धैर्य और सहयोग के लिए धन्यवाद।*`,
      `\n`,
      `*আমরা আনন্দের সঙ্গে জানাচ্ছি যে সাউদা চুক্তি (Sauda Contract) খুব শীঘ্রই আপনার সঙ্গে শেয়ার করা হবে।*`,
      `*অনুগ্রহ করে চুক্তি সম্পর্কিত বিস্তারিত জানার জন্য আপনার নিবন্ধিত ইমেল ঠিকানাটি পরীক্ষা করুন।*`,
      `*আপনার ধৈর্য ও সহযোগিতার জন্য ধন্যবাদ।*`,
      `\n`,
      `🌐 *Web App:* _https://vupix.in/hfood/auth/index.php_`,
      `📱 *Play Store:* _https://play.google.com/store/apps/details?id=com.hansaria.food_`,
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
    <div className="absolute top-14 right-0 w-80 max-h-[30rem] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-green-700 rounded-t-xl sticky top-0 z-10">
        <h3 className="text-base font-semibold text-white">
          🗂️ Sauda Notifications
        </h3>
        <div className="flex items-center gap-2">
          <DownloadExcelButton data={filteredNotifications} />
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
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
      <div className="flex-1 overflow-auto">
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <input
            type="text"
            placeholder="Search company, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-1 focus:ring-green-400"
          />
        </div>
        {loading ? (
          <div className="p-4 text-gray-500 dark:text-gray-400">
            <Loading />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...filteredNotifications]
              .sort((a, b) => {
                const saudaA = Number(a.saudaNo) || 0;
                const saudaB = Number(b.saudaNo) || 0;
                return saudaB - saudaA;
              })
              .map((item, index) => (
                <li
                  key={`${item.company}-${item.date}-${item.location}-${index}`}
                  className="relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                      🏢 {item.company}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.date}
                    </span>
                    <button
                      onClick={() => handleCopy(item)}
                      className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                      title="Copy details"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                      📍 {item.location}
                    </span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                      🌾 {item.commodity}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    🪶 Tons: {item.tons}
                  </div>
                  {item.rate && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      💰 Rate: ₹{item.rate}
                    </div>
                  )}
                  {item.payment !== null &&
                    item.payment !== undefined &&
                    String(item.payment).trim() !== "" && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        🧾 Payment Terms: {item.payment} Day's
                      </div>
                    )}
                  {item.buyerName && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      🧑‍💼 Buyer: {item.buyerName}
                    </div>
                  )}
                  {item.sellerName && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      🏭 Seller: {item.sellerName}
                    </div>
                  )}
                  {item.sellerCompany && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      🏢 Company: {item.sellerCompany}
                    </div>
                  )}
                  {item.saudaNo && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      # Sauda No: {item.saudaNo}
                    </div>
                  )}
                  {item.others && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      ✍️ Notes: {item.others}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        ) : (
          <div className="p-4 text-gray-500 dark:text-gray-400">
            No notifications found
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
