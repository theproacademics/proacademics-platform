"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  MessageSquare,
  Clock,
  Target,
  Zap,
  Calendar,
  Activity,
} from "lucide-react"

// Mock analytics data
const analyticsData = {
  userGrowth: [
    { month: "Jan", students: 850, teachers: 35 },
    { month: "Feb", students: 920, teachers: 38 },
    { month: "Mar", students: 1050, teachers: 42 },
    { month: "Apr", students: 1180, teachers: 45 },
    { month: "May", students: 1247, teachers: 45 },
  ],
  engagement: {
    dailyActiveUsers: 892,
    avgSessionTime: "24m 32s",
    lessonsCompleted: 15678,
    aiInteractions: 8934,
    weeklyRetention: 78.5,
    monthlyRetention: 65.2,
  },
  performance: {
    avgCompletionRate: 87.3,
    avgAccuracy: 82.1,
    topSubjects: [
      { name: "Mathematics", students: 456, completion: 89 },
      { name: "Physics", students: 342, completion: 85 },
      { name: "Chemistry", students: 298, completion: 91 },
      { name: "Biology", students: 234, completion: 88 },
    ],
  },
  revenue: {
    monthly: 45670,
    growth: 18.5,
    subscriptions: {
      basic: 567,
      premium: 234,
      enterprise: 89,
    },
  },
}

export default function AnalyticsPage() {
  return (
    <div className="absolute inset-0 z-10 overflow-y-auto">
      <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-14 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into platform performance and user behavior</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card futuristic-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Session Time</p>
                  <p className="text-2xl font-bold">{analyticsData.engagement.avgSessionTime}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">+8.2% vs last week</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card futuristic-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                  <p className="text-2xl font-bold">{analyticsData.engagement.lessonsCompleted.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">+25.3% vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card futuristic-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Interactions</p>
                  <p className="text-2xl font-bold">{analyticsData.engagement.aiInteractions.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
                    <span className="text-sm text-purple-400">+34.7% vs last month</span>
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
                  <p className="text-sm text-muted-foreground">Daily Active Users</p>
                  <p className="text-2xl font-bold">{analyticsData.engagement.dailyActiveUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-orange-400 mr-1" />
                    <span className="text-sm text-orange-400">+12.1% vs last week</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Growth Chart */}
          <div className="lg:col-span-2">
            <Card className="glass-card futuristic-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span>User Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Students</span>
                    <span className="text-blue-400 font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Teachers</span>
                    <span className="text-purple-400 font-medium">45</span>
                  </div>
                  
                  {/* Simple Bar Chart */}
                  <div className="space-y-3">
                    {analyticsData.userGrowth.map((data, index) => (
                      <div key={data.month} className="flex items-center space-x-4">
                        <div className="w-8 text-sm text-muted-foreground">{data.month}</div>
                        <div className="flex-1 flex items-center space-x-2">
                          <div className="flex-1 bg-slate-700/50 rounded-full h-2 relative overflow-hidden">
                            <div 
                              className="absolute left-0 top-0 h-full bg-blue-400 rounded-full"
                              style={{ width: `${(data.students / 1300) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-blue-400 w-12 text-right">{data.students}</span>
                        </div>
                        <div className="flex-1 flex items-center space-x-2">
                          <div className="flex-1 bg-slate-700/50 rounded-full h-2 relative overflow-hidden">
                            <div 
                              className="absolute left-0 top-0 h-full bg-purple-400 rounded-full"
                              style={{ width: `${(data.teachers / 50) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-purple-400 w-8 text-right">{data.teachers}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Retention */}
          <div className="space-y-6">
            <Card className="glass-card futuristic-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span>User Retention</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weekly Retention</span>
                    <span className="font-semibold">{analyticsData.engagement.weeklyRetention}%</span>
                  </div>
                  <Progress value={analyticsData.engagement.weeklyRetention} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Monthly Retention</span>
                    <span className="font-semibold">{analyticsData.engagement.monthlyRetention}%</span>
                  </div>
                  <Progress value={analyticsData.engagement.monthlyRetention} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Revenue Analytics */}
            <Card className="glass-card futuristic-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span>Revenue Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">${analyticsData.revenue.monthly.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">+{analyticsData.revenue.growth}% growth</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Basic Plan</span>
                    <span className="font-semibold">{analyticsData.revenue.subscriptions.basic}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Premium Plan</span>
                    <span className="font-semibold">{analyticsData.revenue.subscriptions.premium}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Enterprise Plan</span>
                    <span className="font-semibold">{analyticsData.revenue.subscriptions.enterprise}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Avg Completion Rate</span>
                  <span className="font-semibold">{analyticsData.performance.avgCompletionRate}%</span>
                </div>
                <Progress value={analyticsData.performance.avgCompletionRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Avg Accuracy</span>
                  <span className="font-semibold">{analyticsData.performance.avgAccuracy}%</span>
                </div>
                <Progress value={analyticsData.performance.avgAccuracy} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                <span>Top Subjects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.performance.topSubjects.map((subject, index) => (
                <div key={subject.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">{subject.students} students</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-500">
                    {subject.completion}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Performance */}
        <div className="mt-8">
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span>System Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400 mb-1">99.9%</div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400 mb-1">1.2s</div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400 mb-1">234</div>
                  <p className="text-sm text-muted-foreground">Peak Concurrent Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}