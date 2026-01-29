import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Formation Cybersécurité Interactive",
  description: "Formation complète en cybersécurité avec ateliers pratiques",
  icons: {
    icon: "/images/logo_sensi_app.png",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
