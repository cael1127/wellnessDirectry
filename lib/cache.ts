import { cache } from 'react'

// Cache configuration
const CACHE_DURATION = {
  BUSINESS: 5 * 60 * 1000, // 5 minutes
  SEARCH: 2 * 60 * 1000,   // 2 minutes
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
  STATIC: 60 * 60 * 1000,  // 1 hour
} as const

// In-memory cache store
const cacheStore = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache utility functions
export function setCache(key: string, data: any, ttl: number = CACHE_DURATION.STATIC) {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

export function getCache(key: string) {
  const cached = cacheStore.get(key)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > cached.ttl) {
    cacheStore.delete(key)
    return null
  }

  return cached.data
}

export function invalidateCache(pattern?: string) {
  if (!pattern) {
    cacheStore.clear()
    return
  }

  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key)
    }
  }
}

// Cached data fetching functions
export const getCachedBusiness = cache(async (slug: string) => {
  const cacheKey = `business:${slug}`
  const cached = getCache(cacheKey)
  
  if (cached) {
    return cached
  }

  // This would be replaced with actual Supabase call
  // For now, return null to indicate cache miss
  return null
})

export const getCachedSearchResults = cache(async (query: string, filters: any) => {
  const cacheKey = `search:${JSON.stringify({ query, filters })}`
  const cached = getCache(cacheKey)
  
  if (cached) {
    return cached
  }

  return null
})

export const getCachedCategories = cache(async () => {
  const cacheKey = 'categories'
  const cached = getCache(cacheKey)
  
  if (cached) {
    return cached
  }

  return null
})

// Cache warming functions
export async function warmBusinessCache(slugs: string[]) {
  // Pre-load popular business pages
  for (const slug of slugs) {
    const cacheKey = `business:${slug}`
    if (!getCache(cacheKey)) {
      // Fetch and cache business data
      // This would be implemented with actual Supabase calls
    }
  }
}

export async function warmSearchCache(popularQueries: string[]) {
  // Pre-load popular search queries
  for (const query of popularQueries) {
    const cacheKey = `search:${JSON.stringify({ query, filters: {} })}`
    if (!getCache(cacheKey)) {
      // Fetch and cache search results
      // This would be implemented with actual Supabase calls
    }
  }
}

// Cache statistics
export function getCacheStats() {
  const now = Date.now()
  let totalEntries = 0
  let expiredEntries = 0
  let totalSize = 0

  for (const [key, value] of cacheStore.entries()) {
    totalEntries++
    totalSize += JSON.stringify(value).length
    
    if (now - value.timestamp > value.ttl) {
      expiredEntries++
    }
  }

  return {
    totalEntries,
    expiredEntries,
    activeEntries: totalEntries - expiredEntries,
    totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    hitRate: 'N/A' // Would need to track hits/misses
  }
}

// Cleanup expired entries
export function cleanupCache() {
  const now = Date.now()
  let cleaned = 0

  for (const [key, value] of cacheStore.entries()) {
    if (now - value.timestamp > value.ttl) {
      cacheStore.delete(key)
      cleaned++
    }
  }

  return cleaned
}

// Auto-cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupCache, 5 * 60 * 1000)
}
