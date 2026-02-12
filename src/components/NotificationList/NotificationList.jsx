"use client";
import { useEffect, Suspense, useRef } from "react";
import { CheckCircle, Info, List, Copy } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";
import useNotificationFilter from "@/hooks/Notifications/useNotificationFilter";
import useCopyNotification from "@/hooks/Notifications/useCopyNotification";

export default function NotificationList({ notifications = [] }) {
  const lastShownRef = useRef([]);
  const audioRef = useRef(null);

  const parseUpdateTime = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(" ");
    if (!parts[0] || !parts[1]) return 0;

    const [hoursStr, minutesStr] = parts[0].split(":");
    let hours = Number(hoursStr);
    let minutes = Number(minutesStr);
    const modifier = parts[1].toLowerCase();

    if (modifier === "pm" && hours !== 12) hours += 12;
    if (modifier === "am" && hours === 12) hours = 0;

    return (hours * 60 + minutes) * 60 * 1000;
  };

  const { filter, setFilter, filteredNotifications } = useNotificationFilter(
    notifications,
    parseUpdateTime
  );
  const { handleCopy, capitalizeFirst } = useCopyNotification();

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        Notification.requestPermission().catch(() => {});
      }
    } catch (err) {
      console.warn("Notification permission error:", err);
    }
  }, []);

  useEffect(() => {
    try {
      audioRef.current = new Audio("/notification/notification.wav");
      audioRef.current.volume = 0.7;
    } catch (err) {
      console.warn("Audio init error:", err);
    }
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    )
      return;

    filteredNotifications.forEach((n) => {
      // Use lastUpdated and updateTime for uniqueId to ensure uniqueness
      const uniqueId = `${n.company}-${n.location}-${n.lastUpdated || n.newRateDate}-${n.updateTime}-${n.newRate}`;

      if (!lastShownRef.current.includes(uniqueId)) {
        lastShownRef.current.push(uniqueId);

        const title = `${n.company} (${n.location})`;
        const body = `New rate for ${n.commodity}: ₹${n.newRate}`;
        const icon = "/favicon.ico";

        try {
          new Notification(title, {
            body,
            icon,
            vibrate: [100, 50, 100],
          });
        } catch (err) {
          console.warn("Mobile notification blocked:", err);
        }

        try {
          if (audioRef.current) {
            const sound = audioRef.current.cloneNode();
            sound.play().catch(() => {});
          }
        } catch (err) {
          console.warn("Sound playback error:", err);
        }
      }
    });
  }, [filteredNotifications]);

  const FilterButton = ({ title, icon: Icon, type }) => (
    <button
      onClick={() => setFilter(type)}
      aria-label={title}
      className={`p-2 rounded-full border backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-lg ${
        filter === type
          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600 scale-110"
          : "bg-white/70 text-gray-700 hover:bg-gray-200 border-gray-300 dark:bg-gray-800/70 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <Suspense fallback={<Loading />}>
      <div
        className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[500px] overflow-y-auto 
        no-scrollbar transition-all duration-500 hover:scale-[1.01]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%), " +
            "linear-gradient(225deg, rgba(255,255,255,0.05) 25%, transparent 25%), " +
            "linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%), " +
            "linear-gradient(315deg, rgba(255,255,255,0.05) 25%, transparent 25%)",
          backgroundPosition: "10px 0, 10px 0, 0 0, 0 0",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="flex justify-between items-center px-4 py-2 border-b bg-white/60 dark:bg-gray-800/60 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-gray-800 dark:text-gray-200 font-semibold text-lg flex items-center gap-2">
            🔔 <span>Notifications</span>
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

              const datePart = new Date(
                n.lastUpdated || n.newRateDate || n.updatedAt || Date.now()
              ).toLocaleDateString("en-IN");

              const time = `${datePart}, ${n.updateTime || "N/A"}`;

              return (
                <div
                  key={
                    n.id ||
                    `${n.company}-${n.location}-${n.lastUpdated || n.newRateDate || "no-date"}-${index}`
                  }
                  className={`group p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-1 ${
                    isRead ? "items-end text-right" : "items-start text-left"
                  } transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/60 dark:hover:from-gray-800/50 dark:hover:to-gray-900/50`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-300 group-hover:scale-125 ${
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
                        {n.quantity && (
                          <span className="text-orange-500 dark:text-orange-400 font-medium">
                            Qty: {n.quantity} Tons
                          </span>
                        )}
                        {n.payment && (
                          <span className="text-purple-500 dark:text-purple-400 font-medium">
                            Payment: {n.payment}
                          </span>
                        )}
                        {n.others && (
                          <span
                            className="text-indigo-500 dark:text-indigo-400 font-medium line-clamp-2"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "280px",
                            }}
                          >
                            Notes: {n.others}
                          </span>
                        )}
                        <button
                          onClick={() => handleCopy(n)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-transform duration-200 hover:scale-110"
                          aria-label="Copy notification"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
