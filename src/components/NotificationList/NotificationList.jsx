import { useState } from "react";
import { CheckCircle, Info } from "lucide-react";

export default function NotificationList({ notifications }) {
  const [filter, setFilter] = useState("all");

  const sortedNotifications = [...notifications]
    .filter((n) => n.newRate)
    .sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return (
        new Date(b.createdAt || b.timestamp || 0) -
        new Date(a.createdAt || a.timestamp || 0)
      );
    });

  const filtered = sortedNotifications.filter((n) => {
    if (filter === "read") return n.read;
    if (filter === "unread") return !n.read;
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[500px] overflow-y-auto border border-gray-200">
      <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-100">
        <h2 className="text-gray-800 font-semibold text-lg">Notifications</h2>
        <div className="space-x-2">
          {["all", "unread", "read"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                filter === status
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white text-gray-700 hover:bg-gray-200 border-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No notifications</div>
      ) : (
        filtered.map((notification, index) => {
          const isRead = notification.read;

          return (
            <div
              key={index}
              className={`flex items-center justify-between p-4 border-b text-gray-800 ${
                isRead ? "justify-end text-right" : "justify-start text-left"
              }`}
            >
              <div className="flex items-center gap-2">
                {isRead ? (
                  <CheckCircle className="text-green-500 w-5 h-5" />
                ) : (
                  <Info className="text-blue-500 w-5 h-5" />
                )}
                <div>
                  <div className="font-medium">
                    {notification.company} ({notification.location})
                  </div>
                  <div className="text-sm text-gray-600">
                    ₹{notification.newRate}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
