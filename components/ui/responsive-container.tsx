"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  animated?: boolean
  className?: string
}

const paddingClasses = {
  none: "",
  sm: "p-2 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-4 sm:p-6 lg:p-8",
  xl: "p-6 sm:p-8 lg:p-12",
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
}

export const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ children, padding = "md", maxWidth = "full", animated = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto",
          paddingClasses[padding],
          maxWidthClasses[maxWidth],
          animated && "animate-fade-in",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

ResponsiveContainer.displayName = "ResponsiveContainer"
