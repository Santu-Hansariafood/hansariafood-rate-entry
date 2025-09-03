"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";
import Loading from "../../Loading/Loading";

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

  const navLinks = useMemo(() => {
    const links = [
      "Manage Company",
      "Seller Company",
      "Self Company",
      "Rate",
      "Sauda",
      "Company",
    ];

    if (allowedMobileNumbers.includes(currentUserMobile)) {
      links.push("Register");
      links.push("Commodity");
      links.push("Location");
      links.push("Category");
      // links.push("Company");
    }

    return links.map((label) => ({
      label,
      path: `/${label.toLowerCase().replace(/ /g, "")}`,
    }));
  }, [currentUserMobile]);

  return (
    <Suspense fallback={<Loading />}>
      <nav className="hidden md:flex items-center gap-8">
        <ul className="flex items-center gap-8 text-sm md:text-base relative">
          {navLinks.map(({ label, path }) => (
            <motion.li
              key={path}
              className="relative"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={path}
                onClick={() => setActiveLink(path)}
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
          ))}

          <NotificationBell notifications={notifications} />

          <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LogoutButton />
          </motion.li>
        </ul>
      </nav>
    </Suspense>
  );
}
