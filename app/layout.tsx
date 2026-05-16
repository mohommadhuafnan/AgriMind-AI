import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppProviders } from "@/components/providers/app-providers"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "AgriMind AI - Your AI Farming Partner From Seed To Harvest",
  description:
    "AgriMind AI is an intelligent farming assistant for Sri Lankan farmers. Get AI-powered crop disease detection, multilingual voice support, smart farming guidance, and market intelligence.",
  keywords: [
    "agriculture",
    "farming",
    "AI",
    "crop disease detection",
    "Sri Lanka",
    "smart farming",
    "multilingual",
  ],
  authors: [{ name: "AgriMind AI" }],
  openGraph: {
    title: "AgriMind AI - Your AI Farming Partner",
    description:
      "An intelligent farming assistant available 24/7 for Sri Lankan farmers.",
    type: "website",
    images: [{ url: "/agrimind-logo.png", alt: "AgriMind AI" }],
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#22c55e" },
    { media: "(prefers-color-scheme: dark)", color: "#16a34a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AppProviders>
          {children}
          {process.env.NODE_ENV === "production" && <Analytics />}
        </AppProviders>
      </body>
    </html>
  )
}
