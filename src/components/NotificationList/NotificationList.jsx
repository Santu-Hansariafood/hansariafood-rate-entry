"use client";
import { useState, useMemo, Suspense } from "react";
import { CheckCircle, Info, List, Copy } from "lucide-react";
import { toast } from "react-toastify";
import Loading from "../common/Loading/Loading";

export default function NotificationList({ notifications }) {
  const [filter, setFilter] = useState("all");

  const parseUpdateTime = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(" ");
    if (!time || !modifier) return 0;
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;
    return (hours * 60 + minutes) * 60 * 1000;
  };

  const handleCopy = (notification) => {
    const { company, location, newRate, newRateDate, updateTime } =
      notification;
    const datePart = new Date(newRateDate || Date.now()).toLocaleDateString(
      "en-IN"
    );
    const time = `${datePart}, ${updateTime || "N/A"}`;
    const copyText = `${company} (${location}) - ₹${newRate} (Updated on: ${time})`;

    navigator.clipboard.writeText(copyText);
    toast.success("Details copied to clipboard!");
  };

  const filteredNotifications = useMemo(() => {
    return [...notifications]
      .filter((n) => n.newRate)
      .sort((a, b) => {
        const aDate = new Date(a.newRateDate || a.updatedAt || 0);
        const bDate = new Date(b.newRateDate || b.updatedAt || 0);

        const aTime = a.updateTime ? parseUpdateTime(a.updateTime) : 0;
        const bTime = b.updateTime ? parseUpdateTime(b.updateTime) : 0;

        const aFull = aDate.getTime() + aTime;
        const bFull = bDate.getTime() + bTime;

        return bFull - aFull;
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
    <Suspense fallback={<Loading />}>
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[500px] overflow-y-auto border border-gray-200">
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
            const Icon = isRead ? CheckCircle : Info;
            const alignment = isRead
              ? "items-end text-right"
              : "items-start text-left";
            const datePart = new Date(
              n.newRateDate || n.updatedAt || Date.now()
            ).toLocaleDateString("en-IN");
            const time = `${datePart}, ${n.updateTime || "N/A"}`;

            return (
              <div
                key={idx}
                className={`p-4 border-b flex flex-col gap-1 ${alignment}`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-5 h-5 ${
                      isRead ? "text-green-500" : "text-blue-500"
                    }`}
                  />
                  <div>
                    <div className="font-medium">
                      {n.company} ({n.location})
                    </div>
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
    </Suspense>
  );
}
