"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "../../Loading/Loading";

const NotificationBell = dynamic(() =>
  import("../NotificationBell/NotificationBell")
);
const LogoutButton = dynamic(() => import("../LogoutButton/LogoutButton"));

export default function DesktopNav({
  activeLink,
  setActiveLink,
  notifications,
}) {
  const router = useRouter();
  const [commodities, setCommodities] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  const navLinks = [
    "Manage Company",
    "Company",
    "Location",
    "Category",
    "Commodity",
    "Rate",
    "Sauda",
    "Register",
  ];

  useEffect(() => {
    axiosInstance.get("/commodity?page=1&limit=100").then((res) => {
      setCommodities(res.data.commodities || []);
    });
  }, []);

  const handleNavClick = (label) => {
    const lower = label.toLowerCase();
    if (label === "Rate" || label === "Sauda") {
      setOpenDropdown((prev) => (prev === lower ? null : lower));
    } else {
      setOpenDropdown(null);
      setActiveLink(`/${lower}`);
      router.push(`/${lower}`);
    }
  };

  const handleCommodityClick = (parentPath, name) => {
    setOpenDropdown(null);
    router.push(`/${parentPath}/${name.toLowerCase()}`);
  };

  const renderDropdown = (parentPath) => (
    <ul className="absolute left-0 top-full mt-2 bg-white text-black rounded shadow-md z-50 min-w-[180px]">
      {commodities.map((commodity) => (
        <li key={commodity._id}>
          <button
            onClick={() => handleCommodityClick(parentPath, commodity.name)}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            {commodity.name}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <Suspense fallback={<Loading />}>
      <nav className="hidden md:flex items-center gap-8">
        <ul className="flex items-center gap-8 text-sm md:text-base relative">
          {navLinks.map((label, index) => {
            const path = `/${label.toLowerCase().replace(/ /g, "")}`;
            const isDropdown = label === "Rate" || label === "Sauda";
            const isOpen = openDropdown === label.toLowerCase();

            return (
              <motion.li
                key={index}
                className="relative"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => handleNavClick(label)}
                  className={`relative group ${
                    activeLink === path
                      ? "text-green-400"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-green-400 transition-all duration-300 ${
                      activeLink === path || isOpen
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>

                {/* Dropdown if applicable */}
                {isDropdown && isOpen && commodities.length > 0 && (
                  <div className="absolute mt-2">
                    {renderDropdown(label.toLowerCase())}
                  </div>
                )}
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
