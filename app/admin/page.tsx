import { redirect } from 'next/navigation'

// Redirect /admin to /admin/login
export default function AdminPage() {
  redirect('/admin/login')
}
