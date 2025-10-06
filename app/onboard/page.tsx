import { BusinessOnboarding } from "@/components/business-onboarding"
import { Header } from "@/components/header"

export default function OnboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">List Your Wellness Business</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of wellness professionals who trust us to help them grow their practice. 
            Get started in just a few minutes.
          </p>
        </div>

        <BusinessOnboarding />
      </main>
    </div>
  )
}



