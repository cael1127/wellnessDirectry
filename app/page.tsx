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
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Discover Local Businesses</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Find trusted businesses in your area with verified reviews and detailed profiles
              </p>
              <SearchSection />
            </div>
          </div>
        </section>

        {/* Featured Businesses */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Businesses</h2>
            <FeaturedBusinesses />
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
            <CategoryGrid />
          </div>
        </section>
      </main>
    </div>
  )
}
