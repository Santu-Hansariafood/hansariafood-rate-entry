"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);

  return (
    <header className="fixed top-0 w-full bg-black text-white shadow-md z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/next.svg"
              alt="Company Logo"
              width={50}
              height={50}
              className="rounded-full"
              priority
            />
          </Link>
        </div>
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav
          className={`absolute md:static top-16 left-0 w-full md:w-auto bg-black md:bg-transparent md:flex items-center transition-all ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <ul className="flex flex-col md:flex-row items-center md:gap-6 p-4 md:p-0">
            {[
              { href: "/manage", label: "Manage Company" },
              { href: "/company", label: "Company Name" },
              { href: "/location", label: "Location" },
              { href: "/category", label: "Category" },
              { href: "/rate", label: "Rate" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => {
                    setActiveLink(link.href);
                    setMenuOpen(false);
                  }}
                  className={`block py-2 px-4 text-sm md:text-base ${
                    activeLink === link.href ? "text-green-500 underline" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
