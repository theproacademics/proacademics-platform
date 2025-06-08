"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Star, 
  Calendar, 
  Award, 
  Zap, 
  Brain,
  MessageCircle,
  Users,
  PlayCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Timer,
  BookMarked,
  Flame,
  ChevronRight,
  Plus,
  BarChart3,
  Activity,
  Globe,
  Rocket
} from "lucide-react"
import Link from "next/link"

// Premium 3D Loading Skeleton
const LoadingSkeleton = () => (
  <div className="space-y-12 p-8">
    <div className="animate-pulse">
      <div className="h-16 bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-pink-500/20 rounded-3xl mb-8 shadow-2xl backdrop-blur-xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl shadow-xl backdrop-blur-xl border border-white/10 transform hover:scale-105 transition-all duration-500"></div>
        ))}
      </div>
    </div>
  </div>
)

// Dynamic Particle Background with Advanced Animations
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-purple-900/40"></div>
      
      {/* Large floating orbs with movement */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float-slow opacity-60"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-bl from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-slow-reverse opacity-60" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-40 left-1/4 w-72 h-72 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-float-slow opacity-60" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/2 -right-20 w-64 h-64 bg-gradient-to-bl from-orange-500/15 to-red-500/15 rounded-full blur-3xl animate-float-slow-reverse opacity-50" style={{ animationDelay: '6s' }}></div>
      
      {/* Moving particles */}
      {[...Array(100)].map((_, i) => {
        const size = Math.random() * 4 + 2;
        const colors = [
          'from-blue-400/60 to-cyan-400/60',
          'from-purple-400/60 to-pink-400/60',
          'from-emerald-400/60 to-teal-400/60',
          'from-orange-400/60 to-red-400/60',
          'from-violet-400/60 to-fuchsia-400/60',
          'from-cyan-400/60 to-blue-400/60'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${randomColor} animate-particle-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${Math.random() * 15 + 10}s`,
              filter: `blur(${Math.random() * 1}px)`,
              boxShadow: `0 0 ${size * 2}px currentColor`
            }}
          />
        );
      })}
      
      {/* Shooting stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: '3s'
          }}
        />
      ))}
      
      {/* Moving wave lines */}
      <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-wave-move"></div>
      <div className="absolute top-2/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-wave-move-reverse" style={{ animationDelay: '3s' }}></div>
      
      {/* Floating geometric shapes */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`shape-${i}`}
          className="absolute animate-shape-float opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 20 + 15}s`
          }}
        >
          {i % 3 === 0 && (
            <div className="w-2 h-2 border border-cyan-400/40 rotate-45 transform"></div>
          )}
          {i % 3 === 1 && (
            <div className="w-1.5 h-1.5 bg-purple-400/40 rounded-full"></div>
          )}
          {i % 3 === 2 && (
            <div className="w-2 h-2 border border-pink-400/40 rounded-full"></div>
          )}
        </div>
      ))}
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] opacity-40"></div>
    </div>
  )
}

