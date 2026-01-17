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
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  const rateDropdownItems = [
    { label: "Rate", path: "/rate" },
    { label: "Soya Rate", path: "/soyarate" },
    { label: "M DOC Rate", path: "/mdocrate" },
    { label: "DDGS Rate", path: "/ddgsrate" },
  ];

  const companyDropdownItems = [
    { label: "Company", path: "/company" },
    { label: "Manage Company", path: "/managecompany" },
    { label: "Seller Company", path: "/sellercompany" },
    { label: "Location", path: "/location" },
    { label: "Self Company", path: "/selfcompany" },
    { label: "Previous Sauda", path: "/previoussauda" },
    { label: "Buyer Company", path: "/buyercompany" },
    { label: "Seller", path: "/seller" },
    { label: "Soya", path: "/soya" },
    { label: "M DOC", path: "/mdoc" },
    { label: "DDGS", path: "/ddgs" },
  ];

  const baseLinks = ["Sauda"];

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
    visible: { x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    exit: { x: "100%", transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
  };

  const listVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      transition: { duration: 0.2 },
    },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: "0.5rem",
      transition: {
        duration: 0.3,
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      transition: { duration: 0.2 },
    },
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
            className="fixed top-0 right-0 w-full max-w-sm sm:w-80 h-full bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white z-50 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-transparent backdrop-blur-sm">
              <h2 className="text-lg font-semibold tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Menu
              </h2>
              <button
                onClick={handleCloseDrawer}
                className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all duration-200"
                aria-label="Close menu"
              >
                <X size={20} className="text-gray-300" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-1.5"
              >
                {/* Rate Dropdown */}
                <motion.li variants={itemVariants}>
                  <button
                    onClick={() => {
                      setRateDropdownOpen((p) => !p);
                      setCompanyDropdownOpen(false);
                    }}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      rateDropdownOpen ||
                      rateDropdownItems.some(
                        (item) => activeLink && activeLink.startsWith(item.path)
                      )
                        ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.25)]"
                        : "hover:bg-white/10 text-gray-200"
                    }`}
                  >
                    <span className="font-medium text-sm">Rate</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${
                        rateDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {rateDropdownOpen && (
                      <motion.ul
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="ml-4 flex flex-col gap-1 border-l-2 border-emerald-500/30 pl-4 overflow-hidden"
                      >
                        {rateDropdownItems.map((item, idx) => {
                          const isActive =
                            activeLink && activeLink.startsWith(item.path);
                          return (
                            <motion.li
                              key={item.path}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Link
                                href={item.path}
                                onClick={() => {
                                  setActiveLink(item.path);
                                  setRateDropdownOpen(false);
                                  setIsOpen(false);
                                }}
                                className={`block px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                                  isActive
                                    ? "bg-emerald-500/30 text-emerald-300 font-medium shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {item.label}
                              </Link>
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.li>

                {/* Company Dropdown */}
                <motion.li variants={itemVariants}>
                  <button
                    onClick={() => {
                      setCompanyDropdownOpen((p) => !p);
                      setRateDropdownOpen(false);
                    }}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      companyDropdownOpen ||
                      companyDropdownItems.some(
                        (item) => activeLink && activeLink.startsWith(item.path)
                      )
                        ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.25)]"
                        : "hover:bg-white/10 text-gray-200"
                    }`}
                  >
                    <span className="font-medium text-sm">Company</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${
                        companyDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {companyDropdownOpen && (
                      <motion.ul
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="ml-4 flex flex-col gap-1 border-l-2 border-emerald-500/30 pl-4 overflow-hidden"
                      >
                        {companyDropdownItems.map((item, idx) => {
                          const isActive =
                            activeLink && activeLink.startsWith(item.path);
                          return (
                            <motion.li
                              key={item.path}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Link
                                href={item.path}
                                onClick={() => {
                                  setActiveLink(item.path);
                                  setCompanyDropdownOpen(false);
                                  setIsOpen(false);
                                }}
                                className={`block px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                                  isActive
                                    ? "bg-emerald-500/30 text-emerald-300 font-medium shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {item.label}
                              </Link>
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.li>
                {navLinks.map((label) => {
                  const path = `/${label.toLowerCase().replace(/ /g, "")}`;
                  const isActive = activeLink === path;

                  return (
                    <motion.li key={path} variants={itemVariants}>
                      <Link
                        href={path}
                        onClick={() => {
                          setActiveLink(path);
                          setIsOpen(false);
                        }}
                        className={`block px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-400 font-medium shadow-[0_0_12px_rgba(52,211,153,0.25)]"
                            : "text-gray-200 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {label}
                      </Link>
                    </motion.li>
                  );
                })}
                <motion.li
                  variants={itemVariants}
                  className="mt-4 pt-4 border-t border-gray-800/50"
                >
                  <div className="px-2">
                    <NotificationBell notifications={notifications} />
                  </div>
                </motion.li>
                <motion.li variants={itemVariants} className="px-2">
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
