import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://minbod.netlify.app'),
  title: {
    default: 'MinBod - Find Health & Wellness Professionals Near You',
    template: '%s | MinBod',
  },
  description: 'Connect with trusted therapists, psychiatrists, health coaches, personal trainers, and registered dietitians. Browse verified health professionals in your area.',
  keywords: [
    'health professionals',
    'wellness directory',
    'therapists near me',
    'psychiatrists',
    'health coaches',
    'personal trainers',
    'registered dietitians',
    'mental health professionals',
    'healthcare providers',
    'wellness experts',
  ],
  authors: [{ name: 'MinBod' }],
  creator: 'MinBod',
  publisher: 'MinBod',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://minbod.netlify.app',
    siteName: 'MinBod',
    title: 'MinBod - Find Health & Wellness Professionals',
    description: 'Connect with trusted health and wellness professionals in your area. Browse therapists, psychiatrists, health coaches, trainers, and dietitians.',
    images: [
      {
        url: '/placeholder.jpg',
        width: 1200,
        height: 630,
        alt: 'MinBod - Health & Wellness Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MinBod - Find Health & Wellness Professionals',
    description: 'Connect with trusted health and wellness professionals in your area.',
    images: ['/placeholder.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'googleb3d131a854526afe',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
