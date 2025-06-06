"use client"

import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Award, Zap, Target, Clock, Star, PenTool, Save, BarChart3, LineChart } from "lucide-react"

// Mock data for growth tracking
const growthStats = [
  {
    id: "xp-growth",
    title: "XP This Month",
    value: "1,250",
    icon: <Zap className="w-6 h-6" />,
    color: "purple" as const,
    trend: { value: 23.5, isPositive: true },
  },
  {
    id: "cwa-trend",
    title: "CWA Improvement",
    value: "+5.2%",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "green" as const,
    trend: { value: 12.1, isPositive: true },
  },
  {
    id: "badges-earned",
    title: "Badges Earned",
    value: "8",
    icon: <Award className="w-6 h-6" />,
    color: "orange" as const,
    trend: { value: 33.3, isPositive: true },
  },
  {
    id: "study-time",
    title: "Study Hours",
    value: "42h",
    icon: <Clock className="w-6 h-6" />,
    color: "blue" as const,
    trend: { value: 15.8, isPositive: true },
  },
]

// Mock XP data over time (last 30 days)
const xpOverTime = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  xp: Math.floor(Math.random() * 100) + 50 + i * 2, // Trending upward
  cwa: Math.min(95, 70 + Math.random() * 10 + i * 0.5), // Gradual improvement
}))

const badgeHistory = [
  {
    id: "1",
    title: "Math Master",
    description: "Completed advanced calculus module",
    date: "2024-01-10",
    level: "Gold",
    xp: 100,
  },
  {
    id: "2",
    title: "Speed Demon",
    description: "Completed 10 questions in under 5 minutes",
    date: "2024-01-08",
    level: "Silver",
    xp: 75,
  },
  {
    id: "3",
    title: "Consistent Learner",
    description: "7-day study streak achieved",
    date: "2024-01-05",
    level: "Bronze",
    xp: 50,
  },
  {
    id: "4",
    title: "Physics Pro",
    description: "Mastered wave motion concepts",
    date: "2024-01-03",
    level: "Gold",
    xp: 100,
  },
]

const levelHistory = [
  { level: 12, unlockedDate: "2024-01-10", xpRequired: 2400 },
  { level: 11, unlockedDate: "2024-01-05", xpRequired: 2200 },
  { level: 10, unlockedDate: "2023-12-28", xpRequired: 2000 },
  { level: 9, unlockedDate: "2023-12-20", xpRequired: 1800 },
]

const badgeLevelColors = {
  Gold: "border-yellow-500 text-yellow-400 bg-yellow-500/10",
  Silver: "border-gray-300 text-gray-300 bg-gray-500/10",
  Bronze: "border-amber-600 text-amber-600 bg-amber-500/10",
}

export default function MyGrowthPage() {
  const [reflection, setReflection] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("30days")

  const saveReflection = () => {
    // Save reflection to backend
    console.log("Saving reflection:", reflection)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />

      <main className="lg:ml-72 min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="My Growth Journey"
            description="Track your progress, celebrate achievements, and reflect on your learning"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" className="button-hover">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 button-hover">
                  <Target className="w-4 h-4 mr-2" />
                  Set Goals
                </Button>
              </div>
            }
          />

          {/* Stats Grid */}
          <div className="mb-8">
            <StatsGrid stats={growthStats} columns={4} animated />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* XP Progress Chart */}
            <div className="lg:col-span-2">
              <AnimatedCard delay={200}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <LineChart className="w-5 h-5 mr-2 text-blue-400" />
                      Progress Over Time
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedPeriod === "7days" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod("7days")}
                      >
                        7D
                      </Button>
                      <Button
                        variant={selectedPeriod === "30days" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod("30days")}
                      >
                        30D
                      </Button>
                      <Button
                        variant={selectedPeriod === "90days" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod("90days")}
                      >
                        90D
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* XP Chart */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-3">XP Earned</h4>
                      <div className="h-32 flex items-end justify-between space-x-1">
                        {xpOverTime.slice(-14).map((day, index) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div
                              className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-sm min-h-[4px] transition-all hover:opacity-80"
                              style={{ height: `${(day.xp / 150) * 100}%` }}
                              title={`Day ${day.day}: ${day.xp} XP`}
                            />
                            <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CWA Trend */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-3">Current Working Average</h4>
                      <div className="h-32 flex items-end justify-between space-x-1">
                        {xpOverTime.slice(-14).map((day, index) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div
                              className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-sm min-h-[4px] transition-all hover:opacity-80"
                              style={{ height: `${day.cwa}%` }}
                              title={`Day ${day.day}: ${day.cwa.toFixed(1)}%`}
                            />
                            <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>

            {/* Level Progress */}
            <AnimatedCard delay={300}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  Level History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {levelHistory.map((level, index) => (
                  <div
                    key={level.level}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center font-bold text-white">
                        {level.level}
                      </div>
                      <div>
                        <div className="font-medium text-white">Level {level.level}</div>
                        <div className="text-xs text-muted-foreground">{level.xpRequired} XP</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {new Date(level.unlockedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Badge History */}
          <AnimatedCard delay={400} className="mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-orange-400" />
                Badge Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {badgeHistory.map((badge, index) => (
                  <div
                    key={badge.id}
                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    style={{ animationDelay: `${(index + 5) * 100}ms` }}
                  >
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">{badge.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                        <div className="flex items-center justify-center space-x-2">
                          <Badge className={badgeLevelColors[badge.level as keyof typeof badgeLevelColors]}>
                            {badge.level}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            +{badge.xp} XP
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(badge.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Personal Reflection */}
          <AnimatedCard delay={500}>
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PenTool className="w-5 h-5 mr-2 text-purple-400" />
                Personal Reflection Journal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="current" className="w-full">
                <TabsList className="glass-card border-white/20">
                  <TabsTrigger value="current">Current Reflection</TabsTrigger>
                  <TabsTrigger value="history">Past Entries</TabsTrigger>
                  <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
                </TabsList>
                <TabsContent value="current" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        How do you feel about your progress this week?
                      </label>
                      <Textarea
                        placeholder="Reflect on your learning journey, challenges faced, and achievements..."
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        className="glass-card border-white/20 focus:border-blue-500/50 min-h-[120px]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={saveReflection} className="bg-gradient-to-r from-blue-500 to-purple-600">
                        <Save className="w-4 h-4 mr-2" />
                        Save Reflection
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="mt-6">
                  <div className="space-y-4">
                    {[
                      {
                        date: "2024-01-10",
                        content:
                          "Great week! Finally understood calculus limits. The Lex AI sessions really helped break down complex concepts.",
                      },
                      {
                        date: "2024-01-03",
                        content:
                          "Struggled with physics wave motion initially, but practice problems made it click. Need to focus more on chemistry next week.",
                      },
                    ].map((entry, index) => (
                      <div key={index} className="p-4 rounded-lg bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">Weekly Reflection</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="goals" className="mt-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-medium text-blue-400 mb-2">Short-term Goals (This Month)</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Complete advanced calculus module</li>
                        <li>• Achieve 90%+ on all physics quizzes</li>
                        <li>• Maintain 7-day study streak</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <h4 className="font-medium text-green-400 mb-2">Long-term Goals (This Term)</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Reach Level 15</li>
                        <li>• Improve CWA to 90%+</li>
                        <li>• Earn "Subject Master" badges in all subjects</li>
                      </ul>
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
