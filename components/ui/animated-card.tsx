"use client"

import type React from "react"

import { forwardRef } from "react"
import { Card, type CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends CardProps {
  hover?: boolean
  glow?: boolean
  gradient?: boolean
  delay?: number
  children: React.ReactNode
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, hover = true, glow = false, gradient = false, delay = 0, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "glass-card futuristic-border transition-all duration-300 ease-out animate-fade-in",
          hover && "hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20",
          glow && "neon-glow",
          gradient && "gradient-border",
          className,
        )}
        style={{ animationDelay: `${delay}ms` }}
        {...props}
      >
        {children}
      </Card>
    )
  },
)

AnimatedCard.displayName = "AnimatedCard"
