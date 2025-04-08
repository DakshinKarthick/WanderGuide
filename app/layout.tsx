import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "WanderGuide - Explore Incredible India",
  description: "Discover the beauty and diversity of India with our curated travel experiences.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'