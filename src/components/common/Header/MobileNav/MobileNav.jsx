"use client";

import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "../../Loading/Loading";

const NotificationBell = dynamic(() =>
  import("../NotificationBell/NotificationBell")
);
const LogoutButton = dynamic(() => import("../LogoutButton/LogoutButton"));

export default function MobileNav({
  isOpen,
  setIsOpen,
  activeLink,
  setActiveLink,
  notifications,
  currentUserMobile,
}) {
  const allowedMobileNumbers = ["9830433535", "7029481931"];

  let navLinks = [
    "Manage Company",
    "Company",
    "Location",
    "Category",
    "Commodity",
    "Rate",
    "Sauda",
  ];

  if (allowedMobileNumbers.includes(currentUserMobile)) {
    navLinks.push("Register");
  }

  return (
    <Suspense fallback={<Loading />}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween" }}
            className="fixed top-0 right-0 w-64 h-full bg-gray-900 text-white z-50 shadow-lg flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 overflow-auto">
              <ul className="flex flex-col p-4 gap-4">
                {navLinks.map((label, index) => {
                  const path = `/${label.toLowerCase().replace(/ /g, "")}`;

                  return (
                    <motion.li
                      key={index}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveLink(path);
                        setIsOpen(false);
                      }}
                    >
                      <Link
                        href={path}
                        className={`block px-2 py-1 rounded ${
                          activeLink === path
                            ? "bg-green-500 text-white"
                            : "hover:bg-gray-800"
                        }`}
                      >
                        {label}
                      </Link>
                    </motion.li>
                  );
                })}

                <NotificationBell notifications={notifications} />

                <li>
                  <LogoutButton />
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </Suspense>
  );
}
