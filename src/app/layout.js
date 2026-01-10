import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Header from "@/components/common/Header/Header";
import Footer from "@/components/common/Footer/Footer";
import { UserProvider } from "@/context/UserContext";
import ScrollToTop from "@/components/common/ScrollToTop/ScrollToTop";

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
  title: "Hansaria Food Private Limited",

  description:
    "Hansaria Food Private Limited is a trusted poultry and animal feed raw material supplier in India, providing high-quality maize, soya DOC, rice DDGS and bulk feed ingredients. We offer reliable commodity trading and brokerage services with competitive pricing and strong logistics support for poultry farms, feed manufacturers and agribusiness companies across India.",
  keywords:
    "agri rise, hansaria food, gopal, gopal agarwal, best poultry feed raw material supplier in India,trusted animal feed ingredient supplier,maize supplier, maize supplier for poultry feed India, soya DOC bulk supplier for feed mills,DDGS supplier for poultry industry India, bulk feed ingredients wholesaler, poultry feed manufacturer raw material supplier, animal feed trading company in India, commodity trading and brokerage services India, agribusiness raw material supplier, livestock feed ingredient wholesaler, feed mill raw material distributor India, poultry nutrition ingredient supplier, high quality feed ingredients supplier, pan India poultry feed supplier, Kolkata based feed raw material supplier",
  authors: [{ name: "Santu De" }],

  metadataBase: new URL("https://www.hansariafood.site"),

  alternates: {
    canonical: "https://www.hansariafood.site",
  },

  openGraph: {
    title:
      "Hansaria Food Pvt. Ltd. | Trusted Poultry Feed Raw Material Supplier in India",
    description:
      "Supplier of maize, soya DOC, DDGS and bulk feed ingredients with global commodity trading and brokerage services. Trusted by poultry farms and feed manufacturers across India.",
    url: "https://www.hansariafood.site",
    siteName: "Hansaria Food Private Limited",
    images: [
      {
        url: "/images/og-image1.png",
        width: 1200,
        height: 630,
        alt: "Hansaria Food Pvt. Ltd. - Poultry Feed Raw Material Supplier",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Hansaria Food Pvt. Ltd. | Poultry Feed Raw Materials & Commodity Trading",
    description:
      "Leading supplier of maize, soya DOC, DDGS and animal feed ingredients with reliable logistics and competitive pricing in India.",
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
        <meta
          name="google-site-verification"
          content="dGCCMbj7pRFa0tx8SJvBBFKaPCyOClX6lBEHaFwGgK4"
        />
        <meta name="robots" content="index, follow" />
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
                "Supplier of poultry and animal feed raw materials in India including maize, soya DOC, DDGS and bulk feed ingredients with global commodity trading and brokerage services.",

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
          <Header className="fixed top-0 w-full z-50 bg-white shadow-md" />

          <main className="flex-1 pt-16">
            <UserProvider>{children}</UserProvider>
          </main>

          <Footer className="mt-auto" />
          <ScrollToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
