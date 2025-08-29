import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Header from "@/components/common/Header/Header";
import Footer from "@/components/common/Footer/Footer";
import { UserProvider } from "@/context/UserContext";
import ScrollToTop from "@/components/common/ScrollToTop/ScrollToTop";

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
  title: "Hansaria Food Private Limited | Poultry Feed Commodities & Brokerage",
  description:
    "Hansaria Food Private Limited supplies premium poultry and animal feed raw materials across India. We specialize in reliable sourcing, competitive pricing, and on-time delivery of corn/maize, soya DOC, rice bran, and other feed ingredients. Our global commodity trading and brokerage services help feed manufacturers and poultry farms scale with quality, consistency, and trust.",
  keywords: [
    "Hansaria Food",
    "poultry feed raw materials",
    "animal feed ingredients",
    "commodity trading India",
    "brokerage services",
    "maize suppliers",
    "corn suppliers",
    "soya DOC suppliers",
    "rice bran suppliers",
    "poultry feed Kolkata",
    "feed manufacturers India",
    "agribusiness supply chain",
  ],
  authors: [{ name: "Hansaria Food Private Limited" }],
  metadataBase: new URL("https://www.hansariafood.site"),
  themeColor: "#ffffff",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxVideoPreview: -1,
      maxImagePreview: "large",
      maxSnippet: -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "dGCCMbj7pRFa0tx8SJvBBFKaPCyOClX6lBEHaFwGgK4",
  },
  openGraph: {
    title: "Hansaria Food Private Limited",
    description:
      "Hansaria Food Private Limited delivers premium raw materials for the poultry and feed industry while offering global commodity and brokerage services.",
    url: "https://www.hansariafood.site",
    siteName: "Hansaria Food",
    images: [
      {
        url: "/images/og-image1.png",
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
      "Premium poultry and animal feed raw materials supplier in India. Reliable sourcing, competitive pricing, and on-time delivery for feed manufacturers and poultry farms.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Corporation",
              name: "Hansaria Food Private Limited",
              url: "https://www.hansariafood.site",
              logo: "/images/og-image1.png",
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
                email: "info@hansariafood.com",
                contactType: "customer service",
                telephone: "+91-98304-33535",
                location:
                  "Primarc Square, Plot No.1, Salt Lake Bypass, LA Block, Sector: 3, Bidhannagar, Kolkata, West Bengal 700098",
              },
              creator: {
                "@type": "Person",
                name: "Santu De",
                email: "santude1997@gmail.com",
                telephone: "+91-7029481930",
                url: "https://www.linkedin.com/in/santu-de-812571158/",
                jobTitle: "Full Stack Software Engineer",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Hansaria Food Private Limited",
              url: "https://www.hansariafood.site",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://www.google.com/search?q=site%3Awww.hansariafood.site+{search_term_string}",
                "query-input": "required name=search_term_string",
              },
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
          <ScrollToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
