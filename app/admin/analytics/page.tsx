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
      premium: 423,
      enterprise: 89,
    },
  },
}

export default function AnalyticsPage() {
  return (
    <div className="p-4 lg:p-8 lg:pt-20">
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
                <p className="text-sm text-muted-foreground">Daily Active Users</p>
                <p className="text-2xl font-bold">{analyticsData.engagement.dailyActiveUsers}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-sm text-green-400">+12.5% vs yesterday</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

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
              <Clock className="w-8 h-8 text-purple-400" />
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
              <BookOpen className="w-8 h-8 text-green-400" />
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
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-sm text-green-400">+34.7% vs last month</span>
                </div>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>User Growth Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analyticsData.userGrowth.map((data, index) => (
                  <div key={data.month} className="flex flex-col items-center flex-1">
                    <div className="flex space-x-1 mb-2">
                      <div
                        className="w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm"
                        style={{ height: `${(data.students / 1300) * 200}px` }}
                        title={`Students: ${data.students}`}
                      />
                      <div
                        className="w-6 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm"
                        style={{ height: `${(data.teachers / 50) * 200}px` }}
                        title={`Teachers: ${data.teachers}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm">Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-sm">Teachers</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-400" />
                <span>Subject Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.performance.topSubjects.map((subject) => (
                <div key={subject.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">{subject.students} students enrolled</p>
                    </div>
                    <Badge variant="outline">{subject.completion}% completion</Badge>
                  </div>
                  <Progress value={subject.completion} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          {/* Retention Metrics */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
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

          {/* Revenue Breakdown */}
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
                <div className="flex items-center justify-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-sm text-green-400">+{analyticsData.revenue.growth}% growth</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Basic Plan</span>
                  <span className="font-semibold">{analyticsData.revenue.subscriptions.basic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Premium Plan</span>
                  <span className="font-semibold">{analyticsData.revenue.subscriptions.premium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Enterprise Plan</span>
                  <span className="font-semibold">{analyticsData.revenue.subscriptions.enterprise}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span>Learning Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{analyticsData.performance.avgCompletionRate}%</p>
                <p className="text-sm text-muted-foreground">Avg Completion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{analyticsData.performance.avgAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                <span>Today's Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Signups:</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lessons Started:</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">AI Questions:</span>
                <span className="font-semibold">342</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Peak Concurrent:</span>
                <span className="font-semibold">234 users</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
