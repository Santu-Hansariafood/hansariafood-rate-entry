"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Home, IndianRupee, Handshake, Package, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { ADMINS } from "@/config/navigation";

const BottomNav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Reserve page space for the bar so content/footer never hides behind it.
  useEffect(() => {
    if (!session) return;
    document.body.classList.add("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, [session]);

  if (!session) return null;

  const userMobile = session.user?.mobile;
  const userPages = session.user?.pages || [];
  const isAdmin = ADMINS.includes(userMobile);

  const can = (path) => isAdmin || userPages.includes(path);

  const navItems = [
    { label: "Home", path: "/dashboard", icon: Home, show: true },
    { label: "Rate", path: "/rate", icon: IndianRupee, show: can("/rate") },
    { label: "Sauda", path: "/sauda", icon: Handshake, show: can("/sauda") },
    {
      label: "Commodity",
      path: "/commodity",
      icon: Package,
      show: can("/commodity"),
    },
  ].filter((item) => item.show);

  const isMoreActive = !navItems.some((item) => item.path === pathname);

  const openMenu = () => {
    window.dispatchEvent(new CustomEvent("open-mobile-nav"));
  };

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-950/95"
    >
      <div className="bottom-nav-h pb-safe flex items-stretch justify-around gap-1 px-2 pt-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              prefetch
              aria-current={isActive ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors ${
                isActive
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400"
              }`}
            >
              <motion.span
                whileTap={{ scale: 0.88 }}
                className="relative flex flex-col items-center gap-1"
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                <span className="text-[10px] font-semibold leading-none">
                  {item.label}
                </span>
              </motion.span>

              {isActive && (
                <motion.span
                  layoutId="bottomNavActive"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute left-1/2 top-0 h-[3px] w-8 -translate-x-1/2 rounded-full bg-teal-600 dark:bg-teal-400"
                />
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={openMenu}
          aria-label="Open full menu"
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors ${
            isMoreActive
              ? "text-teal-600 dark:text-teal-400"
              : "text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400"
          }`}
        >
          <motion.span
            whileTap={{ scale: 0.88 }}
            className="relative flex flex-col items-center gap-1"
          >
            <Menu size={22} strokeWidth={isMoreActive ? 2.4 : 2} />
            <span className="text-[10px] font-semibold leading-none">More</span>
          </motion.span>

          {isMoreActive && (
            <motion.span
              layoutId="bottomNavActive"
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="absolute left-1/2 top-0 h-[3px] w-8 -translate-x-1/2 rounded-full bg-teal-600 dark:bg-teal-400"
            />
          )}
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
