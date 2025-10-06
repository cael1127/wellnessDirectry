"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign } from "lucide-react"

interface Service {
  name: string
  price: string
  duration: string
}

interface BusinessServicesProps {
  business: {
    services: Service[]
  }
}

export function BusinessServices({ business }: BusinessServicesProps) {
  if (!business.services || business.services.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services & Pricing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {business.services.map((service, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">{service.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{service.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}




