import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { BusinessProfile } from "@/components/business-profile"
import { mockBusinesses } from "@/lib/mock-data"

interface BusinessPageProps {
  params: {
    id: string
  }
}

export default function BusinessPage({ params }: BusinessPageProps) {
  const business = mockBusinesses.find((b) => b.id === params.id)

  if (!business) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <BusinessProfile business={business} />
      </main>
    </div>
  )
}
