"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useSocket } from "@/context/SocketContext";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const Logo = dynamic(() => import("./Logo/Logo"), { ssr: false });
const DesktopNav = dynamic(() => import("./DesktopNav/DesktopNav"), {
  ssr: false,
});
const MobileNav = dynamic(() => import("./MobileNav/MobileNav"), {
  ssr: false,
});
const CookieBanner = dynamic(
  () => import("@/components/common/CookieBanner/CookieBanner"),
  { ssr: false }
);

export default function Header() {
  const socket = useSocket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const pathname = usePathname();
  const lastShownRef = useRef([]);

  useEffect(() => {
    if (pathname) setActiveLink(pathname);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted" ||
      notifications.length === 0
    )
      return;

    notifications.forEach((n) => {
      const companyName = n.company || n.companyName || "Unknown Company";
      const uniqueId = `${companyName}-${n.location}-${n.lastUpdated || n.newRateDate || n.date}-${n.updateTime || n.time}-${n.newRate || n.rate}`;

      if (!lastShownRef.current.includes(uniqueId)) {
        lastShownRef.current.push(uniqueId);

        if (lastShownRef.current.length > 50) {
          lastShownRef.current.shift();
        }

        const title = `${companyName} (${n.location})`;
        const body = `New rate for ${n.commodity}: ₹${n.newRate || n.rate}`;
        const icon = "/favicon.ico";

        try {
          new Notification(title, { body, icon, vibrate: [100, 50, 100] });
        } catch (err) {
          console.warn("Notification error:", err);
        }
      }
    });
  }, [notifications]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [rateRes, rateHistoryRes] = await Promise.all([
          axiosInstance.get("/rate?todayOnly=true&minimal=true"),
          axiosInstance.get("/rate-notifications"),
        ]);

        const rateNotifications = (rateRes.data || []).map((n) => ({
          ...n,
          companyName: n.company,
          rate: n.newRate,
          date: n.lastUpdated,
          source: "rate",
        }));

        const historyNotifications = (
          rateHistoryRes.data?.notifications || []
        ).map((n) => ({
          ...n,
          company: n.companyName,
          newRate: n.rate,
          source: "history",
        }));

        setNotifications([...rateNotifications, ...historyNotifications]);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    if (!socket) return;

    const handleNotification = (payload) => {
      if (payload.type === "rate" || payload.type === "sauda") {
        fetchNotifications();
      }
    };

    socket.on("notification", handleNotification);

    const handleRatesUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener("rates-updated", handleRatesUpdated);

    return () => {
      socket.off("notification", handleNotification);
      window.removeEventListener("rates-updated", handleRatesUpdated);
    };
  }, [socket]);

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  if (!isMounted)
    return (
      <div className="h-20 bg-gradient-to-r from-neutral-950 via-black to-neutral-950" />
    );

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out
          ${
            isScrolled
              ? "bg-gradient-to-r from-neutral-950 via-black to-neutral-950 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.55)] border-b border-emerald-500/15"
              : "bg-gradient-to-r from-neutral-950 via-black to-neutral-950 border-b border-white/5"
          }
        `}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div
          className={`container mx-auto flex items-center justify-between gap-4 px-4 md:px-8 transition-all duration-500 ease-out ${
            isScrolled ? "py-2.5" : "py-3.5"
          }`}
        >
          <div className="flex items-center gap-2">
            <Logo />
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {session ? (
              <>
                <DesktopNav
                  activeLink={activeLink}
                  setActiveLink={setActiveLink}
                  notifications={notifications}
                  currentUserMobile={session?.user?.mobile}
                  currentUserName={session?.user?.name}
                  currentUserPages={session?.user?.pages}
                />

                <div className="flex items-center gap-2">
                  <button
                    className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 ring-1 ring-white/10 transition-all active:scale-95"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Toggle Menu"
                  >
                    {menuOpen ? (
                      <X size={22} className="text-white" />
                    ) : (
                      <Menu size={22} className="text-white" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="/"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full
                             bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5
                             text-xs font-semibold tracking-wide text-white sm:text-sm
                             ring-1 ring-white/20 shadow-lg shadow-emerald-500/25
                             transition-all duration-300 hover:shadow-emerald-500/40 whitespace-nowrap"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Login</span>
                </a>
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && session && (
            <MobileNav
              isOpen={menuOpen}
              setIsOpen={setMenuOpen}
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              notifications={notifications}
              currentUserMobile={session?.user?.mobile}
              currentUserName={session?.user?.name}
              currentUserPages={session?.user?.pages}
            />
          )}
        </AnimatePresence>
      </header>

      <CookieBanner />
    </>
  );
}
