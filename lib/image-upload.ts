import { createClient } from './supabase/client'

export interface ImageUploadResult {
  url: string
  path: string
  error?: string
}

export async function uploadImage(
  file: File,
  bucket: string = 'business-images',
  folder: string = 'uploads'
): Promise<ImageUploadResult> {
  try {
    const supabase = createClient()
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Error uploading image:', error)
      return { url: '', path: '', error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function deleteImage(
  path: string,
  bucket: string = 'business-images'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Error deleting image:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function uploadBusinessImages(
  files: File[],
  businessId: string
): Promise<{ success: boolean; images: ImageUploadResult[]; error?: string }> {
  try {
    const supabase = createClient()
    const uploadPromises = files.map(file => uploadImage(file, 'business-images', businessId))
    const results = await Promise.all(uploadPromises)

    const successfulUploads = results.filter(result => !result.error)
    const failedUploads = results.filter(result => result.error)

    if (failedUploads.length > 0) {
      console.warn('Some images failed to upload:', failedUploads)
    }

    // Save image records to database
    if (successfulUploads.length > 0) {
      const imageRecords = successfulUploads.map((result, index) => ({
        business_id: businessId,
        image_url: result.url,
        image_type: 'gallery' as const,
        sort_order: index,
        is_primary: index === 0,
      }))

      const { error: dbError } = await supabase
        .from('business_images')
        .insert(imageRecords)

      if (dbError) {
        console.error('Error saving image records:', dbError)
        return {
          success: false,
          images: results,
          error: 'Failed to save image records to database',
        }
      }
    }

    return {
      success: true,
      images: results,
    }
  } catch (error) {
    console.error('Error uploading business images:', error)
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Image must be JPEG, PNG, or WebP format' }
  }

  return { valid: true }
}
