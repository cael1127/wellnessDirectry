"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MapPin, SlidersHorizontal, Star, X, Filter, SortAsc, SortDesc } from "lucide-react"
import { BusinessCard } from "@/components/business-card"
import { supabase } from "@/lib/supabase"
import type { Business, SearchFilters } from "@/types/business"

const ITEMS_PER_PAGE = 12

export function EnhancedSearchInterface() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(0)

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    category: "all",
    rating: 0,
    tags: [],
    sortBy: "relevance",
    radius: 25,
  })

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (searchParams: any) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          performSearch(searchParams)
        }, 300)
      }
    })(),
    []
  )

  const performSearch = async (searchParams: any) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('search_businesses_advanced', {
        search_query: searchParams.query || null,
        search_category: searchParams.category === 'all' ? null : searchParams.category,
        search_city: searchParams.location || null,
        min_rating: searchParams.rating || 0,
        search_tags: searchParams.tags?.length > 0 ? searchParams.tags : null,
        limit_count: ITEMS_PER_PAGE,
        offset_count: (currentPage - 1) * ITEMS_PER_PAGE,
      })

      if (error) {
        console.error('Search error:', error)
        return
      }

      // Transform data to match Business interface
      const transformedBusinesses = data?.map((business: any) => ({
        id: business.id,
        slug: business.slug || business.name.toLowerCase().replace(/\s+/g, '-'),
        name: business.name,
        description: business.description,
        category: business.category,
        subcategory: business.subcategory,
        location: {
          address: business.address,
          city: business.city,
          state: business.state,
          zipCode: business.zip_code,
          coordinates: business.latitude && business.longitude ? {
            lat: business.latitude,
            lng: business.longitude
          } : undefined
        },
        contact: {
          phone: business.phone,
          email: business.email,
          website: business.website
        },
        tags: business.tags || [],
        images: business.images || [],
        profileImage: business.profile_image,
        hours: business.hours || {},
        rating: business.rating || 0,
        reviewCount: business.review_count || 0,
        verified: business.verified || false,
        featured: business.featured || false,
        subscriptionStatus: business.subscription_status || 'inactive',
        subscriptionPlan: business.subscription_plan || 'basic',
        services: business.services || [],
        createdAt: business.created_at,
        updatedAt: business.updated_at
      })) || []

      setBusinesses(transformedBusinesses)
      setFilteredBusinesses(transformedBusinesses)
      setTotalResults(transformedBusinesses.length)
      setTotalPages(Math.ceil(transformedBusinesses.length / ITEMS_PER_PAGE))
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    performSearch(filters)
  }, [currentPage])

  // Debounced search when filters change
  useEffect(() => {
    if (filters.query || filters.category !== 'all' || filters.location || filters.rating > 0 || filters.tags?.length > 0) {
      debouncedSearch(filters)
    }
  }, [filters, debouncedSearch])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
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
      radius: 25,
    })
    setCurrentPage(1)
  }

  const activeFilterCount = [
    filters.query,
    filters.location,
    filters.category !== "all" ? filters.category : null,
    filters.rating && filters.rating > 0 ? filters.rating : null,
    filters.tags && filters.tags.length > 0 ? filters.tags : null,
  ].filter(Boolean).length

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {pages}
          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  const renderBusinessSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

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
                <SelectItem value="distance">Distance</SelectItem>
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

          <div className="text-sm text-muted-foreground">
            {isLoading ? "Searching..." : `${totalResults} businesses found`}
          </div>
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
                      <SelectItem value="Mental Health">Mental Health</SelectItem>
                      <SelectItem value="Nutrition & Dietetics">Nutrition & Dietetics</SelectItem>
                      <SelectItem value="Fitness & Personal Training">Fitness & Personal Training</SelectItem>
                      <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                      <SelectItem value="Holistic Health">Holistic Health</SelectItem>
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
                    {['licensed', 'insurance accepted', 'virtual sessions', 'accessible', 'bilingual', 'evidence-based', 'holistic', 'certified'].map((tag) => (
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
          {isLoading ? (
            renderBusinessSkeletons()
          ) : filteredBusinesses.length === 0 ? (
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
              
              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                {renderPagination()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
