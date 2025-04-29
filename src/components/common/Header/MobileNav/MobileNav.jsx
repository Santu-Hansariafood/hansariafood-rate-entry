"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import Loading from "../../Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const LogoutButton = dynamic(() => import("../LogoutButton/LogoutButton"));

export default function MobileNav({
  menuOpen,
  setMenuOpen,
  activeLink,
  setActiveLink,
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
  const [rateDropdownOpen, setRateDropdownOpen] = useState(false);

  useEffect(() => {
    if (rateDropdownOpen && commodities.length === 0) {
      const fetchCommodities = async () => {
        try {
          const res = await axiosInstance.get("/commodity");
          setCommodities(res.data.commodities || []);
        } catch (error) {
          console.error("Failed to fetch commodities", error);
        }
      };

      fetchCommodities();
    }
  }, [rateDropdownOpen, commodities.length]);

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

          if (label === "Rate") {
            return (
              <div key={index} className="w-full">
                <button
                  className="flex justify-between items-center w-full px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setRateDropdownOpen((prev) => !prev)}
                >
                  <span>Rate</span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      rateDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {rateDropdownOpen && (
                  <div className="ml-4 mt-2 space-y-2">
                    {commodities.length === 0 ? (
                      <div className="px-4 py-2 text-gray-400 text-sm">
                        No commodities found
                      </div>
                    ) : (
                      commodities.map((commodity, idx) => (
                        <Link
                          key={idx}
                          href={`/rate/${commodity.name
                            .toLowerCase()
                            .replace(/ /g, "-")}`}
                          className="block px-4 py-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm transition-colors"
                          onClick={() => {
                            setActiveLink(
                              `/rate/${commodity.name
                                .toLowerCase()
                                .replace(/ /g, "-")}`
                            );
                            setRateDropdownOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          {commodity.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          }

          return (
            <motion.div
              key={index}
              whileHover={{ x: 10 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
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
            </motion.div>
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
