"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import Loading from "../../Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const NotificationBell = dynamic(() =>
  import("../NotificationBell/NotificationBell")
);
const LogoutButton = dynamic(() => import("../LogoutButton/LogoutButton"));

export default function DesktopNav({
  activeLink,
  setActiveLink,
  notifications,
}) {
  const navLinks = [
    "Manage Company",
    "Company",
    "Location",
    "Category",
    "Commodity",
    "Rate",
    "Register",
  ];

  const [commodities, setCommodities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const res = await axiosInstance.get("/commodity");
        setCommodities(res.data.commodities || []);
      } catch (error) {
        console.error("Failed to fetch commodities", error);
      }
    };

    fetchCommodities();
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <nav className="hidden md:flex items-center gap-8">
        <ul className="flex items-center gap-8 text-sm md:text-base relative">
          {navLinks.map((label, index) => {
            const path = `/${label.toLowerCase().replace(/ /g, "")}`;

            if (label === "Rate") {
              return (
                <motion.li
                  key={index}
                  className="relative"
                  whileHover={{ y: -2 }}
                >
                  <div
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                    className="relative"
                  >
                    <div
                      className={`relative group cursor-pointer ${
                        activeLink === path
                          ? "text-green-400"
                          : "text-white/90 hover:text-white"
                      }`}
                    >
                      {label}
                      <span
                        className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full ${
                          activeLink === path ? "w-full" : ""
                        }`}
                      />
                    </div>

                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 mt-2 min-w-[200px] z-10"
                      >
                        {commodities.length === 0 ? (
                          <div className="px-4 py-2 text-gray-500 text-sm">
                            No commodities found
                          </div>
                        ) : (
                          commodities.map((commodity, idx) => (
                            <Link
                              key={idx}
                              href={`/rate/${commodity.name
                                .toLowerCase()
                                .replace(/ /g, "-")}`}
                              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm"
                              onClick={() => {
                                setActiveLink(
                                  `/rate/${commodity.name
                                    .toLowerCase()
                                    .replace(/ /g, "-")}`
                                );
                                setShowDropdown(false);
                              }}
                            >
                              {commodity.name}
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.li>
              );
            }

            return (
              <motion.li
                key={index}
                className="relative"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={path}
                  className={`relative group ${
                    activeLink === path
                      ? "text-green-400"
                      : "text-white/90 hover:text-white"
                  }`}
                  onClick={() => setActiveLink(path)}
                >
                  {label}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full ${
                      activeLink === path ? "w-full" : ""
                    }`}
                  />
                </Link>
              </motion.li>
            );
          })}

          {/* Notification Bell */}
          <NotificationBell notifications={notifications} />

          {/* Logout Button */}
          <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LogoutButton />
          </motion.li>
        </ul>
      </nav>
    </Suspense>
  );
}
