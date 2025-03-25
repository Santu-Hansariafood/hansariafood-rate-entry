"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-16 bg-black"></div>;
  }

  return (
    <header className="fixed top-0 w-full bg-black text-white shadow-md z-50">
      <div className="container mx-auto flex items-center justify-between p-4 md:px-8">
        <Link href={session ? "/dashboard" : "/"}>
          <Image
            src="/logo/logo.png"
            alt="Company Logo"
            width={100}
            height={50}
            priority
          />
        </Link>
        {session && (
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}

        <nav className="hidden md:flex items-center gap-6">
          {session && (
            <ul className="flex items-center gap-6 text-sm md:text-base">
              {[
                "Manage Company",
                "Company",
                "Location",
                "Category",
                "Rate",
                "Register",
              ].map((label, index) => (
                <li key={index}>
                  <Link
                    href={`/${label.toLowerCase().replace(/ /g, "")}`}
                    className={`hover:text-green-400 transition-colors duration-300 ${
                      activeLink === `/${label.toLowerCase().replace(/ /g, "")}`
                        ? "text-green-500 underline"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveLink(`/${label.toLowerCase().replace(/ /g, "")}`)
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </nav>
        <AnimatePresence>
          {menuOpen && session && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 w-2/3 h-full bg-black text-white shadow-lg p-6 md:hidden flex flex-col items-start space-y-4"
            >
              {[
                "Manage Company",
                "Company Name",
                "Location",
                "Category",
                "Rate",
                "Register",
              ].map((label, index) => (
                <Link
                  key={index}
                  href={`/${label.toLowerCase().replace(/ /g, "")}`}
                  className="text-lg hover:text-green-400 transition-colors"
                  onClick={() => {
                    setActiveLink(`/${label.toLowerCase().replace(/ /g, "")}`);
                    setMenuOpen(false);
                  }}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full text-center transition"
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {!session && (
          <Link
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
