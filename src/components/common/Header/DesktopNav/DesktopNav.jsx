"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  NAV_CONFIG,
  RATE_DROPDOWN,
  COMPANY_DROPDOWN,
  ADMINS,
} from "@/config/navigation";

const NotificationBell = dynamic(() =>
  import("../NotificationBell/NotificationBell")
);
const LogoutButton = dynamic(() => import("../LogoutButton/LogoutButton"));

function filterByMobile(list, mobile, pages = [], subItems = []) {
  const isAdmin = ADMINS.includes(mobile);
  return list.filter((i) => {
    if (isAdmin) {
      return true;
    }
    
    const identifier = i.key || i.path;
    
    if (identifier && pages.includes(identifier)) return true;

    if (i.type === "dropdown" && i.key) {
        if (subItems.length > 0) {
           const hasAllowedChild = subItems.some(child => pages.includes(child.path));
           if (hasAllowedChild) return true;
        }
    }

    return false;
  });
}

export default function DesktopNav({
  activeLink,
  setActiveLink,
  notifications,
  currentUserMobile,
  currentUserPages = [],
}) {
  const [openCompanyDropdown, setOpenCompanyDropdown] = useState(false);
  const [openRateDropdown, setOpenRateDropdown] = useState(false);

  const rateDropdownItems = useMemo(
    () => filterByMobile(RATE_DROPDOWN, currentUserMobile, currentUserPages),
    [currentUserMobile, currentUserPages]
  );

  const companyDropdownItems = useMemo(
    () => filterByMobile(COMPANY_DROPDOWN, currentUserMobile, currentUserPages),
    [currentUserMobile, currentUserPages]
  );

  const navLinks = useMemo(
    () => {
        const isAdmin = ADMINS.includes(currentUserMobile);
        return NAV_CONFIG.filter(item => {
            if (isAdmin) return true;

            if (item.path && currentUserPages.includes(item.path)) return true;

            if (item.key === 'rate') {
                return rateDropdownItems.length > 0;
            }
            if (item.key === 'company') {
                return companyDropdownItems.length > 0;
            }
            
            if (item.key && currentUserPages.includes(item.key)) return true;

            return false;
        });
    },
    [currentUserMobile, currentUserPages, rateDropdownItems, companyDropdownItems]
  );

  const rateTitle =
    rateDropdownItems.find(
      (i) => activeLink && activeLink.startsWith(i.path)
    )?.label || "Rate";

  const companyTitle =
    companyDropdownItems.find(
      (i) => activeLink && activeLink.startsWith(i.path)
    )?.label || "Company";

  return (
    <nav className="hidden md:flex items-center">
      <ul className="flex items-center gap-8 text-sm md:text-[15px] font-medium relative">
        {navLinks.map((item) => {
          const { label, path, type, key } = item;

          if (type === "dropdown" && key === "rate") {
            const isActive =
              activeLink &&
              rateDropdownItems.some((i) => activeLink.startsWith(i.path));

            return (
              <motion.li
                key="rate-dropdown"
                className="relative"
                whileHover={{ y: -2 }}
              >
                <button
                  className={`flex items-center gap-1 px-1 transition-colors ${
                    isActive
                      ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                      : "text-white/80 hover:text-white"
                  }`}
                  onClick={() => {
                    setOpenRateDropdown((v) => !v);
                    setOpenCompanyDropdown(false);
                  }}
                >
                  {rateTitle}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      openRateDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openRateDropdown && (
                    <motion.ul
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-3 w-52 backdrop-blur-xl bg-black/70 border border-white/10 shadow-2xl rounded-xl overflow-hidden z-40"
                    >
                      {rateDropdownItems.map(({ label, path }) => (
                        <li key={path}>
                          <Link
                            href={path}
                            onClick={() => {
                              setActiveLink(path);
                              setOpenRateDropdown(false);
                            }}
                            className={`block px-4 py-2.5 text-sm transition-all ${
                              activeLink === path
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          }

          if (type === "dropdown" && key === "company") {
            const isActive =
              activeLink &&
              companyDropdownItems.some((i) => activeLink.startsWith(i.path));

            return (
              <motion.li
                key="company-dropdown"
                className="relative"
                whileHover={{ y: -2 }}
              >
                <button
                  className={`flex items-center gap-1 px-1 transition-colors ${
                    isActive
                      ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                      : "text-white/80 hover:text-white"
                  }`}
                  onClick={() => {
                    setOpenCompanyDropdown((v) => !v);
                    setOpenRateDropdown(false);
                  }}
                >
                  {companyTitle}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      openCompanyDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openCompanyDropdown && (
                    <motion.ul
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-3 w-56 backdrop-blur-xl bg-black/70 border border-white/10 shadow-2xl rounded-xl overflow-hidden z-40"
                    >
                      {companyDropdownItems.map(({ label, path }) => (
                        <li key={path}>
                          <Link
                            href={path}
                            onClick={() => {
                              setActiveLink(path);
                              setOpenCompanyDropdown(false);
                            }}
                            className={`block px-4 py-2.5 text-sm transition-all ${
                              activeLink === path
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          }

          return (
            <motion.li key={path} whileHover={{ y: -2 }}>
              <Link
                href={path}
                onClick={() => {
                  setActiveLink(path);
                  setOpenCompanyDropdown(false);
                  setOpenRateDropdown(false);
                }}
                className={`relative px-1 transition-colors ${
                  activeLink === path
                    ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {label}

                {activeLink === path && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 h-[2px] w-full bg-emerald-400 rounded-full"
                  />
                )}
              </Link>
            </motion.li>
          );
        })}

        <NotificationBell notifications={notifications} />

        <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <LogoutButton />
        </motion.li>
      </ul>
    </nav>
  );
}
