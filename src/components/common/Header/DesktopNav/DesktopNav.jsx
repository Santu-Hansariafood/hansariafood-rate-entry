"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

const NotificationBell = dynamic(() =>
  import("../NotificationBell/NotificationBell")
);
const LogoutButton = dynamic(() => import("../LogoutButton/LogoutButton"));

export default function DesktopNav({
  activeLink,
  setActiveLink,
  notifications,
  currentUserMobile,
}) {
  const allowedMobileNumbers = ["9830433535", "7029481930"];

  const [openCompanyDropdown, setOpenCompanyDropdown] = useState(false);
  const [openRateDropdown, setOpenRateDropdown] = useState(false);

  const [rateDropdownItems, setRateDropdownItems] = useState([
    { label: "Rate", path: "/rate" },
    { label: "Soya Rate", path: "/soyarate" },
    { label: "M DOC Rate", path: "/mdocrate" },
    { label: "DDGS Rate", path: "/ddgsrate" },
  ]);

  const rateTitle = (() => {
    const found = rateDropdownItems.find(
      (i) => activeLink && activeLink.startsWith(i.path)
    );
    return found ? found.label : "Rate";
  })();

  const [companyDropdownItems, setCompanyDropdownItems] = useState([
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
  ]);

  const companyTitle = (() => {
    const found = companyDropdownItems.find(
      (i) => activeLink && activeLink.startsWith(i.path)
    );
    return found ? found.label : "Company";
  })();

  const navLinks = useMemo(() => {
    const links = ["Rate", "Sauda", "Company"];

    if (allowedMobileNumbers.includes(currentUserMobile)) {
      links.push("Register", "Commodity", "Category");
    }

    return links.map((label) => ({
      label,
      path: `/${label.toLowerCase().replace(/ /g, "")}`,
    }));
  }, [currentUserMobile]);

  return (
    <nav className="hidden md:flex items-center">
      <ul className="flex items-center gap-8 text-sm md:text-[15px] font-medium relative">
        {navLinks.map(({ label, path }) => {
          if (label === "Rate") {
            const isActive =
              activeLink &&
              rateDropdownItems.some((item) => activeLink.startsWith(item.path));

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
                      className="
                        absolute left-0 mt-3 w-52
                        backdrop-blur-xl bg-black/70
                        border border-white/10
                        shadow-2xl rounded-xl overflow-hidden z-40
                      "
                    >
                      {rateDropdownItems.map(({ label, path }) => (
                        <li key={path}>
                          <Link
                            href={path}
                            onClick={() => {
                              setActiveLink(path);
                              setOpenRateDropdown(false);

                              setRateDropdownItems((items) => {
                                const idx = items.findIndex(
                                  (i) => i.path === path
                                );
                                if (idx <= 0) return items;
                                const next = [...items];
                                const [picked] = next.splice(idx, 1);
                                next.unshift(picked);
                                return next;
                              });
                            }}
                            className={`
                              block px-4 py-2.5 text-sm transition-all
                              ${
                                activeLink === path
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "text-white/80 hover:bg-white/10 hover:text-white"
                              }
                            `}
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

          if (label === "Company") {
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
                      className="
                        absolute left-0 mt-3 w-56
                        backdrop-blur-xl bg-black/70
                        border border-white/10
                        shadow-2xl rounded-xl overflow-hidden z-40
                      "
                    >
                      {companyDropdownItems.map(({ label, path }) => (
                        <li key={path}>
                          <Link
                            href={path}
                            onClick={() => {
                              setActiveLink(path);
                              setOpenCompanyDropdown(false);

                              setCompanyDropdownItems((items) => {
                                const idx = items.findIndex(
                                  (i) => i.path === path
                                );
                                if (idx <= 0) return items;
                                const next = [...items];
                                const [picked] = next.splice(idx, 1);
                                next.unshift(picked);
                                return next;
                              });
                            }}
                            className={`
                              block px-4 py-2.5 text-sm transition-all
                              ${
                                activeLink === path
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "text-white/80 hover:bg-white/10 hover:text-white"
                              }
                            `}
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
                className={`
                  relative px-1 transition-colors
                  ${
                    activeLink === path
                      ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                      : "text-white/80 hover:text-white"
                  }
                `}
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
