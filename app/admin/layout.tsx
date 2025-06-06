import type { ReactNode } from "react"
import { AdminNavigation } from "@/components/admin/admin-navigation"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminNavigation />
      <div className="lg:ml-64">{children}</div>
    </div>
  )
}
