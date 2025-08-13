"use client";
import { Suspense } from "react";
import { CheckCircle, Info, List, Copy } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";
import useNotificationFilter from "@/hooks/Notifications/useNotificationFilter";
import useCopyNotification from "@/hooks/Notifications/useCopyNotification";

export default function NotificationList({ notifications = [] }) {
  const parseUpdateTime = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(" ");
    if (!time || !modifier) return 0;
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;
    return (hours * 60 + minutes) * 60 * 1000;
  };

  const { filter, setFilter, filteredNotifications } = useNotificationFilter(
    notifications,
    parseUpdateTime
  );
  const { handleCopy, capitalizeFirst } = useCopyNotification();

  const FilterButton = ({ title, icon: Icon, type }) => (
    <button
      onClick={() => setFilter(type)}
      aria-label={title}
      className={`p-2 rounded-full border transition-all duration-200 ${
        filter === type
          ? "bg-green-500 text-white border-green-500"
          : "bg-white text-gray-700 hover:bg-gray-200 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden max-h-[500px] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-100 dark:bg-gray-800">
          <h2 className="text-gray-800 dark:text-gray-200 font-semibold text-lg">
            <span className="sr-only">Notifications</span>🔔
          </h2>
          <div className="space-x-2 flex items-center">
            <FilterButton title="All" icon={List} type="all" />
            <FilterButton title="Unread" icon={Info} type="unread" />
            <FilterButton title="Read" icon={CheckCircle} type="read" />
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          <Suspense fallback={<Loading />}>
            {filteredNotifications.map((n, index) => {
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
                  key={
                    n.id ||
                    `${n.company}-${n.location}-${
                      n.newRateDate || "no-date"
                    }-${index}`
                  }
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-1 ${alignment}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-5 h-5 ${
                        isRead
                          ? "text-green-500"
                          : "text-blue-500 dark:text-blue-400"
                      }`}
                    />
                    <div>
                      <div className="font-medium">
                        <span className="text-green-600 dark:text-green-400">
                          {n.company}
                        </span>{" "}
                        (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          {n.location}
                        </span>
                        )
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {capitalizeFirst(n.commodity || "N/A")}
                        </span>
                        <span className="font-semibold text-red-500 dark:text-red-400">
                          ₹{n.newRate}
                        </span>
                        {n.quantity !== undefined && (
                          <span className="text-orange-500 dark:text-orange-400 font-medium">
                            Qty: {n.quantity} Tons
                          </span>
                        )}
                        <button
                          onClick={() => handleCopy(n)}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                          aria-label="Copy notification"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Updated: {time}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Suspense>
        )}
      </div>
    </Suspense>
  );
}
