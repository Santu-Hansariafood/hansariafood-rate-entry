import { Geist, Geist_Mono, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Header from "@/components/common/Header/Header";
import Footer from "@/components/common/Footer/Footer";
import { UserProvider } from "@/context/UserContext";
import { SocketProvider } from "@/context/SocketContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "@/components/common/ScrollToTop/ScrollToTop";
import SariaAI from "@/components/common/Footer/SariaAI/SariaAI";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import BottomNav from "@/components/common/BottomNav/BottomNav";

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
  themeColor: "#0F766E",
  viewportFit: "cover",
};

export async function generateMetadata() {
  const baseKeywords =
    "hansaria food, Gopal Agarwal, India Maize, leading maize supplier in India, brokerage services, poultry feed raw material supplier India, maize supplier India, soya DOC supplier, DDGS supplier, animal feed ingredients, poultry feed raw materials, feed mill raw material supplier, agribusiness commodity trading India, maize corn supplier West Bengal, maize exporters India, bulk maize suppliers, animal feed exports India";

  const keywords = baseKeywords;

  return {
    metadataBase: new URL("https://www.hansariafood.in"),

    title: {
      default:
        "Hansaria Food Private Limited | Leading Maize Supplier in India",
      template: "%s | Hansaria Food Pvt. Ltd.",
    },

    description:
      "Hansaria Food Private Limited, led by Gopal Agarwal in Kolkata, is a leading maize supplier in India and a trusted provider of brokerage services for poultry and animal feed raw materials including soya DOC, rice DDGS and bulk feed ingredients.",

    keywords: keywords,

    authors: [{ name: "Santu De" }],

    alternates: {
      canonical: "/",
    },

    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Hansaria Food",
    },

    formatDetection: {
      telephone: true,
    },

    manifest: "/manifest.json",

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
      google: "qNgZXgdAbtQGvjpywCOVEEPeJ39bHnbAS8fkwPfBuao",
    },

    openGraph: {
      title:
        "Hansaria Food Pvt. Ltd. | Leading Maize Supplier in India & Brokerage Services",
      description:
        "Hansaria Food Pvt. Ltd., led by Gopal Agarwal, is India's leading maize supplier and brokerage firm for soya DOC, DDGS and poultry feed ingredients.",
      url: "https://www.hansariafood.in",
      siteName: "Hansaria Food Private Limited",
      locale: "en_IN",
      images: [
        {
          url: "/images/og-image1.png",
          width: 1200,
          height: 630,
          alt: "Hansaria Food Pvt. Ltd. Leading Maize Supplier India",
        },
      ],
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title:
        "Hansaria Food Pvt. Ltd. | Leading Maize Supplier & Brokerage Services",
      description:
        "Leading supplier of maize, soya DOC, DDGS and animal feed ingredients across India, led by Gopal Agarwal Kolkata.",
      images: ["/images/og-image1.png"],
    },

    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png" }],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5VPLHWSD');`}
        </Script>
        <meta name="geo.region" content="IN-WB" />
        <meta name="geo.placename" content="Kolkata" />
        <meta name="distribution" content="global" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Corporation",
              name: "Hansaria Food Private Limited",
              url: "https://www.hansariafood.in",
              logo: "https://www.hansariafood.in/images/og-image1.png",
              description:
                "Hansaria Food Private Limited, led by Gopal Agarwal, is a leading maize supplier in India and trusted brokerage firm for poultry feed raw materials like soya DOC and DDGS.",

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
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5VPLHWSD"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <AuthProvider>
          <AuthWrapper>
            <UserProvider>
              <SocketProvider>
                <Header className="fixed top-0 w-full z-50 bg-white shadow-md" />

                <main className="flex-1 pt-16 pb-20 md:pb-0">
                  {children}
                  <ToastContainer
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    draggable
                    theme="light"
                  />
                </main>

                <Footer className="mt-auto" />
                <BottomNav />
                {/* <TaskChat /> */}
                <SariaAI />
               {/* <ScrollToTop /> */}
              </SocketProvider>
            </UserProvider>
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
