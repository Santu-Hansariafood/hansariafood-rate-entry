import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header/Header";
import Footer from "@/components/common/Footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hansaria Food Private Limited",
  description: "A fully responsive and SEO-friendly Next.js application.",
  keywords: "Next.js, SEO, responsive design, web development",
  author: "Santu De",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header className="fixed top-0 w-full z-50 bg-white shadow-md" />
        <main className="flex-1 pt-16">{children}</main>
        <Footer className="mt-auto" />
      </body>
    </html>
  );
}