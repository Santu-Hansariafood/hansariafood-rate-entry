"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import {
  NAV_CONFIG,
  RATE_DROPDOWN,
  COMPANY_DROPDOWN,
  ADMINS,
} from "@/config/navigation";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

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
  currentUserName,
  currentUserPages = [],
}) {
  const [openCompanyDropdown, setOpenCompanyDropdown] = useState(false);
  const [openRateDropdown, setOpenRateDropdown] = useState(false);
  const [openProfileDropdown, setOpenProfileDropdown] = useState(false);
  const [status, setStatus] = useState("active");
  const [otherStatuses, setOtherStatuses] = useState([]);
  const lastHeartbeatRef = useRef(0);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenCompanyDropdown(false);
        setOpenRateDropdown(false);
        setOpenProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!currentUserMobile) return;
      try {
        const res = await axiosInstance.get(
          `/employee-status?mobile=${encodeURIComponent(currentUserMobile)}`
        );
        const list = Array.isArray(res.data) ? res.data : [];
        if (list[0]?.status) {
          setStatus(list[0].status);
        }
      } catch (error) {
        console.error("Failed to fetch employee status", error);
      }
    };

    fetchStatus();
  }, [currentUserMobile]);

  const loadOtherStatuses = useCallback(
    async (mobile) => {
      if (!mobile) return;
      try {
        const res = await axiosInstance.get(
          `/employee-status?excludeMobile=${encodeURIComponent(
            mobile
          )}&nonActiveOnly=true`
        );
        setOtherStatuses(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch other employee statuses", error);
      }
    },
    []
  );

  useEffect(() => {
    if (!currentUserMobile) return;
    loadOtherStatuses(currentUserMobile);
  }, [currentUserMobile, loadOtherStatuses]);

  useEffect(() => {
    if (!currentUserMobile) return;
    const handleActivity = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastHeartbeatRef.current < 5 * 60 * 1000) return;
      lastHeartbeatRef.current = now;
      axiosInstance
        .post("/employee-status", {
          mobile: currentUserMobile,
          status,
          name: currentUserName,
        })
        .catch((error) => {
          console.error("Failed to send activity heartbeat", error);
        });
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [currentUserMobile, currentUserName, status]);

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

  const statusOptions = [
    { key: "active", label: "Active", color: "bg-emerald-400" },
    { key: "busy", label: "Busy", color: "bg-amber-400" },
    { key: "not_available", label: "Not available", color: "bg-red-400" },
  ];

  const currentStatus = statusOptions.find((s) => s.key === status) || statusOptions[0];

  const filteredOtherStatuses = useMemo(() => {
    if (!otherStatuses || !Array.isArray(otherStatuses)) return [];
    return otherStatuses
      .filter(
        (s) =>
          s.mobile !== currentUserMobile &&
          s.status &&
          s.status !== "active"
      )
      .map((s) => ({
        ...s,
        displayName: s.name || s.mobile,
      }));
  }, [otherStatuses, currentUserMobile]);

  return (
    <nav ref={navRef} className="hidden md:flex items-center">
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

        <li className="relative ml-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setOpenProfileDropdown((v) => !v)}
            className="relative flex items-center justify-center h-9 w-9 rounded-full border border-emerald-400/70 bg-emerald-500/20 text-white shadow-sm uppercase"
            aria-label="Open profile menu"
          >
            <span className="text-xs font-semibold">
              {currentUserName
                ? currentUserName
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                : "U"}
            </span>
            <span
              className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black ${
                currentStatus.color
              }`}
            />
          </motion.button>

          <AnimatePresence>
            {openProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-64 backdrop-blur-xl bg-black/80 border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50"
              >
                <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-white/10">
                  <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-emerald-500/30 text-white text-sm font-semibold uppercase">
                    {currentUserName
                      ? currentUserName
                          .split(" ")
                          .filter(Boolean)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                      : "U"}
                    <span
                      className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black ${currentStatus.color}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      {currentUserName || "Profile"}
                    </span>
                    <span className="text-xs text-white/60">
                      Logged in user
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/60 mb-2">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={async () => {
                          setStatus(s.key);
                          if (!currentUserMobile) return;
                          try {
                            await axiosInstance.post("/employee-status", {
                              mobile: currentUserMobile,
                              status: s.key,
                              name: currentUserName,
                            });
                            await loadOtherStatuses(currentUserMobile);
                          } catch (error) {
                            console.error(
                              "Failed to update employee status",
                              error
                            );
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition
                          ${
                            status === s.key
                              ? "bg-white/15 text-white"
                              : "bg-white/5 text-white/70 hover:bg-white/10"
                          }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${s.color}`}
                        />
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOtherStatuses.length > 0 && (
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/60 mb-2">
                      Others status
                    </p>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {filteredOtherStatuses.map((s) => {
                        const color =
                          s.status === "busy"
                            ? "bg-amber-400"
                            : "bg-red-400";
                        const label =
                          s.status === "busy" ? "Busy" : "Not available";
                        return (
                          <div
                            key={s.mobile}
                            className="flex items-center justify-between text-xs text-white/80"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${color}`}
                              />
                              <span>{s.displayName}</span>
                            </div>
                            <span className="text-white/60">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10 flex items-center justify-between"
                  onClick={() => setOpenProfileDropdown(false)}
                >
                  <span>Profile</span>
                  <span className="text-xs text-white/50">View</span>
                </button>

                <div className="px-4 pb-4 pt-2">
                  <LogoutButton />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>
      </ul>
    </nav>
  );
}
