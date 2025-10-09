"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Navigation } from "lucide-react"
import { categories } from "@/lib/mock-data"
import { useRouter } from "next/navigation"

export function SearchSection() {
  const [query, setQuery] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [radius, setRadius] = useState("10")
  const [category, setCategory] = useState("all")
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (zipCode) params.set("zipCode", zipCode)
    if (radius) params.set("radius", radius)
    if (category !== "all") params.set("category", category)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-white dark:bg-card rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Search Query */}
        <div className="sm:col-span-2 md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Find therapists, trainers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 sm:h-12"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        {/* ZIP Code */}
        <div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ZIP Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="pl-10 h-11 sm:h-12"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        {/* Radius */}
        <div>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger className="h-11 sm:h-12 pl-10">
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 miles</SelectItem>
                <SelectItem value="10">10 miles</SelectItem>
                <SelectItem value="25">25 miles</SelectItem>
                <SelectItem value="50">50 miles</SelectItem>
                <SelectItem value="100">100 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category - Full width on mobile */}
        <div className="sm:col-span-2 md:col-span-1">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 sm:h-12">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 text-center">
        <Button onClick={handleSearch} size="lg" className="w-full sm:w-auto px-6 sm:px-8 h-12">
          <Search className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Find Health Professionals</span>
          <span className="sm:hidden">Search</span>
        </Button>
      </div>
    </div>
  )
}
