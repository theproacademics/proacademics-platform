"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, TrendingUp, BookOpen, Zap, BarChart3, Filter, Eye, ChevronRight, Award, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for topic progress
const topicStats = [
  {
    id: "mastered",
    title: "Topics Mastered",
    value: "23",
    icon: <Award className="w-6 h-6" />,
    color: "green" as const,
    trend: { value: 15.2, isPositive: true },
  },
  {
    id: "in-progress",
    title: "In Progress",
    value: "8",
    icon: <BookOpen className="w-6 h-6" />,
    color: "blue" as const,
    trend: { value: 12.5, isPositive: true },
  },
  {
    id: "avg-cwa",
    title: "Average CWA",
    value: "87.3%",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "purple" as const,
    trend: { value: 8.7, isPositive: true },
  },
  {
    id: "total-xp",
    title: "Total Topic XP",
    value: "1,850",
    icon: <Zap className="w-6 h-6" />,
    color: "orange" as const,
    trend: { value: 23.1, isPositive: true },
  },
]

const subjectTopics = {
  Mathematics: [
    {
      module: "Algebra",
      topics: [
        { name: "Linear Equations", cwa: 95, xp: 150, status: "mastered", lastStudied: "2 days ago" },
        { name: "Quadratic Equations", cwa: 88, xp: 200, status: "strong", lastStudied: "1 day ago" },
        { name: "Simultaneous Equations", cwa: 72, xp: 120, status: "developing", lastStudied: "5 days ago" },
        { name: "Inequalities", cwa: 45, xp: 80, status: "needs-work", lastStudied: "1 week ago" },
      ],
    },
    {
      module: "Calculus",
      topics: [
        { name: "Differentiation", cwa: 92, xp: 180, status: "mastered", lastStudied: "3 days ago" },
        { name: "Integration", cwa: 78, xp: 140, status: "developing", lastStudied: "4 days ago" },
        { name: "Applications", cwa: 65, xp: 100, status: "developing", lastStudied: "6 days ago" },
      ],
    },
    {
      module: "Geometry",
      topics: [
        { name: "Trigonometry", cwa: 89, xp: 160, status: "strong", lastStudied: "2 days ago" },
        { name: "Circle Theorems", cwa: 82, xp: 130, status: "strong", lastStudied: "5 days ago" },
        { name: "3D Geometry", cwa: 58, xp: 90, status: "needs-work", lastStudied: "1 week ago" },
      ],
    },
  ],
  Physics: [
    {
      module: "Mechanics",
      topics: [
        { name: "Forces", cwa: 91, xp: 170, status: "mastered", lastStudied: "1 day ago" },
        { name: "Motion", cwa: 85, xp: 150, status: "strong", lastStudied: "3 days ago" },
        { name: "Energy", cwa: 76, xp: 120, status: "developing", lastStudied: "4 days ago" },
      ],
    },
    {
      module: "Waves",
      topics: [
        { name: "Wave Properties", cwa: 68, xp: 110, status: "developing", lastStudied: "6 days ago" },
        { name: "Sound Waves", cwa: 52, xp: 85, status: "needs-work", lastStudied: "1 week ago" },
        { name: "Light Waves", cwa: 74, xp: 125, status: "developing", lastStudied: "5 days ago" },
      ],
    },
  ],
  Chemistry: [
    {
      module: "Organic Chemistry",
      topics: [
        { name: "Alkanes", cwa: 87, xp: 145, status: "strong", lastStudied: "2 days ago" },
        { name: "Alkenes", cwa: 79, xp: 135, status: "developing", lastStudied: "4 days ago" },
        { name: "Functional Groups", cwa: 63, xp: 95, status: "developing", lastStudied: "6 days ago" },
      ],
    },
    {
      module: "Physical Chemistry",
      topics: [
        { name: "Atomic Structure", cwa: 93, xp: 175, status: "mastered", lastStudied: "1 day ago" },
        { name: "Bonding", cwa: 81, xp: 140, status: "strong", lastStudied: "3 days ago" },
        { name: "Energetics", cwa: 56, xp: 88, status: "needs-work", lastStudied: "1 week ago" },
      ],
    },
  ],
}

const statusConfig = {
  mastered: { color: "bg-green-500", textColor: "text-green-400", label: "Mastered", threshold: 90 },
  strong: { color: "bg-blue-500", textColor: "text-blue-400", label: "Strong", threshold: 80 },
  developing: { color: "bg-yellow-500", textColor: "text-yellow-400", label: "Developing", threshold: 60 },
  "needs-work": { color: "bg-red-500", textColor: "text-red-400", label: "Needs Work", threshold: 0 },
}

