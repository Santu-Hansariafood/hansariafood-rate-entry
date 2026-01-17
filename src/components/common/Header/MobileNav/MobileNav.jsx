"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";

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
    "Soya",
    "M DOC",
    "DDGS"
  ];

  const extraLinks = allowedMobileNumbers.includes(currentUserMobile)
    ? ["Register", "Commodity", "Category"]
    : [];

  const navLinks = [...baseLinks, ...extraLinks];

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

  const drawerVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
  };

  const listVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDrawer}
          />
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 w-72 h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold tracking-wide">Menu</h2>
              <button
                onClick={handleCloseDrawer}
                className="p-2 rounded-full hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-auto px-3 py-4">
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2"
              >
                <motion.li variants={itemVariants}>
                  <button
                    onClick={() => setRateDropdownOpen((p) => !p)}
                    className="w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span className="font-medium">Rate</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        rateDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {rateDropdownOpen && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-3 mt-2 flex flex-col gap-1 border-l border-gray-700 pl-3"
                      >
                        {[
                          { label: "Rate", path: "/rate" },
                          { label: "Soya Rate", path: "/soyarate" },
                          { label: "M DOC Rate", path: "/mdocrate" },
                          { label: "DDGS Rate", path: "/ddgsrate" },
                        ].map((item) => (
                          <li key={item.path}>
                            <Link
                              href={item.path}
                              onClick={() => {
                                setActiveLink(item.path);
                                setIsOpen(false);
                              }}
                              className={`block px-3 py-2 rounded-lg text-sm transition ${
                                activeLink === item.path
                                  ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                                  : "hover:bg-white/10"
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.li>
                {navLinks.map((label) => {
                  const path = `/${label.toLowerCase().replace(/ /g, "")}`;

                  return (
                    <motion.li key={path} variants={itemVariants}>
                      <Link
                        href={path}
                        onClick={() => {
                          setActiveLink(path);
                          setIsOpen(false);
                        }}
                        className={`block px-3 py-2 rounded-lg transition ${
                          activeLink === path
                            ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.35)]"
                            : "hover:bg-white/10"
                        }`}
                      >
                        {label}
                      </Link>
                    </motion.li>
                  );
                })}
                <motion.li variants={itemVariants} className="mt-3">
                  <NotificationBell notifications={notifications} />
                </motion.li>
                <motion.li variants={itemVariants} className="mt-2">
                  <LogoutButton />
                </motion.li>
              </motion.ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
