"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ChevronDown, 
  Plus, 
  Globe, 
  Settings, 
  Users, 
  CheckCircle,
  Circle
} from "lucide-react"
import type { Directory, DirectorySelectorProps, CreateDirectoryData } from "@/types/directory"
import { useDirectory } from "@/lib/directory-context"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function DirectorySelector({ 
  directories, 
  currentDirectory, 
  onDirectoryChange,
  showCreateNew = true,
  onCreateNew
}: DirectorySelectorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createData, setCreateData] = useState<CreateDirectoryData>({
    name: '',
    description: '',
    domain: '',
    subdomain: '',
    themeConfig: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF'
    },
    settings: {
      allowBusinessRegistration: true,
      requireVerification: false,
      maxBusinessesPerUser: 3
    }
  })

  const handleCreateDirectory = async () => {
    try {
      setIsCreating(true)
      
      const { data, error } = await supabase
        .from('directories')
        .insert({
          name: createData.name,
          description: createData.description,
          domain: createData.domain || null,
          subdomain: createData.subdomain || null,
          theme_config: createData.themeConfig,
          settings: createData.settings,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Directory created successfully!')
      
      // Reset form
      setCreateData({
        name: '',
        description: '',
        domain: '',
        subdomain: '',
        themeConfig: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        },
        settings: {
          allowBusinessRegistration: true,
          requireVerification: false,
          maxBusinessesPerUser: 3
        }
      })

      // Refresh directories
      window.location.reload()
    } catch (error) {
      console.error('Error creating directory:', error)
      toast.error('Failed to create directory')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Directory Display */}
      {currentDirectory && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentDirectory.themeConfig.primaryColor }}
                />
                <div>
                  <CardTitle className="text-lg">{currentDirectory.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {currentDirectory.description}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Active
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Directory Selector */}
      <div className="space-y-2">
        <Label>Switch Directory</Label>
        <Select 
          value={currentDirectory?.id || ''} 
          onValueChange={(value) => {
            const directory = directories.find(d => d.id === value)
            if (directory) onDirectoryChange(directory)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a directory" />
          </SelectTrigger>
          <SelectContent>
            {directories.map((directory) => (
              <SelectItem key={directory.id} value={directory.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: directory.themeConfig.primaryColor }}
                  />
                  <span>{directory.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {directories.map((directory) => (
          <Card 
            key={directory.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              currentDirectory?.id === directory.id 
                ? 'ring-2 ring-primary' 
                : ''
            }`}
            onClick={() => onDirectoryChange(directory)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: directory.themeConfig.primaryColor }}
                  />
                  <CardTitle className="text-sm">{directory.name}</CardTitle>
                </div>
                {currentDirectory?.id === directory.id && (
                  <CheckCircle className="w-4 h-4 text-primary" />
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-3">
                {directory.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="w-3 h-3" />
                  <span>
                    {directory.domain || directory.subdomain || 'No domain set'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Users className="w-3 h-3" />
                  <span>
                    Max {directory.settings.maxBusinessesPerUser} businesses per user
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Settings className="w-3 h-3" />
                  <span>
                    {directory.settings.requireVerification ? 'Verification required' : 'No verification required'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create New Directory */}
      {showCreateNew && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create New Directory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Directory</DialogTitle>
              <DialogDescription>
                Set up a new directory for a specific location or niche market.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Directory Name *</Label>
                  <Input
                    id="name"
                    value={createData.name}
                    onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., San Francisco Wellness"
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={createData.subdomain}
                    onChange={(e) => setCreateData(prev => ({ ...prev, subdomain: e.target.value }))}
                    placeholder="e.g., sf"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createData.description}
                  onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this directory's purpose and target audience"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="domain">Custom Domain (Optional)</Label>
                <Input
                  id="domain"
                  value={createData.domain}
                  onChange={(e) => setCreateData(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="e.g., wellness-sf.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={createData.themeConfig.primaryColor}
                    onChange={(e) => setCreateData(prev => ({
                      ...prev,
                      themeConfig: { ...prev.themeConfig, primaryColor: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={createData.themeConfig.secondaryColor}
                    onChange={(e) => setCreateData(prev => ({
                      ...prev,
                      themeConfig: { ...prev.themeConfig, secondaryColor: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxBusinesses">Max Businesses per User</Label>
                    <Input
                      id="maxBusinesses"
                      type="number"
                      min="1"
                      max="10"
                      value={createData.settings.maxBusinessesPerUser}
                      onChange={(e) => setCreateData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, maxBusinessesPerUser: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requireVerification"
                      checked={createData.settings.requireVerification}
                      onChange={(e) => setCreateData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, requireVerification: e.target.checked }
                      }))}
                    />
                    <Label htmlFor="requireVerification">Require Verification</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateData({
                  name: '',
                  description: '',
                  domain: '',
                  subdomain: '',
                  themeConfig: { primaryColor: '#3B82F6', secondaryColor: '#1E40AF' },
                  settings: { allowBusinessRegistration: true, requireVerification: false, maxBusinessesPerUser: 3 }
                })}>
                  Reset
                </Button>
                <Button 
                  onClick={handleCreateDirectory}
                  disabled={isCreating || !createData.name}
                >
                  {isCreating ? 'Creating...' : 'Create Directory'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
