import { useState } from "react";
import { CheckCircle, Info, List } from "lucide-react";

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
        <h2 className="text-gray-800 font-semibold text-lg"> 
          <span className="sr-only">Notifications</span>🔔
        </h2>
        <div className="space-x-2 flex items-center">
          <button
            onClick={() => setFilter("all")}
            title="All"
            className={`p-2 rounded-full border transition-all duration-200 ${
              filter === "all"
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-gray-700 hover:bg-gray-200 border-gray-300"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFilter("unread")}
            title="Unread"
            className={`p-2 rounded-full border transition-all duration-200 ${
              filter === "unread"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 hover:bg-gray-200 border-gray-300"
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFilter("read")}
            title="Read"
            className={`p-2 rounded-full border transition-all duration-200 ${
              filter === "read"
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-gray-700 hover:bg-gray-200 border-gray-300"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No notifications</div>
      ) : (
        filtered.map((notification, index) => {
          const isRead = notification.read;
          const alignment = isRead ? "items-end text-right" : "items-start text-left";
          const icon = isRead ? (
            <CheckCircle className="text-green-500 w-5 h-5" />
          ) : (
            <Info className="text-blue-500 w-5 h-5" />
          );

          return (
            <div
              key={index}
              className={`p-4 border-b flex flex-col gap-1 ${alignment}`}
            >
              <div className="flex items-center gap-2">
                {icon}
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
