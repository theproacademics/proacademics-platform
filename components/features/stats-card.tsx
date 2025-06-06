"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "orange" | "red"
  trend?: {
    value: number
    isPositive: boolean
  }
  animated?: boolean
  delay?: number
  className?: string
}

const colorClasses = {
  blue: "text-blue-400",
  green: "text-green-400",
  purple: "text-purple-400",
  orange: "text-orange-400",
  red: "text-red-400",
}

export function StatsCard({ title, value, icon, color, trend, animated = true, delay = 0, className }: StatsCardProps) {
  return (
    <Card
      className={cn(
        "glass-card futuristic-border hover:scale-105 transition-all duration-300",
        animated && "animate-fade-in",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
            {trend && (
              <div className="flex items-center space-x-1">
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={cn("text-sm font-medium", trend.isPositive ? "text-green-400" : "text-red-400")}>
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center", colorClasses[color])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
