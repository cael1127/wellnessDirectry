import { BusinessRegistrationForm } from "@/components/business-registration-form"
import { Header } from "@/components/header"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">List Your Business</h1>
            <p className="text-muted-foreground text-lg">
              Join thousands of businesses and connect with local customers
            </p>
          </div>

          <BusinessRegistrationForm />
        </div>
      </main>
    </div>
  )
}
