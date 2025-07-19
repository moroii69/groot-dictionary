import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "The Groot Dictionary",
  description: "A comprehensive lexicon of Groot translations",
  icons: {
    icon: "/groot.png"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Argent+CF:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-argent custom-cursor">{children}</body>
    </html>
  )
}
