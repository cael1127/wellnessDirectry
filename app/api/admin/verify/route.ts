import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    console.log('Admin login attempt')
    console.log('Admin password from env:', env.admin.password ? 'SET' : 'NOT SET')
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Check if password matches
    const isValid = password === env.admin.password
    console.log('Password valid:', isValid)

    if (isValid) {
      // Set admin session cookie (expires in 24 hours)
      const cookieStore = await cookies()
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
      
      console.log('Admin cookie set successfully')

      return NextResponse.json({ success: true })
    } else {
      console.log('Invalid password provided')
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Admin verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

