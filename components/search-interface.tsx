"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, MapPin, SlidersHorizontal, Star, X } from "lucide-react"
import { mockBusinesses, categories, popularTags } from "@/lib/mock-data"
import { BusinessCard } from "@/components/business-card"
import type { Business, SearchFilters } from "@/types/business"

export function SearchInterface() {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses)
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>(mockBusinesses)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    category: "all",
    rating: 0,
    tags: [],
    sortBy: "relevance",
  })

  // Filter businesses based on current filters
  useEffect(() => {
    let filtered = [...businesses]

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(query) ||
          business.description.toLowerCase().includes(query) ||
          business.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Location filter
    if (filters.location) {
      const location = filters.location.toLowerCase()
      filtered = filtered.filter(
        (business) =>
          business.location.city.toLowerCase().includes(location) ||
          business.location.state.toLowerCase().includes(location) ||
          business.location.address.toLowerCase().includes(location),
      )
    }

    // Category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((business) => business.category.toLowerCase() === filters.category?.toLowerCase())
    }

    // Rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter((business) => business.rating >= filters.rating!)
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((business) => filters.tags!.some((tag) => business.tags.includes(tag)))
    }

    // Sort results
    switch (filters.sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "relevance":
      default:
        // Keep original order for relevance
        break
    }

    setFilteredBusinesses(filtered)
  }, [filters, businesses])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag]
    updateFilter("tags", newTags)
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      location: "",
      category: "all",
      rating: 0,
      tags: [],
      sortBy: "relevance",
    })
  }

  const activeFilterCount = [
    filters.query,
    filters.location,
    filters.category !== "all" ? filters.category : null,
    filters.rating && filters.rating > 0 ? filters.rating : null,
    filters.tags && filters.tags.length > 0 ? filters.tags : null,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-card rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search Query */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search businesses..."
                value={filters.query}
                onChange={(e) => updateFilter("query", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => updateFilter("location", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <div className="text-sm text-muted-foreground">{filteredBusinesses.length} businesses found</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <h4 className="font-medium mb-3">Category</h4>
                  <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="font-medium mb-3">Minimum Rating</h4>
                  <div className="space-y-3">
                    <Slider
                      value={[filters.rating || 0]}
                      onValueChange={(value) => updateFilter("rating", value[0])}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Any</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{filters.rating || 0}+</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags Filter */}
                <div>
                  <h4 className="font-medium mb-3">Tags</h4>
                  <div className="space-y-2">
                    {popularTags.slice(0, 8).map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={filters.tags?.includes(tag) || false}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <label htmlFor={tag} className="text-sm cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Tags */}
                {filters.tags && filters.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Active Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {filters.tags.map((tag) => (
                        <Badge key={tag} variant="default" className="flex items-center gap-1">
                          {tag}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => toggleTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          {filteredBusinesses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No businesses found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
