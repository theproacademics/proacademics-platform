"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, BarChart3, BookOpen, Settings, Menu, X, LogOut, Tags, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Lessons", href: "/admin/lessons", icon: BookOpen },
  { name: "Past Papers", href: "/admin/pastpapers", icon: FileText },
  { name: "Subjects & Programs", href: "/admin/subjects", icon: Tags },
  { name: "System", href: "/admin/system", icon: Settings },
]

export function AdminNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="backdrop-blur-xl bg-slate-800/80 border-white/20 hover:bg-slate-700/80 text-white shadow-lg w-10 h-10"
        >
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-out lg:translate-x-0 admin-nav-container",
          // Responsive width - better mobile sizing
          "w-72 sm:w-72 lg:w-72",
          // Mobile transforms with spring animation
          isOpen 
            ? "translate-x-0 shadow-2xl" 
            : "-translate-x-full shadow-none",
          // Mobile-specific styling
          "lg:shadow-none"
        )}
      >
        <div className="flex h-full flex-col glass-card-transparent lg:m-4 lg:rounded-2xl m-2 rounded-xl overflow-hidden relative safe-area-inset">
          {/* Logo with close button on mobile */}
          <div className="flex items-center justify-between h-14 lg:h-16 px-4 lg:px-6 border-b border-white/10 backdrop-blur-sm relative z-10">
            <Link href="/admin" className="flex items-center space-x-2 lg:space-x-3 transition-transform hover:scale-105 duration-300" onClick={() => setIsOpen(false)}>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Settings className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-lg lg:text-xl font-bold gradient-text">Admin Panel</span>
            </Link>
            
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-8 h-8 hover:bg-white/10 transition-all duration-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Admin info - Clean mobile layout */}
          <div className="p-4 lg:p-6 border-b border-white/10 backdrop-blur-sm relative z-10">
            <div className="flex flex-col space-y-2 lg:space-y-3">
              <div>
                <p className="text-sm font-medium text-white truncate">Administrator</p>
                <p className="text-xs text-muted-foreground truncate lg:block hidden">System Management</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded backdrop-blur-sm">
                  Admin Access
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-1 lg:space-y-2 overflow-y-auto scrollbar-hide relative z-10">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-300 group relative overflow-hidden backdrop-blur-sm",
                    "active:scale-95 touch-manipulation", // Better mobile interaction
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white neon-glow border border-blue-500/30 shadow-lg"
                      : "text-muted-foreground hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent",
                  )}
                  style={{
                    animationDelay: `${index * 30}ms`, // Faster animation on mobile
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  <item.icon className={cn("mr-3 h-4 w-4 lg:h-5 lg:w-5 transition-colors relative z-10 flex-shrink-0", isActive && "text-blue-400")} />
                  <span className="relative z-10 truncate">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 lg:w-2 lg:h-2 bg-blue-400 rounded-full animate-pulse relative z-10 flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* System Status - Desktop only */}
          <div className="p-6 border-t border-white/10 backdrop-blur-sm relative z-10 hidden lg:block">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">System Status</span>
                <span className="text-green-400 font-medium">Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">All systems operational</span>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="p-3 lg:p-4 border-t border-white/10 backdrop-blur-sm space-y-1 lg:space-y-2 relative z-10">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group relative overflow-hidden py-2 lg:py-2.5 active:scale-95 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <LogOut className="mr-3 h-4 w-4 relative z-10 flex-shrink-0" />
                <span className="relative z-10 text-sm">Exit Admin Panel</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Overlay with better UX */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md lg:hidden transition-all duration-300 ease-out" 
          onClick={() => setIsOpen(false)}
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />
      )}
    </>
  )
}
