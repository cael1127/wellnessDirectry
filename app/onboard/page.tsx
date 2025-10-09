import { EnhancedBusinessOnboarding } from "@/components/enhanced-business-onboarding"
import { Header } from "@/components/header"

export default function OnboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 md:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            List Your Healthcare Practice
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Join healthcare professionals who use our platform to grow their practice. 
            Get started in just a few minutes.
          </p>
        </div>

        <EnhancedBusinessOnboarding />
      </main>
    </div>
  )
}




