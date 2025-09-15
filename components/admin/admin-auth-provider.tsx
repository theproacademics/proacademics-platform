"use client"

import type React from "react"
import { createContext, useContext } from "react"

interface AdminUser {
  id: string
  name: string
  email: string
  role: "super_admin" | "admin" | "moderator"
  permissions: string[]
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  // Get admin credentials from environment variables
  const user = {
    id: "admin-1",
    name: process.env.NEXT_PUBLIC_ADMIN_NAME || process.env.ADMIN_NAME || "System Administrator",
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@proacademics.com",
    role: "super_admin" as const,
    permissions: ["manage_users", "manage_content", "view_analytics", "manage_system"],
  }

  return <AdminAuthContext.Provider value={{ user, loading: false }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
