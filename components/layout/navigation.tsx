"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  BookOpen,
  Brain,
  Trophy,
  MessageCircle,
  TrendingUp,
  Calendar,
  ClipboardList,
  Menu,
  X,
  Zap,
  LogOut,
  Settings,
  User,
  Loader2,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Lex AI", href: "/lex", icon: Brain },
  { name: "Lessons", href: "/lessons", icon: BookOpen },
  { name: "Homework", href: "/homework", icon: ClipboardList },
  { name: "Past Papers", href: "/pastpapers", icon: FileText },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Ask Lex", href: "/chat", icon: MessageCircle },
  { name: "Timetable", href: "/timetable", icon: Calendar },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Get user data from session or use defaults
  const user = session?.user ? {
    id: (session.user as any).id || "unknown",
    name: session.user.name || "User",
    email: session.user.email || "user@example.com",
    role: (session.user as any).role || "student",
    userData: (session.user as any).userData || {},
  } : null

  // Calculate XP and level from user data
  const userStats = user?.userData ? {
    xp: user.userData.xp || user.userData.xpTotal || 2450,
    level: user.userData.level || user.userData.currentLevel || 12,
    predictedGrade: user.userData.predictedGrade || "A*",
    currentWorkingAverage: user.userData.currentWorkingAverage || 87.5,
  } : {
    xp: 2450,
    level: 12,
    predictedGrade: "A*",
    currentWorkingAverage: 87.5,
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({ 
        callbackUrl: "/auth/signin",
        redirect: true 
      })
    } catch (error) {
      console.error("Sign out error:", error)
      // Fallback: force redirect to signin page
      window.location.href = "/auth/signin"
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleProfileClick = () => {
    router.push("/profile")
    setIsOpen(false)
  }

  const handleSettingsClick = () => {
    router.push("/settings")
    setIsOpen(false)
  }

  if (!mounted) return null

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="fixed inset-y-0 left-0 z-40 w-72 lg:block hidden">
        <div className="flex h-full flex-col glass-card m-4 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50 safe-area-inset">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "glass-card border-white/20 hover:bg-white/10 transition-all duration-300 shadow-lg",
            "backdrop-blur-md bg-black/20 hover:bg-black/30",
            "hover:scale-105 active:scale-95 hover:shadow-xl"
          )}
        >
          <div className="relative">
            <Menu 
              className={cn(
                "h-4 w-4 transition-all duration-300",
                isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
              )} 
            />
            <X 
              className={cn(
                "h-4 w-4 absolute inset-0 transition-all duration-300",
                isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              )} 
            />
          </div>
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-out lg:translate-x-0",
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
        <div className="flex h-full flex-col glass-card lg:m-4 lg:rounded-2xl m-2 rounded-xl overflow-hidden relative safe-area-inset">

          {/* Logo with close button on mobile */}
          <div className="flex items-center justify-between h-14 lg:h-16 px-4 lg:px-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 relative z-10">
            <Link href="/" className="flex items-center space-x-2 lg:space-x-3 transition-transform hover:scale-105 duration-300" onClick={() => setIsOpen(false)}>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Zap className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-lg lg:text-xl font-bold gradient-text">ProAcademics</span>
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

          {/* User info - Clean mobile layout */}
          <div className="p-4 lg:p-6 border-b border-white/10 relative z-10">
            <div className="flex flex-col space-y-2 lg:space-y-3">
              <div>
                <p className="text-sm font-medium text-white truncate">{user?.name || "Loading..."}</p>
                <p className="text-xs text-muted-foreground truncate lg:block hidden">{user?.email || ""}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Level {userStats.level}
                </Badge>
                <span className="text-xs text-muted-foreground">{userStats.xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-1 lg:space-y-2 overflow-y-auto scrollbar-hide relative z-10">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-300 group relative overflow-hidden",
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
                </Link>
              )
            })}
          </nav>

          {/* XP Progress - Desktop only */}
          <div className="p-6 border-t border-white/10 relative z-10 hidden lg:block">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {userStats.level + 1}</span>
                <span className="text-white font-medium">{(userStats.xp % 1000).toLocaleString()}/1000 XP</span>
              </div>
              <div className="relative">
                <Progress value={(userStats.xp % 1000) / 10} className="h-2" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-50"></div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {(1000 - (userStats.xp % 1000)).toLocaleString()} XP to next level
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="p-3 lg:p-4 border-t border-white/10 space-y-1 lg:space-y-2 relative z-10">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full justify-start hover:bg-white/5 transition-all duration-300 group py-2 lg:py-2.5 active:scale-95"
              onClick={handleProfileClick}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <User className="mr-3 h-4 w-4 relative z-10 flex-shrink-0" />
              <span className="relative z-10 text-sm">Profile</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full justify-start hover:bg-white/5 transition-all duration-300 group py-2 lg:py-2.5 active:scale-95"
              onClick={handleSettingsClick}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <Settings className="mr-3 h-4 w-4 relative z-10 flex-shrink-0" />
              <span className="relative z-10 text-sm">Settings</span>
            </Button>
            <Button
              onClick={handleSignOut}
              disabled={isSigningOut}
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group relative overflow-hidden py-2 lg:py-2.5 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              {isSigningOut ? (
                <Loader2 className="mr-3 h-4 w-4 animate-spin relative z-10 flex-shrink-0" />
              ) : (
                <LogOut className="mr-3 h-4 w-4 relative z-10 flex-shrink-0" />
              )}
              <span className="relative z-10 text-sm">
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </span>
            </Button>
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
