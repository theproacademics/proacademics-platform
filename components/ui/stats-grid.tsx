"use client"

import type React from "react"

import { StatsCard } from "@/components/features/stats-card"
import { cn } from "@/lib/utils"

interface Stat {
  id: string
  title: string
  value: string | number
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "orange" | "red"
  trend?: {
    value: number
    isPositive: boolean
  }
}

interface StatsGridProps {
  stats: Stat[]
  columns?: 2 | 3 | 4
  animated?: boolean
  className?: string
}

export function StatsGrid({ stats, columns = 4, animated = true, className }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4 lg:gap-6", gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatsCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          animated={animated}
          delay={animated ? index * 100 : 0}
        />
      ))}
    </div>
  )
}
