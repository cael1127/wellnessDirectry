import { SearchInterface } from "@/components/search-interface"
import { Header } from "@/components/header"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <SearchInterface />
        </div>
      </main>
    </div>
  )
}
