"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  badges?: Array<{
    label: string
    icon?: ReactNode
    variant?: "default" | "secondary" | "destructive" | "outline"
    color?: string
  }>
  actions?: ReactNode
  showBack?: boolean
  className?: string
}

export function PageHeader({ title, description, badges, actions, showBack = false, className }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className={cn("mb-8 animate-fade-in", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="hover:bg-white/10 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold gradient-text">{title}</h1>
          </div>
          {description && <p className="text-muted-foreground text-lg">{description}</p>}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || "outline"}
                  className={cn(
                    "px-3 py-1 text-xs sm:text-sm transition-all duration-200 hover:scale-105",
                    badge.color && `border-${badge.color}-500 text-${badge.color}-400`,
                  )}
                >
                  {badge.icon && <span className="mr-1">{badge.icon}</span>}
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  )
}
