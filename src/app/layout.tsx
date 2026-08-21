import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstagramFloater from "@/components/InstagramFloater";
import CartSidebar from "@/components/CartSidebar";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Analytics } from "@vercel/analytics/react";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jewelsbygeetika.com"),
  title: {
    default: "Jewels by Geetika | Luxury Curated Jewellery",
    template: "%s | Jewels by Geetika",
  },
  description:
    "Thoughtfully curated luxury jewellery for women who love timeless elegance, modern glamour & effortless sophistication. Necklaces, rings, and bridal sets.",
  keywords: [
    "jewellery",
    "AD jewellery",
    "kundan jewellery",
    "gold replica",
    "bridal jewellery",
    "Indian jewellery online",
    "Jewels by Geetika",
    "luxury jewellery",
    "curated jewellery",
  ],
  icons: {
    icon: "/logo.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Jewels by Geetika | Luxury Curated Jewellery",
    description:
      "Thoughtfully curated luxury jewellery for women who love timeless elegance, modern glamour & effortless sophistication.",
    type: "website",
    url: "https://www.jewelsbygeetika.com",
    siteName: "Jewels by Geetika",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Jewels by Geetika" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jewels by Geetika | Luxury Curated Jewellery",
    description:
      "Thoughtfully curated luxury jewellery for women who love timeless elegance, modern glamour & effortless sophistication.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${jost.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <CartSidebar />
              <InstagramFloater />
              <Analytics />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
