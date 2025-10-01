import { AdminDashboard } from "@/components/admin-dashboard"
import { Header } from "@/components/header"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <AdminDashboard />
      </main>
    </div>
  )
}