// Modern Elegant Stat Card with Gradient Design
const StatCard = ({ stat, index }: { stat: any, index: number }) => {
  const cardStyles = {
    blue: {
      gradient: "from-blue-500/90 via-cyan-500/90 to-blue-600/90",
      shadow: "shadow-blue-500/25",
      icon: "text-white bg-white/20",
      glow: "group-hover:shadow-blue-400/40"
    },
    orange: {
      gradient: "from-orange-500/90 via-amber-500/90 to-orange-600/90", 
      shadow: "shadow-orange-500/25",
      icon: "text-white bg-white/20",
      glow: "group-hover:shadow-orange-400/40"
    },
    green: {
      gradient: "from-emerald-500/90 via-green-500/90 to-emerald-600/90",
      shadow: "shadow-emerald-500/25", 
      icon: "text-white bg-white/20",
      glow: "group-hover:shadow-emerald-400/40"
    },
    purple: {
      gradient: "from-purple-500/90 via-violet-500/90 to-purple-600/90",
      shadow: "shadow-purple-500/25",
      icon: "text-white bg-white/20", 
      glow: "group-hover:shadow-purple-400/40"
    }
  }

  const style = cardStyles[stat.color as keyof typeof cardStyles]

  return (
    <div 
      className="group relative animate-fade-in"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Subtle glow background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500`}></div>
      
      {/* Main elegant card */}
      <div className={`relative bg-gradient-to-br ${style.gradient} backdrop-blur-xl rounded-2xl ${style.shadow} group-hover:shadow-2xl ${style.glow} transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1 overflow-hidden`}>
        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
        
        {/* Content */}
        <div className="relative p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 lg:p-4 rounded-xl ${style.icon} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              {stat.icon}
            </div>
            {stat.trend && (
              <div className="flex items-center text-xs px-3 py-1.5 rounded-full bg-white/20 text-white font-semibold backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{stat.trend.value}%
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl lg:text-3xl font-black text-white drop-shadow-lg">
              {stat.value}
            </p>
            <p className="text-sm lg:text-base font-medium text-white/90">
              {stat.title}
            </p>
          </div>
        </div>
        
        {/* Elegant shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      </div>
    </div>
  )
}

// Modern homework item
const HomeworkItem = ({ hw, index }: { hw: any, index: number }) => {
  const isOverdue = hw.status === "overdue"
  const isCompleted = hw.status === "completed"
  
  const statusStyles = {
    completed: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    overdue: "bg-red-500/10 border-red-500/20 text-red-400", 
    in_progress: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    not_started: "bg-slate-500/10 border-slate-500/20 text-slate-400"
  }

  return (
    <div 
      className="group relative overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
      <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/8 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-[1.01] group-hover:-translate-y-0.5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-500/20' : isOverdue ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                  <BookOpen className={`h-4 w-4 ${isCompleted ? 'text-emerald-400' : isOverdue ? 'text-red-400' : 'text-blue-400'}`} />
                </div>
                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {hw.title || "Assignment"}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : "No due date"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="h-3 w-3" />
                  {hw.subject || "General"}
                </span>
              </div>
            </div>
            <Badge className={`${statusStyles[hw.status as keyof typeof statusStyles]} border`}>
              {hw.status === "completed" && <><Star className="w-3 h-3 mr-1" />Completed</>}
              {hw.status === "overdue" && <><Clock className="w-3 h-3 mr-1" />Overdue</>}
              {hw.status === "in_progress" && <><Timer className="w-3 h-3 mr-1" />In Progress</>}
              {hw.status === "not_started" && <><Plus className="w-3 h-3 mr-1" />Not Started</>}
            </Badge>
          </div>
          
          {hw.progress !== undefined && hw.status !== "completed" && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-medium">{hw.progress}%</span>
              </div>
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${hw.progress}%` }}
                />
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isCompleted ? (
              <>
                <Star className="w-4 h-4 mr-2" />
                Review Assignment
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                {isOverdue ? "Complete Now" : "Continue"}
              </>
            )}
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </CardContent>
      </div>
    </div>
  )
}

