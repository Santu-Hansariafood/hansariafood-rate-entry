"use client";

import { Bell } from "lucide-react";
import { useRef, useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Loading from "../../Loading/Loading";
const NotificationList = dynamic(() =>
  import("@/components/NotificationList/NotificationList")
);

export default function NotificationBell({ notifications }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <motion.li
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative notification-wrapper"
        ref={notificationRef}
      >
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Bell className="text-white" size={20} />
          {notifications.some((n) => !n.read) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        <AnimatePresence>
          {showNotifications && (
            <motion.div
              key="notification-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 z-50"
            >
              <NotificationList notifications={notifications} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.li>
    </Suspense>
  );
}
