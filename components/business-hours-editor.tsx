"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface DayHours {
  open?: string
  close?: string
  closed?: boolean
}

interface BusinessHours {
  monday?: DayHours
  tuesday?: DayHours
  wednesday?: DayHours
  thursday?: DayHours
  friday?: DayHours
  saturday?: DayHours
  sunday?: DayHours
}

interface BusinessHoursEditorProps {
  hours: BusinessHours
  onChange: (hours: BusinessHours) => void
}

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

const DAY_LABELS = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
}

export function BusinessHoursEditor({ hours, onChange }: BusinessHoursEditorProps) {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(hours || {})

  useEffect(() => {
    // Initialize with default hours if empty
    if (!hours || Object.keys(hours).length === 0) {
      const defaultHours: BusinessHours = {
        monday: { open: "09:00", close: "17:00" },
        tuesday: { open: "09:00", close: "17:00" },
        wednesday: { open: "09:00", close: "17:00" },
        thursday: { open: "09:00", close: "17:00" },
        friday: { open: "09:00", close: "17:00" },
        saturday: { closed: true },
        sunday: { closed: true },
      }
      setBusinessHours(defaultHours)
      onChange(defaultHours)
    }
  }, [])

  const handleDayChange = (day: string, field: 'open' | 'close', value: string) => {
    const updated = {
      ...businessHours,
      [day]: {
        ...businessHours[day as keyof BusinessHours],
        [field]: value,
      },
    }
    setBusinessHours(updated)
    onChange(updated)
  }

  const handleClosedToggle = (day: string, isClosed: boolean) => {
    const updated = {
      ...businessHours,
      [day]: isClosed 
        ? { closed: true }
        : { open: "09:00", close: "17:00" },
    }
    setBusinessHours(updated)
    onChange(updated)
  }

  const copyToAll = (sourceDay: string) => {
    const sourceDayHours = businessHours[sourceDay as keyof BusinessHours]
    if (!sourceDayHours) return

    const updated = DAYS.reduce((acc, day) => {
      acc[day] = { ...sourceDayHours }
      return acc
    }, {} as BusinessHours)

    setBusinessHours(updated)
    onChange(updated)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map((day) => {
          const dayHours = businessHours[day] || { closed: false, open: "09:00", close: "17:00" }
          const isClosed = dayHours.closed || false

          return (
            <div key={day} className="grid grid-cols-12 gap-4 items-center">
              {/* Day Name */}
              <div className="col-span-3">
                <Label className="text-sm font-medium capitalize">
                  {DAY_LABELS[day]}
                </Label>
              </div>

              {/* Closed Checkbox */}
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox
                  id={`${day}-closed`}
                  checked={isClosed}
                  onCheckedChange={(checked) => handleClosedToggle(day, checked as boolean)}
                />
                <Label htmlFor={`${day}-closed`} className="text-sm text-muted-foreground cursor-pointer">
                  Closed
                </Label>
              </div>

              {/* Open Time */}
              <div className="col-span-3">
                <Input
                  type="time"
                  value={dayHours.open || "09:00"}
                  onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                  disabled={isClosed}
                  className="h-9"
                />
              </div>

              {/* Close Time */}
              <div className="col-span-3">
                <Input
                  type="time"
                  value={dayHours.close || "17:00"}
                  onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                  disabled={isClosed}
                  className="h-9"
                />
              </div>

              {/* Copy Button */}
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => copyToAll(day)}
                  className="text-xs text-primary hover:underline"
                  title="Copy to all days"
                >
                  Copy
                </button>
              </div>
            </div>
          )
        })}

        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p>💡 Tip: Click "Copy" next to any day to apply those hours to all days</p>
        </div>
      </CardContent>
    </Card>
  )
}

