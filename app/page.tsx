import { SearchSection } from "@/components/search-section"
import { FeaturedBusinesses } from "@/components/featured-businesses"
import { CategoryGrid } from "@/components/category-grid"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-health-gradient py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Find Your Health Professionals
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto">
                Connect with trusted Therapists, Psychiatrists, Health Coaches, Personal Trainers, and Registered Dietitians in your area
              </p>
              <SearchSection />
            </div>
          </div>
        </section>

        {/* Featured Health Professionals */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-health-primary">
              Featured Health Professionals
            </h2>
            <FeaturedBusinesses />
          </div>
        </section>

        {/* Health Categories */}
        <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-health-primary">
              Browse by Health Category
            </h2>
            <CategoryGrid />
          </div>
        </section>
      </main>
    </div>
  )
}

