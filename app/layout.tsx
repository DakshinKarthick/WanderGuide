import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { Toaster } from "sonner"

import "./globals.css"

export const metadata = {
  title: "WanderGuide — Explore Incredible India",
  description: "Plan unforgettable journeys across India's most iconic destinations. Discover, explore, and travel smarter with WanderGuide.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
