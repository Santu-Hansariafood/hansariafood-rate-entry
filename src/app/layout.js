import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Header from "@/components/common/Header/Header";
import Footer from "@/components/common/Footer/Footer";
import { UserProvider } from "@/context/UserContext";
import ScrollToTop from "@/components/common/ScrollToTop/ScrollToTop";
import TaskChat from "@/components/common/Footer/TaskChat/TaskChat";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";

const geistSans = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata = {
  metadataBase: new URL("https://www.hansariafood.site"),

  title: {
    default: "Hansaria Food Private Limited",
    template: "%s | Hansaria Food Pvt. Ltd.",
  },

  description:
    "Hansaria Food Private Limited is a trusted poultry and animal feed raw material supplier in India, providing high-quality maize, soya DOC, rice DDGS and bulk feed ingredients with reliable logistics and competitive pricing.",

  keywords:
    "hansaria food, poultry feed raw material supplier India, maize supplier India, soya DOC supplier, DDGS supplier, animal feed ingredients, poultry feed raw materials, feed mill raw material supplier, agribusiness commodity trading India",

  authors: [{ name: "Santu De" }],

  alternates: {
    canonical: "https://www.hansariafood.site",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  verification: {
    google: "dGCCMbj7pRFa0tx8SJvBBFKaPCyOClX6lBEHaFwGgK4",
  },

  openGraph: {
    title:
      "Hansaria Food Pvt. Ltd. | Trusted Poultry Feed Raw Material Supplier in India",
    description:
      "Supplier of maize, soya DOC, DDGS and bulk feed ingredients with reliable logistics and competitive pricing. Trusted by poultry farms and feed manufacturers across India.",
    url: "https://www.hansariafood.site",
    siteName: "Hansaria Food Private Limited",
    images: [
      {
        url: "/images/og-image1.png",
        width: 1200,
        height: 630,
        alt: "Hansaria Food Pvt. Ltd. Poultry Feed Supplier",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Hansaria Food Pvt. Ltd. | Poultry Feed Raw Materials & Commodity Trading",
    description:
      "Leading supplier of maize, soya DOC, DDGS and animal feed ingredients across India.",
    images: ["/images/og-image1.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="geo.region" content="IN-WB" />
        <meta name="geo.placename" content="Kolkata" />
        <meta name="distribution" content="global" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Corporation",
              name: "Hansaria Food Private Limited",
              url: "https://www.hansariafood.site",
              logo: "https://www.hansariafood.site/images/og-image1.png",
              description:
                "Supplier of poultry and animal feed raw materials in India including maize, soya DOC and DDGS with reliable logistics.",

              founder: [
                { "@type": "Person", name: "Gopal Agarwal" },
                { "@type": "Person", name: "Sunita Agarwalla" },
              ],

              foundingDate: "2018-06-15",

              address: {
                "@type": "PostalAddress",
                streetAddress:
                  "Primarc Square, Plot No.1, Salt Lake Bypass, LA Block, Sector 3, Bidhannagar",
                addressLocality: "Kolkata",
                addressRegion: "West Bengal",
                postalCode: "700098",
                addressCountry: "IN",
              },

              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-98304-33535",
                contactType: "customer service",
                email: "info@hansariafood.com",
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
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <AuthWrapper>
            <UserProvider>
              <Header className="fixed top-0 w-full z-50 bg-white shadow-md" />

              <main className="flex-1 pt-16">
                {children}
              </main>

              <Footer className="mt-auto" />
              <TaskChat />
              <ScrollToTop />
            </UserProvider>
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
