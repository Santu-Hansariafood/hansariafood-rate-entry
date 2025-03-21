import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import Header from "@/components/common/Header/Header";
import Footer from "@/components/common/Footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "Hansaria Food Private Limited | Best Quality & Service",
  description:
    "Hansaria Food Private Limited - Providing the best food quality with exceptional service. A fully responsive, SEO-optimized Next.js application.",
  keywords:
    "Hansaria Food, Next.js, SEO, responsive design, food industry, web development, fast delivery",
  author: "Santu De",
  openGraph: {
    title: "Hansaria Food Private Limited",
    description:
      "Discover high-quality food with fast delivery. A fully optimized Next.js application.",
    url: "https://www.hansariafood.com",
    siteName: "Hansaria Food",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hansaria Food Private Limited",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Santu De" />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:type" content="website" />
        <link
          rel="preload"
          href="/fonts/geist-sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/geist-mono.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
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
