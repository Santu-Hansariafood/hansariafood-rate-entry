"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, IndianRupee, Handshake, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { ADMINS } from "@/config/navigation";

const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  if (!session) return null;

  const userMobile = session.user?.mobile;
  const userPages = session.user?.pages || [];
  const isAdmin = ADMINS.includes(userMobile);

  const navItems = [
    {
      label: "Home",
      path: "/dashboard",
      icon: Home,
    },
    {
      label: "Rate",
      path: "/rate",
      icon: IndianRupee,
      show: isAdmin || userPages.includes("/rate"),
    },
    {
      label: "Sauda",
      path: "/sauda",
      icon: Handshake,
      show: isAdmin || userPages.includes("/sauda"),
    },
  ].filter((item) => item.show !== false);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 z-50 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <button
        onClick={() => router.back()}
        className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-[10px] font-medium">Back</span>
      </button>

      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              isActive
                ? "text-teal-600 dark:text-teal-400"
                : "text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center gap-1"
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute -top-2 w-1 h-1 bg-teal-600 dark:bg-teal-400 rounded-full"
                />
              )}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
