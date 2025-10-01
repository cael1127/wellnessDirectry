export interface Directory {
  id: string
  slug: string
  name: string
  description?: string
  domain?: string
  subdomain?: string
  themeConfig: {
    primaryColor: string
    secondaryColor: string
    logo?: string
    customCSS?: string
  }
  settings: {
    allowBusinessRegistration: boolean
    requireVerification: boolean
    maxBusinessesPerUser: number
    allowedCategories?: string[]
    customFields?: Record<string, any>
  }
  isActive: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface DirectoryContext {
  currentDirectory: Directory | null
  setCurrentDirectory: (directory: Directory | null) => void
  directories: Directory[]
  isLoading: boolean
}

export interface DirectorySelectorProps {
  directories: Directory[]
  currentDirectory?: Directory | null
  onDirectoryChange: (directory: Directory) => void
  showCreateNew?: boolean
  onCreateNew?: () => void
}

export interface CreateDirectoryData {
  name: string
  description?: string
  domain?: string
  subdomain?: string
  themeConfig: {
    primaryColor: string
    secondaryColor: string
    logo?: string
  }
  settings: {
    allowBusinessRegistration: boolean
    requireVerification: boolean
    maxBusinessesPerUser: number
    allowedCategories?: string[]
  }
}
