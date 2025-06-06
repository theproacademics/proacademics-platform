"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"

export default function AdminDashboard() {
  // Directly render the dashboard content without protection
  return <AdminDashboardContent />
}

function AdminDashboardContent() {
  // Mock data for dashboard
  const stats = {
    totalStudents: 1247,
    activeStudents: 892,
    totalTeachers: 45,
    totalLessons: 324,
    aiInteractions: 15678,
    systemHealth: 98.5,
    revenue: 45670,
    avgSessionTime: "24m",
  }

  const recentActivity = [
    { id: 1, type: "student_signup", user: "Alex Johnson", time: "2 minutes ago" },
    { id: 2, type: "lesson_completed", user: "Sarah Chen", lesson: "Calculus Basics", time: "5 minutes ago" },
    { id: 3, type: "ai_interaction", user: "Mike Rodriguez", query: "Quadratic equations", time: "8 minutes ago" },
    { id: 4, type: "teacher_added", user: "Dr. Emily Watson", time: "15 minutes ago" },
    { id: 5, type: "system_alert", message: "High server load detected", time: "1 hour ago" },
  ]

  const topPerformers = [
    { name: "Sarah Chen", xp: 4250, level: 18, streak: 15 },
    { name: "Alex Johnson", xp: 3890, level: 16, streak: 12 },
    { name: "Emma Rodriguez", xp: 3200, level: 14, streak: 8 },
    { name: "Michael Kim", xp: 2890, level: 13, streak: 5 },
  ]

  return (
    <div className="p-4 lg:p-8 lg:pt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with ProAcademics today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-sm text-green-400">+12% from last month</span>
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
                <p className="text-2xl font-bold">{stats.activeStudents.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-sm text-green-400">+8% from yesterday</span>
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
                <p className="text-2xl font-bold">{stats.aiInteractions.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
                  <span className="text-sm text-purple-400">+25% from last week</span>
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
                <p className="text-2xl font-bold">${stats.revenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-orange-400 mr-1" />
                  <span className="text-sm text-orange-400">+18% from last month</span>
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
        {/* System Health & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* System Health */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>System Health</span>
                <Badge variant="outline" className="ml-auto text-green-400 border-green-500">
                  {stats.systemHealth}% Uptime
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="font-semibold">API Services</p>
                  <p className="text-sm text-green-400">Operational</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="font-semibold">Database</p>
                  <p className="text-sm text-green-400">Healthy</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                  <p className="font-semibold">AI Services</p>
                  <p className="text-sm text-yellow-400">High Load</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage Usage</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
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
                {recentActivity.map((activity) => (
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
                ))}
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
              {topPerformers.map((student, index) => (
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
              ))}
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
