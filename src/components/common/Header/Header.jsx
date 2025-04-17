"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
const Logo = dynamic(()=> import("./Logo/Logo"));
const DesktopNav = dynamic(()=> import("./DesktopNav/DesktopNav"));
const MobileNav = dynamic(()=> import("./MobileNav/MobileNav"));

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/rate");
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMounted) return <div className="h-20 bg-black"></div>;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-black shadow-lg" : "bg-black"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between p-4 md:px-8">
        <Logo session={session} />

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

        {session ? (
          <DesktopNav
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            notifications={notifications}
          />
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a
              href="/"
              className="flex items-center gap-2 bg-green-500/90 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/20"
            >
              Login
            </a>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {menuOpen && session && (
          <MobileNav
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            notifications={notifications}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
