import type React from "react"
import type { Metadata } from "next"
import { Kanit } from "next/font/google"
import "./globals.css"

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Music Pools by Nexor Records",
  description: "Discover and download the latest music tracks",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" className={kanit.variable}>
      <body>{children}</body>
    </html>
  )
}
