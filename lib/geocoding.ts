// Geocoding utilities for ZIP code to coordinates conversion
// In production, you would use a service like Google Maps Geocoding API, Mapbox, or similar

export interface Coordinates {
  lat: number
  lng: number
}

// Mock geocoding function - replace with actual geocoding service
export async function geocodeZipCode(zipCode: string): Promise<Coordinates | null> {
  // This is a mock implementation
  // In production, you would call a real geocoding API
  
  // Sample ZIP codes for San Francisco area
  const mockZipCodes: Record<string, Coordinates> = {
    '94102': { lat: 37.7749, lng: -122.4194 },
    '94103': { lat: 37.7849, lng: -122.4094 },
    '94104': { lat: 37.7649, lng: -122.4294 },
    '94105': { lat: 37.7549, lng: -122.4094 },
    '94106': { lat: 37.7449, lng: -122.4294 },
    '94107': { lat: 37.7349, lng: -122.4194 },
    '94108': { lat: 37.7249, lng: -122.4094 },
    '94109': { lat: 37.7149, lng: -122.3994 },
    '94110': { lat: 37.7049, lng: -122.3894 },
    '94111': { lat: 37.6949, lng: -122.3794 },
    '94112': { lat: 37.6849, lng: -122.3694 },
    '94114': { lat: 37.6749, lng: -122.3594 },
    '94115': { lat: 37.6649, lng: -122.3494 },
    '94116': { lat: 37.6549, lng: -122.3394 },
    '94117': { lat: 37.6449, lng: -122.3294 },
    '94118': { lat: 37.6349, lng: -122.3194 },
    '94121': { lat: 37.6249, lng: -122.3094 },
    '94122': { lat: 37.6149, lng: -122.2994 },
    '94123': { lat: 37.6049, lng: -122.2894 },
    '94124': { lat: 37.5949, lng: -122.2794 },
    '94127': { lat: 37.5849, lng: -122.2694 },
    '94129': { lat: 37.5749, lng: -122.2594 },
    '94130': { lat: 37.5649, lng: -122.2494 },
    '94131': { lat: 37.5549, lng: -122.2394 },
    '94132': { lat: 37.5449, lng: -122.2294 },
    '94133': { lat: 37.5349, lng: -122.2194 },
    '94134': { lat: 37.5249, lng: -122.2094 },
    '94158': { lat: 37.5149, lng: -122.1994 },
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return mockZipCodes[zipCode] || null
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Search businesses within radius
export async function searchBusinessesInRadius(
  zipCode: string,
  radius: number,
  category?: string,
  query?: string
) {
  const coordinates = await geocodeZipCode(zipCode)
  if (!coordinates) {
    throw new Error('Invalid ZIP code')
  }

  // This would be replaced with actual Supabase query
  // For now, return mock data
  return {
    businesses: [],
    coordinates,
    radius
  }
}


