import { SearchInterface } from "@/components/search-interface"
import { Header } from "@/components/header"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search Healthcare Providers Near You",
  description: "Search and find healthcare providers in your area. Filter by specialty, location, ratings, and more. Browse mental health specialists, physical therapists, and medical professionals.",
  keywords: [
    "search healthcare providers",
    "find doctors",
    "find therapists",
    "healthcare search",
    "medical directory search",
    "therapist search",
    "doctor search",
    "healthcare providers near me",
    "medical professionals search",
    "search doctors by specialty",
    "find medical practice",
  ],
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Search Healthcare Providers",
    description: "Find and compare healthcare providers by specialty, location, and ratings. Browse verified medical professionals.",
    type: "website",
  },
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/20">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Search Health Professionals
          </h1>
          <SearchInterface />
        </div>
      </main>
    </div>
  )
}
