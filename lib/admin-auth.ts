import { cookies } from 'next/headers'

export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    console.log('Admin cookie check:', {
      hasCookie: !!adminSession,
      value: adminSession?.value,
      isAdmin: adminSession?.value === 'true'
    })
    return adminSession?.value === 'true'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Admin access required')
  }
  return true
}

