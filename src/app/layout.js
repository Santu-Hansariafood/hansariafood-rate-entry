import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
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

const metadata = {
  title: "Hansaria Food Private Limited | Best Quality & Service",
  description:
    "Hansaria Food Private Limited provides premium quality food with fast delivery and excellent service. Order fresh and hygienic food today!",
  keywords:
    "Hansaria Food, premium food service, online food delivery, high-quality food, fast delivery, hygienic food, food industry, best food service",
  author: "Santu De",
  url: "https://www.hansariafood.com",
  siteName: "Hansaria Food",
  image: "/images/og-image.png",
  openGraph: {
    title: "Hansaria Food Private Limited",
    description:
      "Discover the best quality food with Hansaria Food Private Limited. Fast delivery and excellent service guaranteed!",
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
  twitter: {
    card: "summary_large_image",
    site: "@hansariafood",
    creator: "@santude",
    image: "/images/og-image.png",
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
        <meta name="author" content={metadata.author} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:site" content={metadata.twitter.site} />
        <meta name="twitter:creator" content={metadata.twitter.creator} />
        <meta name="twitter:title" content={metadata.openGraph.title} />
        <meta
          name="twitter:description"
          content={metadata.openGraph.description}
        />
        <meta name="twitter:image" content={metadata.twitter.image} />
        <link rel="canonical" href={metadata.url} />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: metadata.siteName,
              url: metadata.url,
              logo: metadata.image,
              description: metadata.description,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-XXXXXXXXXX",
                contactType: "customer service",
              },
              sameAs: [
                "https://www.facebook.com/hansariafood",
                "https://twitter.com/hansariafood",
                "https://www.instagram.com/hansariafood",
              ],
            }),
          }}
        />
      </Head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <Header className="fixed top-0 w-full z-50 bg-white shadow-md" />
          <main className="flex-1 pt-16">{children}</main>
          <Footer className="mt-auto" />
        </AuthProvider>
      </body>
    </html>
  );
}
