"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const NotificationBell = dynamic(() =>
  import("../NotificationBell/NotificationBell")
);

const LogoutButton = dynamic(() => import("../LogoutButton/LogoutButton"));

const allowedMobileNumbers = ["9830433535", "7029481930"];

export default function MobileNav({
  isOpen,
  setIsOpen,
  activeLink,
  setActiveLink,
  notifications,
  currentUserMobile,
}) {
  const [rateDropdownOpen, setRateDropdownOpen] = useState(false);

  const baseLinks = [
    "Sauda",
    "Company",
    "Manage Company",
    "Seller Company",
    "Location",
    "Self Company",
    "Previous Sauda",
  ];

  const extraLinks = allowedMobileNumbers.includes(currentUserMobile)
    ? ["Register", "Commodity", "Category"]
    : [];

  const navLinks = [...baseLinks, ...extraLinks];

  // Drawer Close Logic
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ mobileNavOpen: true }, "");

    const handlePopState = () => setIsOpen(false);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, setIsOpen]);

  const handleCloseDrawer = () => {
    setIsOpen(false);
    if (window.history.state?.mobileNavOpen) {
      window.history.back();
    }
  };

  return (
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
              onClick={handleCloseDrawer}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 overflow-auto">
            <ul className="flex flex-col p-4 gap-4">

              {/* 🔽 RATE DROPDOWN */}
              <li>
                <div
                  className="flex justify-between items-center cursor-pointer px-2 py-1 rounded hover:bg-gray-800"
                  onClick={() => setRateDropdownOpen(!rateDropdownOpen)}
                >
                  <span className="text-white font-medium">Rate</span>
                  <span>{rateDropdownOpen ? "▲" : "▼"}</span>
                </div>

                <AnimatePresence>
                  {rateDropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-4 mt-2 flex flex-col gap-2"
                    >
                      <li>
                        <Link
                          href="/rate"
                          className="block px-2 py-1 rounded hover:bg-gray-800"
                          onClick={() => {
                            setActiveLink("/rate");
                            setIsOpen(false);
                          }}
                        >
                          Daily Rate
                        </Link>
                      </li>

                      <li>
                        <Link
                          href="/soyarate"
                          className="block px-2 py-1 rounded hover:bg-gray-800"
                          onClick={() => {
                            setActiveLink("/soyarate");
                            setIsOpen(false);
                          }}
                        >
                          Soya Rate
                        </Link>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>

              {/* 🔗 OTHER LINKS */}
              {navLinks.map((label) => {
                const path = `/${label.toLowerCase().replace(/ /g, "")}`;
                return (
                  <motion.li
                    key={path}
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

              {/* 🔔 Notifications */}
              <NotificationBell notifications={notifications} />

              {/* 🔒 Logout */}
              <li>
                <LogoutButton />
              </li>
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
