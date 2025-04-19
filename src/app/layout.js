import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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

export const metadata = {
  title: "Hansaria Food Private Limited | Commodity & Brokerage Services",
  description:
    "Hansaria Food Private Limited is a leading supplier of high-quality raw materials for the poultry and animal feed industry in India. With a reputation for excellence, we specialize in sourcing and delivering premium feed ingredients that support healthy livestock growth. Our global commodity trading and brokerage services ensure consistent supply, competitive pricing, and unmatched reliability. Trusted by poultry farms, feed manufacturers, and agribusinesses, Hansaria Food is your dependable partner for feed solutions with assured quality and on-time delivery.",
  keywords:
    "Hansaria Food, raw material supply, poultry feed industry, commodity trading, brokerage services, supply chain, Kolkata, India, international trade",
  authors: [{ name: "Hansaria Food Private Limited" }],
  metadataBase: new URL("https://www.hansariafood.site"),
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
    title: "Hansaria Food Private Limited",
    description:
      "Hansaria Food Private Limited is a leading supplier of high-quality raw materials for the poultry and animal feed industry in India. With a reputation for excellence, we specialize in sourcing and delivering premium feed ingredients that support healthy livestock growth. Our global commodity trading and brokerage services ensure consistent supply, competitive pricing, and unmatched reliability. Trusted by poultry farms, feed manufacturers, and agribusinesses, Hansaria Food is your dependable partner for feed solutions with assured quality and on-time delivery.",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Corporation",
              name: "Hansaria Food",
              url: "https://www.hansariafood.site",
              logo: "/images/og-image.png",
              description:
                "Hansaria Food Private Limited is a leading supplier of high-quality raw materials for the poultry and animal feed industry in India. With a reputation for excellence, we specialize in sourcing and delivering premium feed ingredients that support healthy livestock growth. Our global commodity trading and brokerage services ensure consistent supply, competitive pricing, and unmatched reliability. Trusted by poultry farms, feed manufacturers, and agribusinesses, Hansaria Food is your dependable partner for feed solutions with assured quality and on-time delivery.",
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
                "https://www.facebook.com/hansariafood",
                "https://www.instagram.com/hansaria_food",
                "https://www.youtube.com/@hansariafood",
                "https://www.linkedin.com/company/hansaria-food",
                "https://www.x.com/hansariafood",
              ],
            }),
          }}
        />
      </head>
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
