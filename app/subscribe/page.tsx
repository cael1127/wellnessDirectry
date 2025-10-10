import { SubscriptionPlans } from "@/components/subscription-plans"
import { Header } from "@/components/header"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Subscription Plans',
  description: 'Choose the perfect plan for your wellness business. Get listed on MinBod and start attracting new clients. Flexible pricing for practices of all sizes.',
  alternates: {
    canonical: '/subscribe',
  },
  openGraph: {
    title: 'Subscription Plans | MinBod',
    description: 'Choose the perfect plan for your wellness business and start attracting new clients.',
    type: 'website',
    url: 'https://minbod.netlify.app/subscribe',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get your wellness business listed and start attracting new clients. 
            Choose the plan that works best for your practice.
          </p>
        </div>

        <SubscriptionPlans />
      </main>
    </div>
  )
}