export default function TopicProgressPage() {
  const [selectedSubject, setSelectedSubject] = useState("Mathematics")
  const [viewMode, setViewMode] = useState("detailed")

  const getStatusFromCWA = (cwa: number) => {
    if (cwa >= 90) return "mastered"
    if (cwa >= 80) return "strong"
    if (cwa >= 60) return "developing"
    return "needs-work"
  }

  const renderHeatmapView = () => {
    const allTopics = Object.values(subjectTopics)
      .flat()
      .flatMap((module) => module.topics.map((topic) => ({ ...topic, module: module.module })))

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {allTopics.map((topic, index) => {
          const status = getStatusFromCWA(topic.cwa)
          return (
            <div
              key={`${topic.module}-${topic.name}`}
              className={cn(
                "aspect-square rounded-lg p-2 cursor-pointer transition-all hover:scale-105",
                `${statusConfig[status].color}/20 border ${statusConfig[status].color}/30`,
              )}
              title={`${topic.name}: ${topic.cwa}% CWA`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="h-full flex flex-col justify-between">
                <div className={cn("w-2 h-2 rounded-full", statusConfig[status].color)} />
                <div className="text-xs text-white font-medium truncate">{topic.name}</div>
                <div className="text-xs text-muted-foreground">{topic.cwa}%</div>
              </div>
            </div>
          )
        })}
      </div>
    )
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

      <main className="lg:ml-[262px] min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="Topic Progress Tracker"
            description="Monitor your mastery across all subjects and topics"
            actions={
              <div className="flex gap-2">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="w-32 glass-card border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="heatmap">Heatmap</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 button-hover">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            }
          />

          {/* Stats Grid */}
          <div className="mb-8">
            <StatsGrid stats={topicStats} columns={4} animated />
          </div>

          {/* Subject Tabs */}
          <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="mb-8">
            <TabsList className="glass-card border-white/20">
              {Object.keys(subjectTopics).map((subject) => (
                <TabsTrigger key={subject} value={subject}>
                  {subject}
                </TabsTrigger>
              ))}
            </TabsList>

            {viewMode === "heatmap" ? (
              <TabsContent value={selectedSubject} className="mt-6">
                <AnimatedCard delay={200}>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                      Topic Mastery Heatmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderHeatmapView()}
                    <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-white/10">
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <div className={cn("w-3 h-3 rounded-full", config.color)} />
                          <span className="text-sm text-muted-foreground">{config.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </AnimatedCard>
              </TabsContent>
            ) : (
              Object.entries(subjectTopics).map(([subject, modules]) => (
                <TabsContent key={subject} value={subject} className="mt-6">
                  <div className="space-y-6">
                    {modules.map((module, moduleIndex) => (
                      <AnimatedCard key={module.module} delay={200 + moduleIndex * 100}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white">{module.module}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {module.topics.length} topics
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {module.topics.map((topic, topicIndex) => {
                            const status = getStatusFromCWA(topic.cwa)
                            return (
                              <div
                                key={topic.name}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                                style={{ animationDelay: `${(moduleIndex * 4 + topicIndex + 3) * 100}ms` }}
                              >
                                <div className="flex items-center space-x-4 flex-1">
                                  <div className={cn("w-3 h-3 rounded-full", statusConfig[status].color)} />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                      {topic.name}
                                    </h4>
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                      <div className="flex items-center space-x-1">
                                        <Target className="w-3 h-3" />
                                        <span>CWA: {topic.cwa}%</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Zap className="w-3 h-3 text-purple-400" />
                                        <span>{topic.xp} XP</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{topic.lastStudied}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <Badge className={cn("text-xs", statusConfig[status].textColor)}>
                                      {statusConfig[status].label}
                                    </Badge>
                                    <div className="w-24 mt-2">
                                      <Progress value={topic.cwa} className="h-2" />
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </CardContent>
                      </AnimatedCard>
                    ))}
                  </div>
                </TabsContent>
              ))
            )}
          </Tabs>

          {/* Recommendations */}
          <AnimatedCard delay={500}>
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Lex's Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h4 className="font-medium text-red-400 mb-2">Priority: Inequalities</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your CWA is 45%. Focus on basic inequality solving before moving to complex problems.
                  </p>
                  <Button size="sm" variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                    <Eye className="w-3 h-3 mr-1" />
                    Study Now
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <h4 className="font-medium text-yellow-400 mb-2">Review: Sound Waves</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Haven't studied in a week. Quick review session recommended to maintain progress.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Quick Review
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h4 className="font-medium text-green-400 mb-2">Advance: Differentiation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Strong performance! Ready for advanced applications and challenging problems.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Challenge Mode
                  </Button>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </ResponsiveContainer>
      </main>
    </div>
  )
}
