"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Star, 
  Calendar, 
  Zap, 
  Brain,
  MessageCircle,
  PlayCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Timer,
  Flame,
  ChevronRight,
  Plus,
  BarChart3,
  Activity,
  Globe,
  Rocket
} from "lucide-react"
import Link from "next/link"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="space-y-8 p-6">
    <div className="animate-pulse">
      <div className="h-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"></div>
        ))}
      </div>
    </div>
  </div>
)

// Glass Background
const GlassBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
    </div>
  )
}

// Glass Card Component
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ${className}`}>
    {children}
  </div>
)

// Stat Card
const StatCard = ({ stat, index }: { stat: any; index: number }) => {
  const iconColors = {
    blue: "bg-blue-500/20 text-blue-400",
    orange: "bg-orange-500/20 text-orange-400", 
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400"
  }

  return (
    <GlassCard className="p-6 hover:bg-white/10 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconColors[stat.color as keyof typeof iconColors]} flex items-center justify-center`}>
          {stat.icon}
        </div>
        {stat.trend && (
          <div className="flex items-center text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{stat.trend.value}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-white">
          {stat.value}
        </p>
        <p className="text-sm text-slate-400">
          {stat.title}
        </p>
      </div>
    </GlassCard>
  )
}

// Homework Item
const HomeworkItem = ({ hw, index }: { hw: any; index: number }) => {
  const isOverdue = hw.status === "overdue"
  const isCompleted = hw.status === "completed"
  
  const statusStyles = {
    completed: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
    overdue: "bg-red-500/20 border-red-500/30 text-red-400", 
    in_progress: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    not_started: "bg-slate-500/20 border-slate-500/30 text-slate-400"
  }

  return (
    <GlassCard className="p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'} flex items-center justify-center`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">
              {hw.title || "Assignment"}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : "No due date"}
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4" />
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
            <span className="text-white">{hw.progress}%</span>
          </div>
          <Progress value={hw.progress} className="h-2" />
        </div>
      )}
      
      <Button className="w-full bg-blue-600/80 hover:bg-blue-600 text-white border-0">
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
    </GlassCard>
  )
}