// Elegant Modern Quick Action Button
const QuickActionButton = ({ href, icon: Icon, title, description, gradient, index }: any) => (
  <Link href={href} className="group block">
    <div 
      className="relative animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Subtle glow background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-lg opacity-15 group-hover:opacity-25 group-hover:scale-105 transition-all duration-500`}></div>
      
      {/* Main elegant card */}
      <div className={`relative bg-gradient-to-br ${gradient} backdrop-blur-xl rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1 overflow-hidden h-36 sm:h-40`}>
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-white/10"></div>
        
        {/* Content */}
        <div className="relative p-6 h-full flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-xl bg-white/20 mb-4 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
            <Icon className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
          <h3 className="font-bold text-white text-sm sm:text-base mb-1 drop-shadow-sm">
            {title}
          </h3>
          <p className="text-xs text-white/80 font-medium">
            {description}
          </p>
        </div>
        
        {/* Elegant shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      </div>
    </div>
  </Link>
)

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userStats, setUserStats] = useState<any>(null)
  const [homework, setHomework] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch user-specific data when session is available
  useEffect(() => {
    if (session?.user) {
      const userData = (session.user as any).userData || {}
      setUserStats({
        xpTotal: userData.xp || userData.xpTotal || 1250,
        currentLevel: userData.level || userData.currentLevel || 8,
        studyStreak: userData.studyStreak || userData.streak || 12,
        currentWorkingAverage: userData.currentWorkingAverage || 85.7,
        predictedGrade: userData.predictedGrade || "A",
        weakTopics: userData.weakTopics || ["Calculus", "Organic Chemistry"],
        strongTopics: userData.strongTopics || ["Algebra", "Physics", "Literature"],
        recentTopics: userData.recentTopics || ["Quadratic Equations", "Wave Motion"]
      })
      fetchHomework()
    }
  }, [session])

  const fetchHomework = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/homework?limit=3')
      if (response.ok) {
        const data = await response.json()
        setHomework(data.homework || [])
      }
    } catch (error) {
      console.error('Error fetching homework:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 relative">
        <AnimatedBackground />
        <Navigation />
        <main className="lg:ml-72 min-h-screen relative z-10 p-8">
          <LoadingSkeleton />
        </main>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const user = session?.user
  const stats = userStats || {}

  if (!user) {
    return null
  }

  // Calculate level progress
  const currentLevelXP = (stats.currentLevel - 1) * 200
  const nextLevelXP = stats.currentLevel * 200
  const progressToNextLevel = Math.max(0, stats.xpTotal - currentLevelXP)
  const xpNeededForNextLevel = Math.max(0, nextLevelXP - stats.xpTotal)
  const levelProgressPercentage = Math.max(0, Math.min(100, (progressToNextLevel / 200) * 100))

  const dashboardStats = [
    {
      id: "xp",
      title: "Total XP",
      value: stats.xpTotal?.toLocaleString() || "0",
      icon: <Zap className="w-6 h-6" />,
      color: "blue",
      trend: { value: 15, isPositive: true }
    },
    {
      id: "streak",
      title: "Study Streak", 
      value: `${stats.studyStreak || 0} days`,
      icon: <Flame className="w-6 h-6" />,
      color: "orange",
      trend: { value: 12, isPositive: true }
    },
    {
      id: "average",
      title: "Average Score",
      value: `${(stats.currentWorkingAverage || 0).toFixed(1)}%`,
      icon: <BarChart3 className="w-6 h-6" />,
      color: "green", 
      trend: { value: 8, isPositive: true }
    },
    {
      id: "level",
      title: "Current Level",
      value: stats.currentLevel || 1,
      icon: <GraduationCap className="w-6 h-6" />,
      color: "purple",
      trend: { value: 25, isPositive: true }
    }
  ]

  const quickActions = [
    {
      href: "/lex",
      icon: Brain,
      title: "Lex AI Tutor",
      description: "Personalized learning",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      href: "/homework", 
      icon: BookOpen,
      title: "Homework",
      description: "View assignments",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      href: "/lessons",
      icon: Calendar,
      title: "Live Lessons", 
      description: "Join classes",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      href: "/leaderboard",
      icon: Trophy,
      title: "Leaderboard",
      description: "See rankings",
      gradient: "from-orange-500 to-red-500"
    }
  ]

  const homeworkWithDates = homework.map(hw => ({
    ...hw,
    dueDate: new Date(hw.dueDate)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 relative font-inter">
      <AnimatedBackground />
      <Navigation />
      
      <main className="lg:ml-72 min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-12 max-w-8xl mx-auto">
          {/* Stunning Enhanced Header Section */}
          <div className="mb-20 animate-fade-in relative">
            {/* Background glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 lg:p-12">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">
                
                {/* Welcome Content */}
                <div className="flex-1 space-y-8">
                  <div className="relative">
                    {/* Main welcome text with advanced styling */}
                    <div className="space-y-3">
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                        <span className="block text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text animate-gradient-text">
                          Welcome back,
                        </span>
                        <span className="block text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text mt-2 animate-gradient-text-reverse">
                          {user.name}!
                        </span>
                        <span className="inline-block text-4xl sm:text-5xl lg:text-6xl animate-wave ml-4">👋</span>
                      </h1>
                    </div>
                    
                    {/* Glowing backdrop */}
                    <div className="absolute inset-0 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-cyan-400/10 blur-2xl -z-10">
                      Welcome back, {user.name}! 👋
                    </div>
                  </div>
                  
                  {/* Subtitle with enhanced styling */}
                  <div className="relative">
                    <p className="text-xl sm:text-2xl lg:text-3xl text-slate-100 font-medium leading-relaxed">
                      Ready to{" "}
                      <span className="relative inline-block">
                        <span className="text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text font-bold animate-pulse">
                          accelerate
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/20 via-violet-300/20 to-fuchsia-300/20 blur-lg animate-pulse"></div>
                      </span>{" "}
                      your learning journey?
                    </p>
                  </div>
                  
                  {/* Enhanced badges */}
                  <div className="flex flex-wrap gap-4 lg:gap-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      <Badge className="relative bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-white border-0 px-6 py-4 text-lg font-bold rounded-2xl shadow-xl group-hover:scale-105 group-hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <Star className="w-6 h-6 animate-spin-slow" />
                          <span>Level {stats.currentLevel || 1}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      <Badge className="relative bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white border-0 px-6 py-4 text-lg font-bold rounded-2xl shadow-xl group-hover:scale-105 group-hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-6 h-6 animate-bounce" />
                          <span>Predicted: {stats.predictedGrade || "N/A"}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Progress Orb */}
                <div className="flex-shrink-0">
                  <div className="relative group">
                    {/* Multiple glow layers */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 to-fuchsia-500/40 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-1000 animate-pulse"></div>
                    <div className="absolute inset-2 bg-gradient-to-r from-violet-500/30 to-pink-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-1000 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    
                    {/* Main progress card */}
                    <div className="relative bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 overflow-hidden">
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 animate-gradient-shift"></div>
                      
                      <div className="relative p-8 lg:p-10 text-center">
                        {/* Progress icon with multiple layers */}
                        <div className="relative mx-auto mb-6">
                          <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-cyan-500/50 transition-all duration-700 relative overflow-hidden">
                            <Activity className="w-10 h-10 lg:w-12 lg:h-12 text-white animate-pulse relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                          </div>
                          {/* Rotating ring */}
                          <div className="absolute inset-0 w-20 h-20 lg:w-24 lg:h-24 mx-auto border-2 border-cyan-400/30 rounded-full animate-spin-slow"></div>
                        </div>
                        
                        {/* Progress text */}
                        <div className="space-y-2">
                          <p className="text-4xl lg:text-5xl font-black text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text animate-gradient-text">
                            {levelProgressPercentage.toFixed(0)}%
                          </p>
                          <p className="text-lg lg:text-xl font-bold text-slate-200">Level Progress</p>
                          <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-fuchsia-400 rounded-full mx-auto animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Shine overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse"></div>
              <div className="absolute top-6 right-8 w-1 h-1 bg-fuchsia-400/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-violet-400/60 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>

          {/* Ultra-Premium 3D Stats Grid */}
          <div className="relative mb-20">
            {/* Background glow for stats section */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl"></div>
            <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 transform-3d">
              {dashboardStats.map((stat, index) => (
                <StatCard key={stat.id} stat={stat} index={index} />
              ))}
            </div>
          </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-12 h-full">
              {/* Ultra-Premium Quick Actions */}
              <div className="animate-fade-in transform-3d relative" style={{ animationDelay: "300ms" }}>
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-fuchsia-500/5 rounded-3xl blur-3xl"></div>
                
                <div className="relative bg-gradient-to-br from-white/8 via-white/15 to-white/8 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 lg:p-10 overflow-hidden">
                  {/* Enhanced glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 pointer-events-none"></div>
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                  
                  <div className="relative flex items-center justify-between mb-10">
                    <div className="relative">
                      <h2 className="text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text animate-gradient-text">
                        Quick Actions
                      </h2>
                      <div className="absolute inset-0 text-3xl lg:text-4xl font-black text-cyan-400/15 blur-2xl animate-pulse">
                        Quick Actions
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/40 to-fuchsia-400/40 rounded-full blur-xl animate-pulse"></div>
                      <div className="relative p-4 bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/30 rounded-full backdrop-blur-xl border border-white/30 shadow-xl">
                        <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse animate-float-3d drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                  <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
                    {quickActions.map((action, index) => (
                      <QuickActionButton key={action.href} {...action} index={index} />
                    ))}
                  </div>
                </div>
              </div>

                            {/* Recent Homework */}
              <div className="animate-fade-in relative" style={{ animationDelay: "400ms" }}>
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl"></div>
                
                <div className="relative bg-gradient-to-br from-white/8 via-white/15 to-white/8 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 lg:p-10 overflow-hidden">
                  {/* Enhanced glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 pointer-events-none"></div>
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                  
                  <div className="relative flex items-center justify-between mb-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text animate-gradient-text">
                        Recent Homework
                      </h2>
                      <p className="text-lg text-slate-300 font-medium">Your latest assignments and progress</p>
                    </div>
                    <Link href="/homework">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                        <Button className="relative bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-xl border border-white/30 text-white hover:scale-105 transition-all duration-300 shadow-xl">
                          View All
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </Link>
                  </div>
                  <div className="space-y-6">
                    {loading ? (
                      <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                              <div className="h-5 bg-slate-600/50 rounded-lg w-3/4 mb-3"></div>
                              <div className="h-4 bg-slate-600/30 rounded-lg w-1/2 mb-4"></div>
                              <div className="h-10 bg-slate-600/20 rounded-lg w-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : homeworkWithDates.length > 0 ? (
                      homeworkWithDates.map((hw: any, index: number) => (
                        <HomeworkItem key={hw.id} hw={hw} index={index} />
                      ))
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-3xl blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-slate-800/30 to-slate-700/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl">
                          <div className="p-16 text-center">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 to-slate-500/20 rounded-full blur-2xl"></div>
                              <BookOpen className="relative h-20 w-20 text-slate-400 mx-auto" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No homework yet</h3>
                            <p className="text-lg text-slate-400 font-medium">Check back later for new assignments</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

                        {/* Enhanced Sidebar */}
            <div className="space-y-10 xl:sticky xl:top-8 h-fit">
              {/* AI Recommendations */}
              <div className="animate-fade-in relative" style={{ animationDelay: "500ms" }}>
                {/* Multiple glow layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl"></div>
                <div className="absolute inset-1 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 rounded-3xl blur-xl"></div>
                
                <div className="relative bg-gradient-to-br from-purple-500/95 via-fuchsia-500/95 to-pink-500/95 backdrop-blur-2xl rounded-3xl shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-700 overflow-hidden border border-white/20">
                  {/* Enhanced glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/15 pointer-events-none"></div>
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
                  
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 animate-gradient-shift"></div>
                  
                  {/* Enhanced floating particles */}
                  <div className="absolute top-4 right-6 w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute top-8 right-12 w-1 h-1 bg-white/50 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '2s' }}></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-center gap-4 mb-6">
                                              <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/30 rounded-2xl blur-lg"></div>
                          <div className="relative p-4 bg-gradient-to-r from-white/25 to-white/15 rounded-2xl backdrop-blur-xl border border-white/40 shadow-xl">
                            <Brain className="h-6 w-6 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      <h3 className="text-2xl font-black text-white drop-shadow-lg">
                        AI Recommendations
                      </h3>
                    </div>
                    
                    <div className="space-y-6">
                                              <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/15 rounded-2xl blur-sm"></div>
                          <div className="relative bg-white/15 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg overflow-hidden">
                            {/* Glass edge highlights */}
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                            <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
                          <p className="text-white/90 text-lg leading-relaxed font-medium">
                            {stats.weakTopics?.length > 0 ? (
                              <>
                                Focus on <span className="font-black text-yellow-300 drop-shadow-lg">{stats.weakTopics[0]}</span> to 
                                boost your grade to <span className="font-black text-green-300 drop-shadow-lg">A+</span>
                              </>
                            ) : (
                              "Start your personalized learning journey with AI-powered tutoring!"
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Link href="/lex/advanced">
                                                      <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/40 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                              <Button className="relative w-full bg-gradient-to-r from-white/25 to-white/35 backdrop-blur-xl border border-white/40 text-white font-bold text-lg py-4 rounded-2xl hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl overflow-hidden">
                                {/* Glass edge highlights */}
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                                <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/60 to-transparent"></div>
                                <Brain className="w-5 h-5 mr-3 relative z-10" />
                                <span className="relative z-10">Start AI Session</span>
                              </Button>
                            </div>
                        </Link>
                        <Link href="/chat">
                                                      <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                              <Button className="relative w-full bg-white/15 backdrop-blur-xl border border-white/30 text-white/90 font-semibold py-3 rounded-2xl hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-lg overflow-hidden">
                                {/* Glass edge highlights */}
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                                <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
                                <MessageCircle className="w-4 h-4 mr-2 relative z-10" />
                                <span className="relative z-10">Ask AI Question</span>
                              </Button>
                            </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </div>

                            {/* Enhanced Level Progress */}
              <div className="animate-fade-in relative" style={{ animationDelay: "600ms" }}>
                {/* Multiple glow layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-3xl blur-2xl"></div>
                <div className="absolute inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
                
                <div className="relative bg-gradient-to-br from-blue-500/95 via-cyan-500/95 to-blue-600/95 backdrop-blur-2xl rounded-3xl shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-700 overflow-hidden border border-white/20">
                  {/* Enhanced glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/15 pointer-events-none"></div>
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
                  
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 animate-gradient-shift"></div>
                  
                  {/* Enhanced floating elements */}
                  <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute bottom-6 left-8 w-1 h-1 bg-white/50 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1.5s' }}></div>
                  <div className="absolute top-1/2 right-4 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '3s' }}></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/20 rounded-2xl blur-lg"></div>
                          <div className="relative p-3 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl backdrop-blur-sm border border-white/30">
                            <Rocket className="h-6 w-6 text-white drop-shadow-lg" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-white drop-shadow-lg">
                          Level Progress
                        </h3>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/30 rounded-xl blur-lg"></div>
                        <div className="relative bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl">
                          <span className="text-white font-bold text-lg drop-shadow-lg">
                            Level {stats.currentLevel || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl blur-sm"></div>
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
                          <p className="text-white/90 text-base font-medium mb-3">
                            {progressToNextLevel} / 200 XP to next level
                            {xpNeededForNextLevel > 0 && (
                              <span className="text-yellow-300 font-bold ml-2">
                                ({xpNeededForNextLevel} XP needed)
                              </span>
                            )}
                          </p>
                          
                          {/* Enhanced progress bar */}
                          <div className="relative h-4 bg-slate-900/50 rounded-full overflow-hidden border border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20"></div>
                            <div 
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full transition-all duration-1000 shadow-lg"
                              style={{ width: `${levelProgressPercentage}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full"></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-sm text-white/80 font-medium mt-3">
                            <span>Current: {stats.xpTotal || 0} XP</span>
                            <span>Next: {nextLevelXP} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </div>

                            {/* Enhanced Study Insights */}
              <div className="animate-fade-in relative" style={{ animationDelay: "700ms" }}>
                {/* Multiple glow layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-3xl blur-2xl"></div>
                <div className="absolute inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl"></div>
                
                <div className="relative bg-gradient-to-br from-green-500/95 via-emerald-500/95 to-teal-500/95 backdrop-blur-2xl rounded-3xl shadow-2xl hover:shadow-green-500/30 hover:scale-[1.02] transition-all duration-700 overflow-hidden border border-white/20">
                  {/* Enhanced glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/15 pointer-events-none"></div>
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
                  
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 animate-gradient-shift"></div>
                  
                  {/* Enhanced floating elements */}
                  <div className="absolute top-4 left-6 w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute bottom-8 right-6 w-1 h-1 bg-white/50 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute top-1/3 left-4 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/20 rounded-2xl blur-lg"></div>
                        <div className="relative p-3 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl backdrop-blur-sm border border-white/30">
                          <Globe className="h-6 w-6 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-white drop-shadow-lg">
                        Study Insights
                      </h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 rounded-2xl blur-sm group-hover:blur-lg transition-all duration-300"></div>
                        <div className="relative flex justify-between items-center p-5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 group-hover:bg-white/20 transition-all duration-300">
                          <span className="text-white/90 font-medium text-lg">This Week</span>
                          <span className="text-yellow-300 font-black text-lg drop-shadow-lg">12.5 hours</span>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 rounded-2xl blur-sm group-hover:blur-lg transition-all duration-300"></div>
                        <div className="relative flex justify-between items-center p-5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 group-hover:bg-white/20 transition-all duration-300">
                          <span className="text-white/90 font-medium text-lg">Avg. Session</span>
                          <span className="text-cyan-300 font-black text-lg drop-shadow-lg">45 min</span>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 rounded-2xl blur-sm group-hover:blur-lg transition-all duration-300"></div>
                        <div className="relative flex justify-between items-center p-5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 group-hover:bg-white/20 transition-all duration-300">
                          <span className="text-white/90 font-medium text-lg">Best Subject</span>
                          <span className="text-fuchsia-300 font-black text-lg drop-shadow-lg">Physics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}