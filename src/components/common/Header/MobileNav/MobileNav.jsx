"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "../../Loading/Loading";
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

  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black md:hidden"
        onClick={() => setMenuOpen(false)}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed top-0 right-0 w-2/3 h-full bg-black text-white shadow-xl p-6 md:hidden flex flex-col items-start space-y-6 border-l border-gray-800"
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
          className="w-full mt-auto"
        >
          <LogoutButton />
        </motion.div>
      </motion.div>
    </Suspense>
  );
}
