"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "../../Loading/Loading";

const LogoutButton = dynamic(() => import("../LogoutButton/LogoutButton"));

export default function MobileNav({
  menuOpen,
  setMenuOpen,
  activeLink,
  setActiveLink,
}) {
  const [commodities, setCommodities] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null); // "rate", "sauda", or null

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

  const handleDropdownToggle = (label) => {
    setOpenDropdown((prev) =>
      prev === label.toLowerCase() ? null : label.toLowerCase()
    );
  };

  const handleCommodityClick = (parentPath, name) => {
    const targetPath = `/${parentPath}/${name.toLowerCase()}`;
    setActiveLink(targetPath);
    setMenuOpen(false);
  };

  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 md:hidden z-30"
        onClick={() => setMenuOpen(false)}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed top-0 right-0 w-2/3 h-full bg-black text-white shadow-xl p-6 md:hidden flex flex-col border-l border-gray-800 z-40 overflow-y-auto"
      >
        <div className="flex justify-between items-center w-full mb-8">
          <Image
            src="/logo/logo.png"
            alt="Company Logo"
            width={100}
            height={50}
          />
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {navLinks.map((label, index) => {
          const path = `/${label.toLowerCase().replace(/ /g, "")}`;
          const isDropdown = label === "Rate" || label === "Sauda";
          const isOpen = openDropdown === label.toLowerCase();

          return (
            <div key={index} className="w-full">
              <motion.div
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-between"
              >
                {isDropdown ? (
                  <button
                    onClick={() => handleDropdownToggle(label)}
                    className={`w-full text-left flex justify-between items-center px-4 py-2 rounded-lg ${
                      isOpen
                        ? "bg-green-500/20 text-green-400"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    } transition-colors duration-200`}
                  >
                    {label}
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={path}
                    className={`block w-full px-4 py-2 rounded-lg ${
                      activeLink === path
                        ? "bg-green-500/20 text-green-400"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    } transition-colors duration-200`}
                    onClick={() => {
                      setActiveLink(path);
                      setMenuOpen(false);
                    }}
                  >
                    {label}
                  </Link>
                )}
              </motion.div>

              {/* Dropdown items */}
              {isDropdown && isOpen && commodities.length > 0 && (
                <AnimatePresence>
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-4 border-l border-white/10 mt-1 overflow-hidden"
                  >
                    {commodities.map((commodity) => (
                      <li key={commodity._id}>
                        <Link
                          href={`/${label.toLowerCase()}/${commodity.name.toLowerCase()}`}
                          className="block px-4 py-1 text-sm text-white/80 hover:text-white"
                          onClick={() =>
                            handleCommodityClick(label.toLowerCase(), commodity.name)
                          }
                        >
                          {commodity.name}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              )}
            </div>
          );
        })}

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-auto pt-8"
        >
          <LogoutButton />
        </motion.div>
      </motion.div>
    </Suspense>
  );
}
