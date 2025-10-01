"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { Directory, DirectoryContext } from '@/types/directory'

const DirectoryContext = createContext<DirectoryContext | undefined>(undefined)

export function DirectoryProvider({ children }: { children: React.ReactNode }) {
  const [currentDirectory, setCurrentDirectory] = useState<Directory | null>(null)
  const [directories, setDirectories] = useState<Directory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDirectories()
  }, [])

  const loadDirectories = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('directories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      const transformedDirectories = data?.map((dir: any) => ({
        id: dir.id,
        slug: dir.slug,
        name: dir.name,
        description: dir.description,
        domain: dir.domain,
        subdomain: dir.subdomain,
        themeConfig: dir.theme_config || {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        },
        settings: dir.settings || {
          allowBusinessRegistration: true,
          requireVerification: false,
          maxBusinessesPerUser: 3
        },
        isActive: dir.is_active,
        createdBy: dir.created_by,
        createdAt: dir.created_at,
        updatedAt: dir.updated_at
      })) || []

      setDirectories(transformedDirectories)

      // Try to detect current directory from URL or subdomain
      const detectedDirectory = detectCurrentDirectory(transformedDirectories)
      if (detectedDirectory) {
        setCurrentDirectory(detectedDirectory)
      }
    } catch (error) {
      console.error('Error loading directories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const detectCurrentDirectory = (dirs: Directory[]): Directory | null => {
    if (typeof window === 'undefined') return null

    const hostname = window.location.hostname
    
    // Check for subdomain match
    const subdomainMatch = dirs.find(dir => 
      dir.subdomain && hostname.startsWith(`${dir.subdomain}.`)
    )
    if (subdomainMatch) return subdomainMatch

    // Check for domain match
    const domainMatch = dirs.find(dir => 
      dir.domain && hostname === dir.domain
    )
    if (domainMatch) return domainMatch

    // Check URL path for directory slug
    const pathMatch = dirs.find(dir => 
      window.location.pathname.startsWith(`/directory/${dir.slug}`)
    )
    if (pathMatch) return pathMatch

    // Default to first directory
    return dirs[0] || null
  }

  const value: DirectoryContext = {
    currentDirectory,
    setCurrentDirectory,
    directories,
    isLoading
  }

  return (
    <DirectoryContext.Provider value={value}>
      {children}
    </DirectoryContext.Provider>
  )
}

export function useDirectory() {
  const context = useContext(DirectoryContext)
  if (context === undefined) {
    throw new Error('useDirectory must be used within a DirectoryProvider')
  }
  return context
}

// Helper function to get directory by slug
export async function getDirectoryBySlug(slug: string): Promise<Directory | null> {
  try {
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      domain: data.domain,
      subdomain: data.subdomain,
      themeConfig: data.theme_config || {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF'
      },
      settings: data.settings || {
        allowBusinessRegistration: true,
        requireVerification: false,
        maxBusinessesPerUser: 3
      },
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  } catch (error) {
    console.error('Error fetching directory:', error)
    return null
  }
}
