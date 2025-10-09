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
import { categories, popularTags } from "@/lib/mock-data"
import { BusinessCard } from "@/components/business-card"
import { createClient } from "@/lib/supabase/client"
import type { Business, SearchFilters } from "@/types/business"

// Helper function to calculate distance between two coordinates (in miles)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function SearchInterface() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [geocoding, setGeocoding] = useState(false)

  // Read URL parameters on mount
  const getInitialFilters = (): SearchFilters => {
    if (typeof window === 'undefined') {
      return {
        query: "",
        location: "",
        category: "all",
        rating: 0,
        tags: [],
        sortBy: "relevance",
        radius: 25,
      }
    }

    const params = new URLSearchParams(window.location.search)
    return {
      query: params.get('query') || params.get('q') || "",
      location: params.get('zipCode') || params.get('location') || params.get('zip') || "",
      category: params.get('category') || "all",
      rating: parseFloat(params.get('rating') || "0"),
      tags: params.get('tags')?.split(',').filter(Boolean) || [],
      sortBy: (params.get('sortBy') as any) || "relevance",
      radius: parseInt(params.get('radius') || "25"),
    }
  }

  const [filters, setFilters] = useState<SearchFilters>(getInitialFilters())

  // Log initial filters on mount
  useEffect(() => {
    const initialFilters = getInitialFilters()
    console.log('🔍 Initial filters from URL:', initialFilters)
    if (initialFilters.location) {
      console.log(`📍 Will geocode: "${initialFilters.location}"`)
    }
  }, [])

  // Geocode ANY zip code or city when location changes
  useEffect(() => {
    async function geocodeLocation() {
      if (!filters.location || filters.location.trim().length < 3) {
        setSearchLocation(null)
        return
      }

      setGeocoding(true)
      try {
        const searchQuery = filters.location.trim()
        console.log(`🌍 Geocoding: "${searchQuery}"`)
        
        // Use Nominatim (OpenStreetMap) geocoding API - works with ANY US zip code or city
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=us&limit=1`,
          { headers: { 'User-Agent': 'HealthDirectory/1.0' } }
        )
        const data = await response.json()
        
        if (data && data.length > 0) {
          const location = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          }
          setSearchLocation(location)
          console.log(`✅ Geocoded "${searchQuery}" to:`, location, `(${data[0].display_name})`)
        } else {
          setSearchLocation(null)
          console.log(`❌ Could not geocode "${searchQuery}"`)
        }
      } catch (error) {
        console.error('Geocoding error:', error)
        setSearchLocation(null)
      } finally {
        setGeocoding(false)
      }
    }

    // Debounce geocoding requests
    const timeoutId = setTimeout(() => {
      geocodeLocation()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [filters.location])

  // Fetch businesses from Supabase on mount
  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        // Show all businesses regardless of status or category
        .order('featured', { ascending: false })
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (data && !error) {
        setBusinesses(data)
        setFilteredBusinesses(data)
      }
      setLoading(false)
    }
    
    fetchBusinesses()
  }, [])

  // Filter businesses based on current filters
  useEffect(() => {
    // CRITICAL: Don't show any results while geocoding or if location is entered but not geocoded yet
    if (filters.location && filters.location.trim().length >= 3 && !searchLocation && !geocoding) {
      console.log('⏳ Waiting for geocoding to complete...')
      setFilteredBusinesses([])
      return
    }

    let filtered = [...businesses]

    // Calculate distances if we have search location from zip code
    const businessesWithDistance = filtered.map(business => {
      let distance = Infinity
      
      if (searchLocation) {
        // If business has coordinates, calculate distance
        if (business.latitude && business.longitude) {
          distance = calculateDistance(
            searchLocation.lat,
            searchLocation.lng,
            business.latitude,
            business.longitude
          )
        } else {
          // If business doesn't have coordinates but has address, estimate distance by zip/city match
          const bizZip = business.zip_code?.replace(/[^0-9]/g, '').substring(0, 5) // Normalize zip (77979-2424 -> 77979)
          const searchZip = (filters.location || '').replace(/[^0-9]/g, '').substring(0, 5)
          const searchCity = (filters.location || '').toLowerCase().trim()
          const bizCity = business.city?.toLowerCase().trim()
          
          // Same zip code or same city = considered "nearby"
          if (bizZip === searchZip || bizCity === searchCity) {
            distance = 0.5 // Assume same zip/city = 0.5 miles away
            console.log(`📍 ${business.name}: No coordinates, but matches location (${business.zip_code || business.city}) - assuming 0.5 mi`)
          } else {
            console.log(`⚠️ ${business.name}: No coordinates and different location - excluding`)
          }
        }
      }
      
      return { ...business, distance }
    })

    filtered = businessesWithDistance

    // CRITICAL: Filter by radius FIRST - applies to ALL businesses including featured
    // ONLY show businesses within radius IF we have a search location
    if (searchLocation && filters.location && filters.location.trim().length >= 3) {
      const radiusToUse = filters.radius || 25
      console.log(`Applying radius filter: ${radiusToUse} mi from ${filters.location}`)
      console.log(`Search location:`, searchLocation)
      
      filtered = filtered.filter(business => {
        // Allow businesses without coordinates IF they're in the same zip code
        const hasValidDistance = business.distance !== Infinity && business.distance !== undefined && business.distance !== null
        
        if (!hasValidDistance) {
          console.log(`❌ Filtering out ${business.name}: no valid distance`)
          return false
        }
        
        // Must be within radius (applies to featured too - NO EXCEPTIONS!)
        const isWithinRadius = (business.distance || 0) <= radiusToUse
        
        // Debug logging
        if (!isWithinRadius) {
          console.log(`❌ Filtering out ${business.name}: ${(business.distance || 0).toFixed(1)} mi > ${radiusToUse} mi (Featured: ${business.featured})`)
        } else {
          const coordStatus = business.latitude && business.longitude ? 'GPS' : 'Same Zip'
          console.log(`✅ Keeping ${business.name}: ${(business.distance || 0).toFixed(1)} mi ≤ ${radiusToUse} mi (${coordStatus}, Featured: ${business.featured})`)
        }
        return isWithinRadius
      })
      
      console.log(`📊 After radius filter (${radiusToUse} mi): ${filtered.length} businesses remaining`)
    } else {
      console.log(`⚠️ No radius filter applied - searchLocation: ${!!searchLocation}, location: "${filters.location}"`)
    }

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

    // Category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((business) => business.category.toLowerCase() === filters.category?.toLowerCase())
    }

    // Rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter((business) => {
        const rating = typeof business.rating === 'string' ? parseFloat(business.rating) : business.rating
        return rating >= filters.rating!
      })
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((business) => filters.tags!.some((tag) => business.tags.includes(tag)))
    }

    // Sort results - Featured first, then by distance (closest)
    filtered.sort((a, b) => {
      // PRIORITY 1: Featured always first (NO EXCEPTIONS!)
      if (a.featured !== b.featured) {
        return b.featured ? 1 : -1
      }
      
      // PRIORITY 2: Distance (closest first) - only if we have search location
      if (searchLocation && a.distance !== b.distance && a.distance !== Infinity && b.distance !== Infinity && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance
      }
      
      // PRIORITY 3: Rating (highest first)
      const aRating = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0)
      const bRating = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0)
      return bRating - aRating
    })

    console.log(`🎯 FINAL RESULTS: ${filtered.length} businesses`)
    if (filtered.length > 0) {
      console.log('📋 Results in order:')
      filtered.forEach((b, idx) => {
        const distanceStr = b.distance !== Infinity && b.distance !== undefined ? `${b.distance.toFixed(1)} mi` : 'no distance'
        const featuredStr = b.featured ? '⭐ FEATURED' : '   regular'
        console.log(`  ${idx + 1}. [${featuredStr}] ${b.name}: ${distanceStr} (Rating: ${b.rating || 0})`)
      })
    }
    setFilteredBusinesses(filtered)
  }, [filters, businesses, searchLocation, geocoding])

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
      radius: 25,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-card rounded-lg shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Search Query */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search health professionals..."
                value={filters.query}
                onChange={(e) => updateFilter("query", e.target.value)}
                className="pl-10 h-10 sm:h-11"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Zip Code or City"
                value={filters.location}
                onChange={(e) => updateFilter("location", e.target.value)}
                className="pl-10 h-10 sm:h-11"
              />
              {geocoding && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>

          {/* Sort */}
          <div>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
              <SelectTrigger className="h-10 sm:h-11">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <div className="text-sm text-muted-foreground">
            {filteredBusinesses.length} health professionals found
            {searchLocation && filters.location && (
              <span className="ml-2 text-primary font-medium">
                near {filters.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm sm:text-base">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs sm:text-sm">
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Category</h4>
                  <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                    <SelectTrigger className="h-9 sm:h-10">
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

                {/* Distance/Radius Filter */}
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Distance Radius</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <Slider
                      value={[filters.radius || 25]}
                      onValueChange={(value) => updateFilter("radius", value[0])}
                      max={100}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                      <span>5 miles</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>{filters.radius || 25} miles</span>
                      </div>
                      <span>100 miles</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Minimum Rating</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <Slider
                      value={[filters.rating || 0]}
                      onValueChange={(value) => updateFilter("rating", value[0])}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
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
                  <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Tags</h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    {popularTags.slice(0, 8).map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={filters.tags?.includes(tag) || false}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <label htmlFor={tag} className="text-xs sm:text-sm cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Tags */}
                {filters.tags && filters.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Active Tags</h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {filters.tags.map((tag) => (
                        <Badge key={tag} variant="default" className="flex items-center gap-1 text-xs">
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
          {loading ? (
            <Card>
              <CardContent className="p-6 sm:p-8 md:p-12 text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
                  <p className="text-sm sm:text-base">Loading businesses...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredBusinesses.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 md:p-12 text-center">
                <Search className="w-12 h-12 sm:w-14 sm:h-14 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium mb-2">No health professionals found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md mx-auto">
                  Try adjusting your search criteria, increasing the radius, or clearing filters
                </p>
                <Button onClick={clearFilters} variant="outline" size="sm" className="w-full sm:w-auto">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
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
