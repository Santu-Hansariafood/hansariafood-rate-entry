"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Suspense } from "react";
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

  return (
    <Suspense fallback={<Loading />}>
      <nav className="hidden md:flex items-center gap-8">
        <ul className="flex items-center gap-8 text-sm md:text-base relative">
          {navLinks.map((label, index) => {
            const path = `/${label.toLowerCase().replace(/ /g, "")}`;

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