// Quick Action Button
const QuickActionButton = ({ href, icon: Icon, title, description, color }: any) => {
  const colorStyles = {
    blue: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-400",
    green: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20 text-green-400",
    purple: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20 text-orange-400"
  }

  return (
    <Link href={href}>
      <div className={`${colorStyles[color as keyof typeof colorStyles]} border backdrop-blur-xl rounded-xl p-6 h-32 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-105 group`}>
        <div className="w-10 h-10 flex items-center justify-center mb-3">
          <Icon className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <h3 className="font-semibold text-sm mb-1">
          {title}
        </h3>
        <p className="text-xs opacity-70">
          {description}
        </p>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userStats, setUserStats] = useState<any>(null)
  const [homework, setHomework] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dataReady, setDataReady] = useState(false)
  const { showPreloader, mounted } = usePreloader({ 
    delay: 1200, 
    dependencies: [session, userStats, dataReady],
    waitForImages: true,
    waitForFonts: true
  })

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
        xpTotal: userData.xp || userData.xpTotal || 0,
        currentLevel: userData.level || userData.currentLevel || 1,
        studyStreak: userData.studyStreak || userData.streak || 0,
        currentWorkingAverage: userData.currentWorkingAverage || 0,
        predictedGrade: userData.predictedGrade || "",
        weakTopics: userData.weakTopics || [],
        strongTopics: userData.strongTopics || [],
        recentTopics: userData.recentTopics || [],
        weeklyHours: userData.weeklyHours || 0,
        avgSessionTime: userData.avgSessionTime || 0
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
      // Mark data as ready after a short delay to ensure UI is rendered
      setTimeout(() => setDataReady(true), 100)
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />
  }

  // Show preloader
  if (showPreloader) {
    return <Preloader isVisible={showPreloader} colorScheme="default" loadingText="Initializing your learning dashboard" />
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 relative">
        <GlassBackground />
        <Navigation />
        <main className="lg:ml-[262px] min-h-screen relative z-10">
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
      trend: stats.xpTotal > 0 ? { value: 15, isPositive: true } : null
    },
    {
      id: "streak",
      title: "Study Streak", 
      value: `${stats.studyStreak || 0} days`,
      icon: <Flame className="w-6 h-6" />,
      color: "orange",
      trend: stats.studyStreak > 0 ? { value: 12, isPositive: true } : null
    },
    {
      id: "average",
      title: "Average Score",
      value: `${(stats.currentWorkingAverage || 0).toFixed(1)}%`,
      icon: <BarChart3 className="w-6 h-6" />,
      color: "green", 
      trend: stats.currentWorkingAverage > 0 ? { value: 8, isPositive: true } : null
    },
    {
      id: "level",
      title: "Current Level",
      value: stats.currentLevel || 1,
      icon: <GraduationCap className="w-6 h-6" />,
      color: "purple",
      trend: stats.currentLevel > 1 ? { value: 25, isPositive: true } : null
    }
  ]

  const quickActions = [
    {
      href: "/lex",
      icon: Brain,
      title: "Lex AI Tutor",
      description: "Personalized learning",
      color: "blue"
    },
    {
      href: "/homework", 
      icon: BookOpen,
      title: "Homework",
      description: "View assignments",
      color: "green"
    },
    {
      href: "/lessons",
      icon: Calendar,
      title: "Live Lessons", 
      description: "Join classes",
      color: "purple"
    },
    {
      href: "/leaderboard",
      icon: Trophy,
      title: "Leaderboard",
      description: "See rankings",
      color: "orange"
    }
  ]

  const homeworkWithDates = homework.map(hw => ({
    ...hw,
    dueDate: hw.dueDate ? new Date(hw.dueDate) : null
  }))

  return (
    <div className="min-h-screen bg-slate-950 relative">
      <GlassBackground />
      <Navigation />
      
      <main className="lg:ml-[268px] min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Header Section */}
          <GlassCard className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              {/* Welcome Content */}
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  Welcome back, {user.name}! 👋
                </h1>
                <p className="text-lg text-slate-300 mb-6">
                  Ready to continue your learning journey?
                </p>
                
                {/* Dynamic badges */}
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-2">
                    <Star className="w-4 h-4 mr-2" />
                    Level {stats.currentLevel || 1}
                  </Badge>
                  
                  {stats.predictedGrade && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-2">
                      <Trophy className="w-4 h-4 mr-2" />
                      Predicted: {stats.predictedGrade}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Progress Card */}
              <div className="flex-shrink-0">
                <GlassCard className="p-6 text-center w-48">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {levelProgressPercentage.toFixed(0)}%
                  </p>
                  <p className="text-sm text-slate-300">Level Progress</p>
                </GlassCard>
              </div>
            </div>
          </GlassCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => (
              <StatCard key={stat.id} stat={stat} index={index} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Quick Actions */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <QuickActionButton key={action.href} {...action} />
                  ))}
                </div>
              </GlassCard>

              {/* Recent Homework */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Recent Homework</h2>
                  <Link href="/homework">
                    <Button className="bg-blue-600/80 hover:bg-blue-600 text-white border-0">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-white/5 rounded-xl p-6">
                            <div className="h-4 bg-slate-600/50 rounded w-3/4 mb-3"></div>
                            <div className="h-3 bg-slate-600/30 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-slate-600/20 rounded w-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : homeworkWithDates.length > 0 ? (
                    homeworkWithDates.map((hw: any, index: number) => (
                      <HomeworkItem key={hw.id || index} hw={hw} index={index} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No homework yet</h3>
                      <p className="text-slate-400">Check back later for new assignments</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* AI Recommendations */}
              <GlassCard className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
                </div>
                
                <p className="text-slate-200 mb-6">
                  {stats.weakTopics?.length > 0 ? (
                    <>
                      Focus on <span className="font-semibold text-yellow-400">{stats.weakTopics[0]}</span> to 
                      boost your grade to <span className="font-semibold text-green-400">A+</span>
                    </>
                  ) : (
                    "Start your personalized learning journey with AI-powered tutoring!"
                  )}
                </p>
                
                <div className="flex flex-col gap-4">
                  <Link href="/lex/advanced">
                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20">
                      <Brain className="w-4 h-4 mr-2" />
                      Start AI Session
                    </Button>
                  </Link>
                  <Link href="/chat">
                    <Button className="w-full bg-white/5 hover:bg-white/10 text-slate-200 border-white/20">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask AI Question
                    </Button>
                  </Link>
                </div>
              </GlassCard>

              {/* Level Progress */}
              <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Level Progress</h3>
                  </div>
                  <Badge className="bg-white/10 text-white border-white/20">
                    Level {stats.currentLevel || 1}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <p className="text-slate-200 text-sm">
                    {progressToNextLevel} / 200 XP to next level
                    {xpNeededForNextLevel > 0 && (
                      <span className="text-yellow-400 block">
                        ({xpNeededForNextLevel} XP needed)
                      </span>
                    )}
                  </p>
                  
                  <div className="space-y-2">
                    <Progress value={levelProgressPercentage} className="h-3" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Current: {stats.xpTotal || 0} XP</span>
                      <span>Next: {nextLevelXP} XP</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Study Insights */}
              <GlassCard className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Study Insights</h3>
                </div>
                
                <div className="space-y-4">
                  {stats.weeklyHours ? (
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-slate-200">This Week</span>
                      <span className="text-yellow-400 font-semibold">{stats.weeklyHours} hours</span>
                    </div>
                  ) : null}
                  
                  {stats.avgSessionTime ? (
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-slate-200">Avg. Session</span>
                      <span className="text-cyan-400 font-semibold">{stats.avgSessionTime} min</span>
                    </div>
                  ) : null}
                  
                  {stats.strongTopics?.length > 0 ? (
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-slate-200">Best Subject</span>
                      <span className="text-purple-400 font-semibold">{stats.strongTopics[0]}</span>
                    </div>
                  ) : null}
                  
                  {(!stats.weeklyHours && !stats.avgSessionTime && !stats.strongTopics?.length) && (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No study data available yet</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}