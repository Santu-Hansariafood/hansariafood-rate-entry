import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Header from "@/components/common/Header/Header";
import Footer from "@/components/common/Footer/Footer";
import { UserProvider } from "@/context/UserContext";

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
  title: "Hansaria Food Private Limited | Commodity & Brokerage Services",
  description:
    "Hansaria Food Private Limited supplies high-quality raw materials for the poultry and feed industry across India. We also provide global commodity and brokerage services with assured quality and reliability.",
  keywords:
    "Hansaria Food, raw material supply, poultry feed industry, commodity trading, brokerage services, supply chain, Kolkata, India, international trade",
  author: "Hansaria Food Private Limited",
  url: "https://www.hansariafood.site",
  siteName: "Hansaria Food",
  image: "/images/og-image.png",
  openGraph: {
    title: "Hansaria Food Private Limited",
    description:
      "Hansaria Food Private Limited delivers premium raw materials for the poultry and feed industry while offering global commodity and brokerage services.",
    url: "https://www.hansariafood.site",
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
    creator: "@hansaria_food_private_limited",
    image: "/images/og-image.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
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
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Private Limited",
              name: metadata.siteName,
              url: metadata.url,
              logo: metadata.image,
              description: metadata.description,
              founder: {
                "@type": "Person",
                name: "Gopal Agarwal & Sunita Agarwalla",
                jobTitle: "Founder & CEO",
              },
              foundingDate: "2018-06-15",
              location: {
                "@type": "PostalAddress",
                streetAddress:
                  "Primarc Square, Plot No.1, Salt Lake Bypass, LA Block, Sector: 3, Bidhannagar",
                addressLocality: "Kolkata",
                addressRegion: "West Bengal",
                postalCode: "700098",
                addressCountry: "IN",
              },
              contactPoint: {
                "@type": "ContactPoint",
                email: "info@hansariafood.site",
                contactType: "customer service",
                telephone: "+91-XXXXXXXXXX",
                location:
                  "Primarc Square, Plot No.1, Salt Lake Bypass, LA Block, Sector: 3, Bidhannagar, Kolkata, West Bengal 700098",
              },
              sameAs: [
                "https://www.facebook.site/profile.php?id=100087874624812",
                "https://www.instagram.site/hansaria_food?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
                "https://www.youtube.site/@hansariafood",
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
          <main className="flex-1 pt-16">
            <UserProvider>{children}</UserProvider>
          </main>
          <Footer className="mt-auto" />
        </AuthProvider>
      </body>
    </html>
  );
}
