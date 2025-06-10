"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { AdminNavigation } from "@/components/admin/admin-navigation"

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Add styles to prevent white background on scroll
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* Fix background coverage for all scroll scenarios */
      html, body {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%) !important;
        background-attachment: fixed !important;
        min-height: 100vh !important;
      }
      
      /* Prevent elastic scroll on mobile */
      body {
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Extended Background Coverage to prevent white background on over-scroll */}
      <div 
        className="fixed pointer-events-none z-0"
        style={{ 
          top: '-100vh', 
          left: '-50vw', 
          right: '-50vw', 
          bottom: '-100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)'
        }}
      />
      
      <AdminNavigation />
      <div className="lg:ml-64 relative z-10">{children}</div>
    </div>
  )
}
