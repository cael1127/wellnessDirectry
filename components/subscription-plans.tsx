"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: 5,
    period: "month",
    description: "Everything you need to list your healthcare practice",
    icon: Star,
    features: [
      "Healthcare provider listing",
      "Contact information display",
      "Business hours",
      "Service listings",
      "Patient reviews",
      "Basic analytics",
      "Email support"
    ],
    popular: true,
    cta: "Get Started - $5/month"
  }
]

export function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState("basic")

  const handleSubscribe = (planName: string) => {
    // In a real app, this would integrate with Stripe or similar
    console.log(`Subscribing to ${planName} plan`)
    // Redirect to payment processing
  }

  return (
    <div className="grid grid-cols-1 max-w-xl mx-auto">
      {plans.map((plan) => {
        const Icon = plan.icon
        const isSelected = selectedPlan === plan.name.toLowerCase()
        
        return (
          <Card 
            key={plan.name}
            className={`relative transition-all duration-200 ${
              plan.popular 
                ? 'border-primary shadow-lg scale-105' 
                : 'hover:shadow-md'
            } ${isSelected ? 'ring-2 ring-primary' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  plan.popular ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    plan.popular ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
              </div>
              
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <p className="text-muted-foreground">{plan.description}</p>
              
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                size="lg"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.name)}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}




