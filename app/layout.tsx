import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://v0-freteguru.vercel.app"),
  title: "Frete Guru",
  description: "Calculadora de frete e identificador de áreas de cobertura",
  generator: "v0.app",
  openGraph: {
    title: "Frete Guru",
    description: "Calculadora de frete e identificador de áreas de cobertura",
    url: "https://v0-freteguru.vercel.app",
    siteName: "Frete Guru",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png?v=2",
        width: 1200,
        height: 630,
        alt: "Frete Guru Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frete Guru",
    description: "Calculadora de frete e identificador de áreas de cobertura",
    images: ["/opengraph-image.png?v=2"],
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="antialiased bg-background">
      <body className="font-sans">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
