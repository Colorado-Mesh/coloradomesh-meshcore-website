import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import JsonLd, {
  organizationSchema,
  websiteSchema,
  communityOrganizationSchema,
} from "@/components/JsonLd";
import { BASE_URL } from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Denver MeshCore Community Platform",
    template: "%s | Denver MeshCore",
  },
  description:
    "A community platform for Denver MeshCore mesh networking enthusiasts. Building Colorado's decentralized mesh network community using LoRa technology for off-grid communication.",
  keywords: [
    "mesh network",
    "Denver",
    "Colorado",
    "MeshCore",
    "decentralized",
    "LoRa",
    "off-grid",
    "emergency communication",
    "Front Range",
    "radio network",
  ],
  authors: [{ name: "Denver MeshCore Community" }],
  creator: "Denver MeshCore Community",
  publisher: "Denver MeshCore Community",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Denver MeshCore",
    title: "Denver MeshCore Community Platform",
    description:
      "Building Colorado's decentralized mesh network community. Connect off-grid using LoRa technology across the Front Range.",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "Denver MeshCore Community Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@denver_meshcore",
    creator: "@denver_meshcore",
    title: "Denver MeshCore Community Platform",
    description:
      "Building Colorado's decentralized mesh network community. Connect off-grid using LoRa technology across the Front Range.",
    images: ["/logo-512.png"],
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <JsonLd data={communityOrganizationSchema} />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navigation />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
