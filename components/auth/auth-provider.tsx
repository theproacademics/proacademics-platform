"use client"

import { SessionProvider } from "next-auth/react"
import type React from "react"
import { Suspense } from "react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionProvider>{children}</SessionProvider>
    </Suspense>
  )
}
