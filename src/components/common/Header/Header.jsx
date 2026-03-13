"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) setActiveLink(pathname);
  }, [pathname]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/rate");
        setNotifications(response.data || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    
    const handleRatesUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener("rates-updated", handleRatesUpdated);

    // WebSocket Integration
    let socket = null;
    let reconnectTimer = null;

    const connectWS = () => {
      if (typeof window === "undefined" || !window.WebSocket) return;
      const getWsUrl = () => {
        if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname;
        return `${protocol}//${host}:3000`;
      };
      const wsUrl = getWsUrl();
      try {
        socket = new window.WebSocket(wsUrl);

        socket.onopen = () => {
          console.log("[Header] WebSocket Connected");
          socket.send(JSON.stringify({ action: "subscribe", type: "all_rates" }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "rate_updated" || data.type === "rates-updated") {
              fetchNotifications();
            }
          } catch (err) {
            console.error("[Header] WebSocket message error:", err);
          }
        };

        socket.onclose = () => {
          console.log("[Header] WebSocket Disconnected. Reconnecting...");
          reconnectTimer = setTimeout(connectWS, 5000);
        };

        socket.onerror = (err) => {
          console.error("[Header] WebSocket error:", err);
          socket.close();
        };
      } catch (err) {
        console.error("[Header] WebSocket connection error:", err);
        reconnectTimer = setTimeout(connectWS, 5000);
      }
    };

    connectWS();

    return () => {
      if (socket) socket.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      window.removeEventListener("rates-updated", handleRatesUpdated);
    };
  }, []);

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

  if (!isMounted) return <div className="h-20 bg-black" />;

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300
          ${
            isScrolled
              ? "bg-black/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
              : "bg-black"
          }
        `}
      >
        <div className="container mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 md:px-8">
          <Logo />

          {session && (
            <button
              className="md:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Menu size={24} className="text-white" />
              )}
            </button>
          )}

          {session ? (
            <DesktopNav
              activeLink={activeLink}
              setActiveLink={setActiveLink}
              notifications={notifications}
              currentUserMobile={session?.user?.mobile}
              currentUserName={session?.user?.name}
              currentUserPages={session?.user?.pages}
            />
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="/"
                className="flex items-center justify-center gap-2 bg-emerald-500/90 text-white text-xs sm:text-sm px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl
                           hover:bg-emerald-600 transition-all duration-300
                           shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap"
              >
                Login
              </a>
            </motion.div>
          )}
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
