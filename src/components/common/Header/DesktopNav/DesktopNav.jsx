"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
      links.push("Register");
      links.push("Commodity");
      links.push("Category");
    }

    return links.map((label) => ({
      label,
      path: `/${label.toLowerCase().replace(/ /g, "")}`,
    }));
  }, [currentUserMobile]);

  return (
    <nav className="hidden md:flex items-center gap-8">
      <ul className="flex items-center gap-8 text-sm md:text-base relative">
        {navLinks.map(({ label, path }) => {
          if (label === "Rate") {
            const isActive =
              activeLink &&
              ["/rate", "/soyarate"].some((p) => activeLink.startsWith(p));

            return (
              <motion.li
                key="rate-dropdown"
                className="relative"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`flex items-center gap-1 cursor-pointer group ${
                    isActive
                      ? "text-green-400"
                      : "text-white/90 hover:text-white"
                  }`}
                  onClick={() => {
                    setOpenRateDropdown((v) => !v);
                    setOpenCompanyDropdown(false);
                  }}
                >
                  {rateTitle}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      openRateDropdown ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {openRateDropdown && (
                  <ul className="absolute left-0 mt-2 w-48 bg-gray-800 shadow-lg rounded-lg overflow-hidden z-30">
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
                          className={`block px-4 py-2 text-sm transition-colors ${
                            activeLink === path
                              ? "bg-green-500 text-white"
                              : "text-white/90 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
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
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`flex items-center gap-1 cursor-pointer group ${
                    isActive
                      ? "text-green-400"
                      : "text-white/90 hover:text-white"
                  }`}
                  onClick={() => {
                    setOpenCompanyDropdown((v) => !v);
                    setOpenRateDropdown(false);
                  }}
                >
                  {companyTitle}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      openCompanyDropdown ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {openCompanyDropdown && (
                  <ul className="absolute left-0 mt-2 w-48 bg-gray-800 shadow-lg rounded-lg overflow-hidden z-20">
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
                          className={`block px-4 py-2 text-sm transition-colors ${
                            activeLink === path
                              ? "bg-green-500 text-white"
                              : "text-white/90 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.li>
            );
          }

          return (
            <motion.li
              key={path}
              className="relative"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={path}
                onClick={() => {
                  setActiveLink(path);
                  setOpenCompanyDropdown(false);
                  setOpenRateDropdown(false);
                }}
                className={`relative group ${
                  activeLink === path
                    ? "text-green-400"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-400 transition-all duration-300 ${
                    activeLink === path ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
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
