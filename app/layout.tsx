import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { StoreProvider } from "@/lib/store"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" })

export const metadata: Metadata = {
  title: "GenFox - Online Shopping for Electronics, Fashion & More",
  description:
    "GenFox is your one-stop destination for online shopping. Browse electronics, fashion, home & kitchen, beauty and more at the best prices in India.",
}

export const viewport: Viewport = {
  themeColor: "#0d1510",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <StoreProvider>
          {children}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  )
}
