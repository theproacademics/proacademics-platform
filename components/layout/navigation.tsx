"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Lex AI", href: "/lex", icon: Brain },
  { name: "Lessons", href: "/lessons", icon: BookOpen },
  { name: "Homework", href: "/homework", icon: ClipboardList },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Ask Lex", href: "/chat", icon: MessageCircle },
  { name: "Timetable", href: "/timetable", icon: Calendar },
]

// Mock user data
const mockUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
  role: "student",
  xp: 2450,
  level: 12,
  predictedGrade: "A*",
  currentWorkingAverage: 87.5,
  avatar: "/placeholder.svg?height=40&width=40",
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleSignOut = () => {
    window.location.reload()
  }

  if (!mounted) return null

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="glass-card border-white/20 hover:bg-white/10"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col glass-card m-4 rounded-2xl overflow-hidden">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ProAcademics</span>
            </div>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-500/30">
                <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {mockUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{mockUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                    Level {mockUser.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{mockUser.xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white neon-glow border border-blue-500/30"
                      : "text-muted-foreground hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent",
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5 transition-colors", isActive && "text-blue-400")} />
                  {item.name}
                  {isActive && <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse" />}
                </Link>
              )
            })}
          </nav>

          {/* XP Progress */}
          <div className="p-6 border-t border-white/10">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {mockUser.level + 1}</span>
                <span className="text-white font-medium">{mockUser.xp % 1000}/1000 XP</span>
              </div>
              <Progress value={(mockUser.xp % 1000) / 10} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {1000 - (mockUser.xp % 1000)} XP to next level
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Button variant="ghost" className="w-full justify-start hover:bg-white/5">
              <User className="mr-3 h-4 w-4" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-white/5">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
