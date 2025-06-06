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
  Target,
  Calendar,
  Clock,
  BookOpen,
  Zap,
  Trophy,
  Star,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"

// Mock data
const progressStats = [
  {
    id: "overall",
    title: "Overall Progress",
    value: "87%",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "green" as const,
    trend: { value: 12.5, isPositive: true },
  },
  {
    id: "streak",
    title: "Study Streak",
    value: "7 days",
    icon: <Calendar className="w-6 h-6" />,
    color: "orange" as const,
    trend: { value: 16.7, isPositive: true },
  },
  {
    id: "time",
    title: "Study Time",
    value: "24h 32m",
    icon: <Clock className="w-6 h-6" />,
    color: "blue" as const,
    trend: { value: 8.3, isPositive: true },
  },
  {
    id: "accuracy",
    title: "Avg Accuracy",
    value: "92%",
    icon: <Target className="w-6 h-6" />,
    color: "purple" as const,
    trend: { value: 4.2, isPositive: true },
  },
]

const subjectProgress = [
  { subject: "Mathematics", progress: 92, grade: "A*", lessons: 15, xp: 750 },
  { subject: "Physics", progress: 85, grade: "A", lessons: 12, xp: 600 },
  { subject: "Chemistry", progress: 78, grade: "A", lessons: 10, xp: 500 },
  { subject: "Biology", progress: 88, grade: "A*", lessons: 8, xp: 400 },
]

const weeklyActivity = [
  { day: "Mon", hours: 2.5, lessons: 3 },
  { day: "Tue", hours: 3.2, lessons: 4 },
  { day: "Wed", hours: 1.8, lessons: 2 },
  { day: "Thu", hours: 4.1, lessons: 5 },
  { day: "Fri", hours: 2.9, lessons: 3 },
  { day: "Sat", hours: 3.5, lessons: 4 },
  { day: "Sun", hours: 2.1, lessons: 2 },
]

const achievements = [
  { title: "Math Master", description: "Complete 15 math lessons", progress: 100, icon: "🧮" },
  { title: "Speed Learner", description: "Finish 5 lessons in one day", progress: 80, icon: "⚡" },
  { title: "Consistent Student", description: "Study for 7 consecutive days", progress: 100, icon: "🔥" },
  { title: "Quiz Champion", description: "Score 90%+ on 10 quizzes", progress: 60, icon: "🏆" },
]

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />

      <main className="lg:ml-72 min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="Your Progress"
            description="Track your learning journey and achievements"
            actions={
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 button-hover">
                <BarChart3 className="w-4 h-4 mr-2" />
                Detailed Report
              </Button>
            }
          />

          {/* Stats Grid */}
          <div className="mb-8">
            <StatsGrid stats={progressStats} columns={4} animated />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Subject Progress */}
            <div className="lg:col-span-2">
              <AnimatedCard delay={200}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                    Subject Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {subjectProgress.map((subject, index) => (
                    <div
                      key={subject.subject}
                      className="space-y-3"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-white">{subject.subject}</h4>
                          <Badge
                            variant="outline"
                            className={
                              subject.grade.includes("A*")
                                ? "border-green-500 text-green-400"
                                : "border-blue-500 text-blue-400"
                            }
                          >
                            {subject.grade}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{subject.progress}% complete</div>
                          <div className="flex items-center space-x-2">
                            <span>{subject.lessons} lessons</span>
                            <span>•</span>
                            <Zap className="w-3 h-3 text-purple-400" />
                            <span>{subject.xp} XP</span>
                          </div>
                        </div>
                      </div>
                      <Progress value={subject.progress} className="h-3" />
                    </div>
                  ))}
                </CardContent>
              </AnimatedCard>
            </div>

            {/* Weekly Activity */}
            <AnimatedCard delay={300}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyActivity.map((day, index) => (
                    <div
                      key={day.day}
                      className="flex items-center justify-between"
                      style={{ animationDelay: `${(index + 4) * 100}ms` }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-medium">
                          {day.day}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{day.hours}h</div>
                          <div className="text-xs text-muted-foreground">{day.lessons} lessons</div>
                        </div>
                      </div>
                      <div className="w-16">
                        <Progress value={(day.hours / 5) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Achievements */}
          <AnimatedCard delay={400} className="mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement.title}
                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    style={{ animationDelay: `${(index + 5) * 100}ms` }}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div>
                        <h4 className="font-medium text-white text-sm">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-white">{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Detailed Analytics */}
          <AnimatedCard delay={500}>
            <CardHeader>
              <CardTitle className="text-white">Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="glass-card border-white/20">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="subjects">Subjects</TabsTrigger>
                  <TabsTrigger value="time">Time Analysis</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Total Study Time</h4>
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">24h 32m</div>
                      <div className="text-sm text-muted-foreground">This week</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Lessons Completed</h4>
                        <BookOpen className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">45</div>
                      <div className="text-sm text-muted-foreground">Total lessons</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Average Score</h4>
                        <Star className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">87.5%</div>
                      <div className="text-sm text-muted-foreground">Across all subjects</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="subjects" className="mt-6">
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">Subject breakdown chart would go here</p>
                  </div>
                </TabsContent>
                <TabsContent value="time" className="mt-6">
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">Time analysis chart would go here</p>
                  </div>
                </TabsContent>
                <TabsContent value="performance" className="mt-6">
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">Performance trends would go here</p>
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
