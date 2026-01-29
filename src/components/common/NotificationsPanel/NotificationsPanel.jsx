"use client";

import React from "react";
import {
  Copy,
  MapPin,
  Package,
  IndianRupee,
  Clock,
  FileText,
  Building2,
  CheckCircle
} from "lucide-react";
import { toast } from "react-toastify";

export default function NotificationsPanel({ notifications = [] }) {

  const handleCopy = async (item) => {
    const text = `*Today* ${item.date}
            *${item.companyName}* is Offering

            *Commodity:* ${item.commodity}
            *Location:* ${item.location}
            *Rate:* ₹${item.rate}/- MT
            *Payment Terms:* 

            *Thanks,*  
            *Purchase Team*  
            *Hansaria Food Pvt. Ltd.*`
            ;
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
                                            icon: "📋",
                                            style: {
                                              borderRadius: "12px",
                                              background: "#ecfdf5",
                                              color: "#065f46",
                                              fontSize: "14px",
                                            },
                                          });

  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-green-700">
        <h3 className="text-sm font-semibold text-white">
          Recent Updates ({notifications.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No updates yet 🚀
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((item, index) => (
              <li
                key={index}
                className="p-4 transition-all hover:bg-emerald-50/60 dark:hover:bg-gray-800"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-emerald-600" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {item.companyName}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleCopy(item)}
                    className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition"
                    title="Copy message"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <div className="text-xs space-y-2 text-gray-600 dark:text-gray-400">

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Package size={14} /> Commodity
                    </span>
                    <span className="font-medium">{item.commodity}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> Location
                    </span>
                    <span className="font-medium">{item.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileText size={14} /> Payment
                    </span>
                    <span className="font-medium">
                      
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock size={14} />
                      {item.time || item.date}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 text-base">
                      <IndianRupee size={16} />
                      {item.rate}
                    </span>
                  </div>

                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
