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
  "Therapist": Brain,
  "Psychiatrist": Stethoscope,
  "Health Coach": Sparkles,
  "Personal Trainer": Dumbbell,
  "Registered Dietitian": Apple,
}

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {categories.map((category) => {
        const Icon = categoryIcons[category as keyof typeof categoryIcons]

        return (
          <Link key={category} href={`/search?category=${encodeURIComponent(category.toLowerCase())}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
              <CardContent className="p-3 sm:p-4 lg:p-6 text-center h-full flex flex-col justify-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 sm:mb-3 bg-health-gradient/10 rounded-lg flex items-center justify-center group-hover:bg-health-gradient/20 transition-colors">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-health-primary" />
                </div>
                <h3 className="font-medium text-xs sm:text-sm lg:text-base leading-tight">{category}</h3>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
