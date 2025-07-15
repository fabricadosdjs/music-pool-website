import type React from "react"
import type { Metadata } from "next"
import { Kanit } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations" // Importar localização em português
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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      localization={ptBR} // Aplicar localização em português
      appearance={{
        variables: {
          colorPrimary: "#2563eb", // Cor primária para botões e links (azul)
          colorText: "#1f2937", // Cor do texto (cinza escuro)
          colorBackground: "#ffffff", // Fundo branco
          colorInputBackground: "#f9fafb", // Fundo de input levemente cinza
          colorInputText: "#1f2937",
        },
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white text-sm normal-case",
          socialButtonsBlockButton: "bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm normal-case",
          socialButtonsBlockButtonText: "font-medium",
          formFieldLabel: "text-sm text-gray-700",
          formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
          card: "shadow-lg rounded-lg",
          headerTitle: "text-2xl font-bold text-gray-900",
          headerSubtitle: "text-sm text-gray-600",
          footerActionText: "text-sm text-gray-600",
          footerActionLink: "text-blue-600 hover:text-blue-700 text-sm",
        },
      }}
    >
      <html lang="pt" className={kanit.variable}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
