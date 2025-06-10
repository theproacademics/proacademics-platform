"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  GraduationCap,
  BookOpen,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  DollarSign,
  Activity,
  RefreshCw,
} from "lucide-react"

// Types for our data
interface AdminStats {
  totalStudents: number
  activeStudents: number
  totalTeachers: number
  totalLessons: number
  aiInteractions: number
  systemHealth: number
  revenue: number
  avgSessionTime: string
  growth: {
    students: number
    activeStudents: number
    aiInteractions: number
    revenue: number
  }
  systemUsage: {
    cpu: number
    memory: number
    storage: number
  }
  services: {
    api: string
    database: string
    ai: string
  }
}

interface RecentActivity {
  id: number
  type: string
  user?: string
  lesson?: string
  query?: string
  message?: string
  time: string
}

interface TopPerformer {
  name: string
  xp: number
  level: number
  streak: number
  weeklyGrowth: number
  completedLessons: number
}

export default function AdminDashboard() {
  return <AdminDashboardContent />
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch admin statistics
  const fetchStats = async () => {
    try {
      console.log('Fetching admin stats...', new Date().toISOString())
      const response = await fetch(`/api/admin/stats?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Admin stats received:', data)
        setStats(data)
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    }
  }

  // Fetch recent activity
  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/admin/activity?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data)
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    }
  }

  // Fetch top performers
  const fetchTopPerformers = async () => {
    try {
      const response = await fetch(`/api/admin/top-performers?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTopPerformers(data)
      }
    } catch (error) {
      console.error('Failed to fetch top performers:', error)
    }
  }

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchStats(),
      fetchActivity(),
      fetchTopPerformers()
    ])
    setLoading(false)
    setLastUpdated(new Date())
  }

  // Refresh data
  const refreshData = () => {
    fetchAllData()
  }

  // Initial load and auto-refresh
  useEffect(() => {
    fetchAllData()
    
    // Auto-refresh every 5 seconds for more visible changes
    const interval = setInterval(fetchAllData, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const getServiceStatus = (service: string) => {
    if (!stats) return { 
      color: 'gray', 
      text: 'Unknown', 
      bgColor: 'bg-gray-500/10', 
      borderColor: 'border-gray-500/20',
      icon: CheckCircle
    }
    
    switch (stats.services[service as keyof typeof stats.services]) {
      case 'operational':
        return { 
          color: 'green', 
          text: 'Operational', 
          bgColor: 'bg-green-500/10', 
          borderColor: 'border-green-500/20',
          icon: CheckCircle
        }
      case 'healthy':
        return { 
          color: 'green', 
          text: 'Healthy', 
          bgColor: 'bg-green-500/10', 
          borderColor: 'border-green-500/20',
          icon: CheckCircle
        }
      case 'high_load':
        return { 
          color: 'yellow', 
          text: 'High Load', 
          bgColor: 'bg-yellow-500/10', 
          borderColor: 'border-yellow-500/20',
          icon: AlertTriangle
        }
      case 'warning':
        return { 
          color: 'yellow', 
          text: 'Warning', 
          bgColor: 'bg-yellow-500/10', 
          borderColor: 'border-yellow-500/20',
          icon: AlertTriangle
        }
      default:
        return { 
          color: 'gray', 
          text: 'Unknown', 
          bgColor: 'bg-gray-500/10', 
          borderColor: 'border-gray-500/20',
          icon: CheckCircle
        }
    }
  }

  return (
    <div className="p-4 lg:p-8 lg:pt-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with ProAcademics today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button 
              onClick={refreshData} 
              disabled={loading}
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                {loading || !stats ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <p className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                )}
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  {loading || !stats ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className="text-sm text-green-400">+{stats.growth.students}% from last month</span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                {loading || !stats ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <p className="text-2xl font-bold">{stats.activeStudents.toLocaleString()}</p>
                )}
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  {loading || !stats ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className="text-sm text-green-400">+{stats.growth.activeStudents}% from yesterday</span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Interactions</p>
                {loading || !stats ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <p className="text-2xl font-bold">{stats.aiInteractions.toLocaleString()}</p>
                )}
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
                  {loading || !stats ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className="text-sm text-purple-400">+{stats.growth.aiInteractions}% from last week</span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                {loading || !stats ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <p className="text-2xl font-bold">${stats.revenue.toLocaleString()}</p>
                )}
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-orange-400 mr-1" />
                  {loading || !stats ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className="text-sm text-orange-400">+{stats.growth.revenue}% from last month</span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* System Health */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>System Health</span>
                {loading || !stats ? (
                  <Skeleton className="h-6 w-20 ml-auto" />
                ) : (
                  <Badge variant="outline" className="ml-auto text-green-400 border-green-500">
                    {stats.systemHealth}% Uptime
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['api', 'database', 'ai'].map((service) => {
                  const status = getServiceStatus(service)
                  const IconComponent = status.icon
                  return (
                    <div key={service} className={`text-center p-4 rounded-lg ${status.bgColor} border ${status.borderColor}`}>
                      {loading || !stats ? (
                        <>
                          <Skeleton className="w-8 h-8 mx-auto mb-2 rounded-full" />
                          <Skeleton className="h-4 w-16 mx-auto mb-1" />
                          <Skeleton className="h-3 w-12 mx-auto" />
                        </>
                      ) : (
                        <>
                          <IconComponent className={`w-8 h-8 mx-auto mb-2 text-${status.color}-400`} />
                          <p className="font-semibold capitalize">{service === 'ai' ? 'AI Services' : service}</p>
                          <p className={`text-sm text-${status.color}-400`}>{status.text}</p>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3">
                {['cpu', 'memory', 'storage'].map((resource) => (
                  <div key={resource}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{resource} Usage</span>
                      {loading || !stats ? (
                        <Skeleton className="h-4 w-8" />
                      ) : (
                        <span>{stats.systemUsage[resource as keyof typeof stats.systemUsage]}%</span>
                      )}
                    </div>
                    {loading || !stats ? (
                      <Skeleton className="h-2 w-full" />
                    ) : (
                      <Progress value={stats.systemUsage[resource as keyof typeof stats.systemUsage]} className="h-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        {activity.type === "student_signup" && (
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> signed up as a new student
                          </p>
                        )}
                        {activity.type === "lesson_completed" && (
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> completed{" "}
                            <span className="text-blue-400">{activity.lesson}</span>
                          </p>
                        )}
                        {activity.type === "ai_interaction" && (
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> asked Lex about{" "}
                            <span className="text-purple-400">{activity.query}</span>
                          </p>
                        )}
                        {activity.type === "teacher_added" && (
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> was added as a teacher
                          </p>
                        )}
                        {activity.type === "system_alert" && (
                          <p className="text-sm text-yellow-400">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            {activity.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Add New Student
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <GraduationCap className="w-4 h-4 mr-2" />
                Add New Teacher
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Create New Lesson
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                View AI Logs
              </Button>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Top Performers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))
              ) : (
                topPerformers.map((student, index) => (
                  <div key={student.name} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{student.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Level {student.level}</span>
                        <span>•</span>
                        <span>{student.xp} XP</span>
                        <span>•</span>
                        <span>{student.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>System Alerts</span>
                <Badge variant="outline" className="ml-auto">
                  2
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">High AI Usage</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI service usage is 85% above normal. Consider scaling resources.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Backup Completed</span>
                </div>
                <p className="text-xs text-muted-foreground">Daily backup completed successfully at 3:00 AM.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
