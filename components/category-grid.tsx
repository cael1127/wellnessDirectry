import { Card, CardContent } from "@/components/ui/card"
import { categories } from "@/lib/mock-data"
import Link from "next/link"
import {
  Brain,
  Apple,
  Dumbbell,
  Activity,
  Leaf,
  Target,
  Stethoscope,
  Sparkles,
  Recycle,
  Shield,
} from "lucide-react"

const categoryIcons = {
  "Mental Health": Brain,
  "Nutrition & Dietetics": Apple,
  "Fitness & Personal Training": Dumbbell,
  "Physical Therapy": Activity,
  "Alternative Medicine": Leaf,
  "Wellness Coaching": Target,
  "Medical Specialists": Stethoscope,
  "Holistic Health": Sparkles,
  "Rehabilitation": Recycle,
  "Preventive Care": Shield,
}

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map((category) => {
        const Icon = categoryIcons[category as keyof typeof categoryIcons]

        return (
          <Link key={category} href={`/search?category=${encodeURIComponent(category.toLowerCase())}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-sm">{category}</h3>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
