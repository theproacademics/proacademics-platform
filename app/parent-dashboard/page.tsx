"use client"

import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  Download,
  Calendar,
  MessageCircle,
  Award,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

// Mock data for parent dashboard
const studentData = {
  name: "Alex Johnson",
  currentLevel: 12,
  totalXP: 2450,
  predictedGrade: "A*",
  currentWorkingAverage: 87.5,
  weeklyEngagement: 85,
  studyStreak: 7,
}

const parentStats = [
  {
    id: "grade",
    title: "Predicted Grade",
    value: studentData.predictedGrade,
    icon: <Target className="w-6 h-6" />,
    color: "green" as const,
    trend: { value: 5.2, isPositive: true },
  },
  {
    id: "cwa",
    title: "Current Working Average",
    value: `${studentData.currentWorkingAverage}%`,
    icon: <TrendingUp className="w-6 h-6" />,
    color: "blue" as const,
    trend: { value: 3.1, isPositive: true },
  },
  {
    id: "engagement",
    title: "Weekly Engagement",
    value: `${studentData.weeklyEngagement}%`,
    icon: <BarChart3 className="w-6 h-6" />,
    color: "purple" as const,
    trend: { value: 12.5, isPositive: true },
  },
  {
    id: "streak",
    title: "Study Streak",
    value: `${studentData.studyStreak} days`,
    icon: <Calendar className="w-6 h-6" />,
    color: "orange" as const,
    trend: { value: 16.7, isPositive: true },
  },
]

const homeworkSummary = [
  {
    subject: "Mathematics",
    completed: 8,
    total: 10,
    avgScore: 92,
    overdue: 0,
  },
  {
    subject: "Physics",
    completed: 6,
    total: 8,
    avgScore: 88,
    overdue: 1,
  },
  {
    subject: "Chemistry",
    completed: 5,
    total: 7,
    avgScore: 85,
    overdue: 0,
  },
  {
    subject: "Biology",
    completed: 4,
    total: 5,
    avgScore: 90,
    overdue: 0,
  },
]

const weeklyActivity = [
  { activity: "Lex AI Sessions", count: 12, time: "3h 45m" },
  { activity: "Lessons Watched", count: 8, time: "6h 20m" },
  { activity: "Homework Completed", count: 6, time: "4h 15m" },
  { activity: "Quiz Attempts", count: 15, time: "2h 30m" },
]

const recentAchievements = [
  {
    title: "Math Master",
    description: "Completed advanced calculus module",
    date: "2 days ago",
    xp: 100,
  },
  {
    title: "Consistent Learner",
    description: "7-day study streak achieved",
    date: "1 week ago",
    xp: 75,
  },
  {
    title: "Quiz Champion",
    description: "Perfect score on physics quiz",
    date: "1 week ago",
    xp: 50,
  },
]

export default function ParentDashboardPage() {
  const generateReport = () => {
    // This would trigger the AI report generation
    console.log("Generating termly report...")
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1e3a8a 40%, #581c87 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Extended Background Coverage to prevent white background on over-scroll */}
      <div 
        className="fixed pointer-events-none z-0"
        style={{ 
          top: '-100vh', 
          left: '-50vw', 
          right: '-50vw', 
          bottom: '-100vh',
          background: 'linear-gradient(135deg, #111827 0%, #1e3a8a 40%, #581c87 100%)'
        }}
      />
      
      <Navigation />

      <main className="lg:ml-72 min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title={`${studentData.name}'s Progress`}
            description="Monitor your child's academic journey and achievements"
            actions={
              <Button onClick={generateReport} className="bg-gradient-to-r from-blue-500 to-purple-600 button-hover">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            }
          />

          {/* Stats Grid */}
          <div className="mb-8">
            <StatsGrid stats={parentStats} columns={4} animated />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Homework Summary */}
            <div className="lg:col-span-2">
              <AnimatedCard delay={200}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                    Homework Completion Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {homeworkSummary.map((subject, index) => (
                    <div
                      key={subject.subject}
                      className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">{subject.subject}</h4>
                        <div className="flex items-center space-x-2">
                          {subject.overdue > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {subject.overdue} overdue
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Up to date
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Completed</div>
                          <div className="font-medium text-white">
                            {subject.completed}/{subject.total}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Score</div>
                          <div className="font-medium text-green-400">{subject.avgScore}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Progress</div>
                          <Progress value={(subject.completed / subject.total) * 100} className="h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </AnimatedCard>
            </div>

            {/* Weekly Activity */}
            <AnimatedCard delay={300}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-400" />
                  Weekly Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyActivity.map((activity, index) => (
                  <div
                    key={activity.activity}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div>
                      <div className="font-medium text-white text-sm">{activity.activity}</div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-400">{activity.count}</div>
                      <div className="text-xs text-muted-foreground">times</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Recent Achievements */}
          <AnimatedCard delay={400} className="mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-400" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentAchievements.map((achievement, index) => (
                  <div
                    key={achievement.title}
                    className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
                    style={{ animationDelay: `${(index + 5) * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">{achievement.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.xp} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                    <p className="text-xs text-yellow-400">{achievement.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Detailed Reports */}
          <AnimatedCard delay={500}>
            <CardHeader>
              <CardTitle className="text-white">Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="glass-card border-white/20">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="subjects">Subject Breakdown</TabsTrigger>
                  <TabsTrigger value="trends">Performance Trends</TabsTrigger>
                  <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Total Study Time</h4>
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">16h 50m</div>
                      <div className="text-sm text-muted-foreground">This week</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Lessons Completed</h4>
                        <BookOpen className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">23</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">AI Interactions</h4>
                        <MessageCircle className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">47</div>
                      <div className="text-sm text-muted-foreground">Lex sessions</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="subjects" className="mt-6">
                  <div className="space-y-4">
                    {homeworkSummary.map((subject, index) => (
                      <div key={subject.subject} className="p-4 rounded-lg bg-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">{subject.subject}</h4>
                          <Badge
                            variant="outline"
                            className={
                              subject.avgScore >= 90
                                ? "border-green-500 text-green-400"
                                : subject.avgScore >= 80
                                  ? "border-blue-500 text-blue-400"
                                  : "border-yellow-500 text-yellow-400"
                            }
                          >
                            {subject.avgScore}% avg
                          </Badge>
                        </div>
                        <Progress value={subject.avgScore} className="h-2" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="trends" className="mt-6">
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">Performance trend charts would be displayed here</p>
                  </div>
                </TabsContent>
                <TabsContent value="recommendations" className="mt-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-medium text-blue-400 mb-2">Focus Area: Physics</h4>
                      <p className="text-sm text-muted-foreground">
                        Alex is performing well overall but could benefit from additional practice in wave motion
                        concepts. Recommend 2-3 extra sessions this week.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <h4 className="font-medium text-green-400 mb-2">Strength: Mathematics</h4>
                      <p className="text-sm text-muted-foreground">
                        Excellent progress in calculus. Alex is ready for more advanced topics and could benefit from
                        challenge problems.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <h4 className="font-medium text-yellow-400 mb-2">Study Habits</h4>
                      <p className="text-sm text-muted-foreground">
                        Consistent daily study pattern observed. Consider scheduling breaks to prevent burnout and
                        maintain long-term motivation.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </AnimatedCard>
        </ResponsiveContainer>
      </main>
    </div>
  )
}
