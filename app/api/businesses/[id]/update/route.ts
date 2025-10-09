import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH - Business owner can update their own business
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Get current user from Supabase auth with server client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - please sign in' }, { status: 401 })
    }

    // Check if user owns this business
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (fetchError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (business.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized - not the owner' }, { status: 403 })
    }

    // Build update object (only allow certain fields)
    const allowedFields = [
      'name',
      'description',
      'subcategory',
      'address',
      'city',
      'state',
      'zip_code',
      'phone',
      'email',
      'website',
      'tags',
      'services',
      'hours',
      'social_links',
      'payment_methods',
      'languages',
      'accessibility_features',
      'insurance_accepted',
      'business_hours_notes',
    ]

    const updates: any = {}
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        // For hours field, ensure it's properly formatted as JSON
        if (field === 'hours') {
          // Supabase expects JSON/JSONB fields as objects, not strings
          updates[field] = typeof body[field] === 'string' 
            ? JSON.parse(body[field]) 
            : body[field]
        } else {
          updates[field] = body[field]
        }
      }
    })
    
    console.log('Updating business with:', updates)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the business
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    console.log('Business updated successfully:', updatedBusiness.id)
    return NextResponse.json({ success: true, business: updatedBusiness })
  } catch (error) {
    console.error('Update business error:', error)
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    )
  }
}

