"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

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

// Mock user data for demo
const mockUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
  role: "student",
  xp: 2450,
  level: 12,
  predictedGrade: "A*",
  currentWorkingAverage: 87.5,
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleSignOut = () => {
    // Mock sign out - just reload the page
    window.location.reload()
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="glass-card">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col glass-card m-4 rounded-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ProAcademics</span>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>
                  {mockUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{mockUser.name}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    Level {mockUser.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{mockUser.xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white neon-glow"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* XP Progress */}
          <div className="p-4 border-t border-white/10">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {mockUser.level + 1}</span>
                <span className="text-white">{mockUser.xp % 1000}/1000 XP</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(mockUser.xp % 1000) / 10}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-4 border-t border-white/10">
            <Button onClick={handleSignOut} variant="outline" className="w-full justify-start">
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
