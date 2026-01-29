"use client";

import React from "react";
import { Copy } from "lucide-react";
import { toast } from "react-toastify";

export default function DDGSNotificationsPanel({ notifications = [] }) {
  const handleCopy = (item) => {
    const text = `*Today* ${item.date}
*${item.companyName}* is required
*${item.commodity}* for the *${item.location}* location
*Rate:* ₹${item.rate}/-*MT*
*Payment Terms:*
\n \n
*Thanks,*  
*Purchase Team*  
    `;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-green-700">
        <h3 className="text-base font-semibold text-white">
          Recent Updates ({notifications.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-300">
        {notifications.length === 0 ? (
           <div className="p-8 text-center text-gray-500">
             <p>No recent updates in this session</p>
           </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Show newest first */}
            {notifications.map((item, index) => (
              <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{item.companyName}</h4>
                  <button 
                    onClick={() => handleCopy(item)}
                    className="text-green-600 hover:text-green-800 p-1 bg-green-50 rounded"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                
                <div className="text-xs space-y-1 text-gray-600">
                   <div className="flex justify-between">
                     <span>Location:</span>
                     <span className="font-medium">{item.location}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Commodity:</span>
                     <span className="font-medium">{item.commodity}</span>
                   </div>
                   <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 border-dashed">
                     <span className="text-xs text-gray-400">{item.time || item.date}</span>
                     <span className="font-bold text-green-700 text-base">₹{item.rate}</span>
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
