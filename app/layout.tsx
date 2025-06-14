import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "ProAcademics - AI-Powered Learning Platform",
    template: "%s | ProAcademics",
  },
  description:
    "Transform your learning experience with AI-powered tutoring, interactive lessons, and personalized progress tracking.",
  keywords: ["education", "AI tutoring", "online learning", "mathematics", "physics", "chemistry", "biology"],
  authors: [{ name: "ProAcademics Team" }],
  creator: "ProAcademics",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://proacademics.com",
    title: "ProAcademics - AI-Powered Learning Platform",
    description:
      "Transform your learning experience with AI-powered tutoring, interactive lessons, and personalized progress tracking.",
    siteName: "ProAcademics",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProAcademics - AI-Powered Learning Platform",
    description:
      "Transform your learning experience with AI-powered tutoring, interactive lessons, and personalized progress tracking.",
    creator: "@proacademics",
  },
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
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  generator: 'v0.dev'
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ErrorBoundary>
            {children}
            <Toaster />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  )
}
