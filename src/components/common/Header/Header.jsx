"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMounted) {
    return <div className="h-20 bg-black"></div>;
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-black shadow-lg" : "bg-black"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between p-4 md:px-8">
        <Link href={session ? "/dashboard" : "/"}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Image
              src="/logo/logo.png"
              alt="Company Logo"
              width={120}
              height={60}
              priority
              className="transition-all duration-300"
            />
          </motion.div>
        </Link>

        {session && (
          <button
            className="md:hidden focus:outline-none p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? (
              <X size={28} className="text-white" />
            ) : (
              <Menu size={28} className="text-white" />
            )}
          </button>
        )}

        <nav className="hidden md:flex items-center gap-8">
          {session && (
            <ul className="flex items-center gap-8 text-sm md:text-base">
              {[
                "Manage Company",
                "Company",
                "Location",
                "Category",
                "Commodity",
                "Rate",
                "Register",
              ].map((label, index) => (
                <motion.li
                  key={index}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/${label.toLowerCase().replace(/ /g, "")}`}
                    className={`relative group ${
                      activeLink === `/${label.toLowerCase().replace(/ /g, "")}`
                        ? "text-green-400"
                        : "text-white/90 hover:text-white"
                    }`}
                    onClick={() =>
                      setActiveLink(`/${label.toLowerCase().replace(/ /g, "")}`)
                    }
                  >
                    {label}
                    <span
                      className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full ${
                        activeLink ===
                        `/${label.toLowerCase().replace(/ /g, "")}`
                          ? "w-full"
                          : ""
                      }`}
                    />
                  </Link>
                </motion.li>
              ))}
              <motion.li
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() =>
                    signOut({ callbackUrl: "https://hansariafood.site" })
                  }
                  className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </motion.li>
            </ul>
          )}
        </nav>

        {!session && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="flex items-center gap-2 bg-green-500/90 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/20"
            >
              Login
            </Link>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {menuOpen && session && (
          <>
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

              {[
                "Manage Company",
                "Company",
                "Location",
                "Category",
                "Commodity",
                "Rate",
                "Register",
              ].map((label, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full"
                >
                  <Link
                    href={`/${label.toLowerCase().replace(/ /g, "")}`}
                    className={`block w-full px-4 py-2 rounded-lg ${
                      activeLink === `/${label.toLowerCase().replace(/ /g, "")}`
                        ? "bg-green-500/20 text-green-400"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    } transition-colors duration-200`}
                    onClick={() => {
                      setActiveLink(
                        `/${label.toLowerCase().replace(/ /g, "")}`
                      );
                      setMenuOpen(false);
                    }}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-auto"
              >
                <button
                  onClick={() =>
                    signOut({ callbackUrl: "https://hansariafood.site" })
                  }
                  className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
