"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, FileText, Award, ChevronRight, Star, Target, Trophy, Brain, Zap, PlayCircle } from "lucide-react"
import { Navigation } from "@/components/layout/navigation"

// Animated Background Component
const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: ['#3B82F6', '#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
      speed: Math.random() * 2 + 1,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20" />
      
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full opacity-40 animate-particle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.id * 0.1}s`,
            animationDuration: `${4 + particle.speed}s`,
          }}
        />
      ))}

      {/* Shooting Stars */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-shooting-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: '8s',
          }}
        />
      ))}

      {/* Floating Geometric Shapes */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`shape-${i}`}
          className={`absolute opacity-20 animate-shape-float ${
            i % 3 === 0 ? 'w-4 h-4 bg-blue-400 rounded-full' :
            i % 3 === 1 ? 'w-3 h-3 bg-purple-400 rotate-45' :
            'w-2 h-2 bg-cyan-400 rounded-full'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Large Floating Orbs */}
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full opacity-10 animate-float-slow"
          style={{
            width: '300px',
            height: '300px',
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            background: `radial-gradient(circle, ${['#3B82F6', '#8B5CF6', '#06D6A0'][i]} 0%, transparent 70%)`,
            animationDelay: `${i * 5}s`,
            animationDuration: `${20 + i * 5}s`,
          }}
        />
      ))}
    </div>
  );
};



// Mock homework data with proper types
const mockHomework = [
  {
    id: 1,
    title: "Quadratic Functions Practice",
    subject: "Mathematics",
    dueDate: "2024-01-16",
    status: "pending",
    progress: 60,
    totalQuestions: 15,
    completedQuestions: 9,
    estimatedTime: 25,
    difficulty: "medium" as const,
    xpReward: 150,
  },
  {
    id: 2,
    title: "Trigonometry Review",
    subject: "Mathematics",
    dueDate: "2024-01-18",
    status: "not_started",
    progress: 0,
    totalQuestions: 20,
    completedQuestions: 0,
    estimatedTime: 35,
    difficulty: "hard" as const,
    xpReward: 200,
  },
  {
    id: 3,
    title: "Statistics Analysis",
    subject: "Mathematics",
    dueDate: "2024-01-14",
    status: "completed",
    progress: 100,
    totalQuestions: 12,
    completedQuestions: 12,
    score: 92,
    timeTaken: 28,
    xpEarned: 180,
    difficulty: "medium" as const,
    xpReward: 180,
  },
  {
    id: 4,
    title: "Algebra Fundamentals",
    subject: "Mathematics",
    dueDate: "2024-01-12",
    status: "overdue",
    progress: 40,
    totalQuestions: 18,
    completedQuestions: 7,
    estimatedTime: 30,
    difficulty: "easy" as const,
    xpReward: 120,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "hard":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function HomeworkPage() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [dataReady, setDataReady] = useState(false)
  const { showPreloader, mounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  // Simulate data loading and mark as ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setDataReady(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filterHomework = (status?: string) => {
    if (!status || status === "all") return mockHomework
    return mockHomework.filter((hw) => hw.status === status)
  }

  const stats = {
    total: mockHomework.length,
    completed: mockHomework.filter((hw) => hw.status === "completed").length,
    pending: mockHomework.filter((hw) => hw.status === "pending").length,
    overdue: mockHomework.filter((hw) => hw.status === "overdue").length,
    avgScore:
      mockHomework.filter((hw) => hw.status === "completed").reduce((sum, hw) => sum + (hw.score || 0), 0) /
        mockHomework.filter((hw) => hw.status === "completed").length || 0,
  }

  // Show preloader
  if (showPreloader) {
    return <Preloader isVisible={showPreloader} colorScheme="blue" loadingText="Loading homework assignments" />
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #312e81 100%)',
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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #312e81 100%)'
        }}
      />
      
      <AnimatedBackground />
      <Navigation />
      
      <div className="lg:ml-80 relative z-10">
        <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Homework Dashboard
              </h1>
              <p className="text-xl text-blue-100/80 mb-6">
                Track your assignments and excel in your studies
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2 text-blue-100">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">Academic Excellence</span>
                </div>
                <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Goal Oriented</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-300/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-blue-300" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.total}</div>
                  <div className="text-blue-200 text-sm">Total Assignments</div>
                </div>
              </div>
              <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" style={{width: '100%'}} />
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-300/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.completed}</div>
                  <div className="text-green-200 text-sm">Completed</div>
                </div>
              </div>
              <div className="h-2 bg-green-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" style={{width: `${(stats.completed/stats.total)*100}%`}} />
              </div>
              <div className="text-green-100 text-xs mt-2">Avg Score: {Math.round(stats.avgScore)}%</div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-300/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-orange-300" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.pending}</div>
                  <div className="text-orange-200 text-sm">Pending</div>
                </div>
              </div>
              <div className="h-2 bg-orange-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse" style={{width: `${(stats.pending/stats.total)*100}%`}} />
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-300/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="w-6 h-6 text-red-300" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.overdue}</div>
                  <div className="text-red-200 text-sm">Overdue</div>
                </div>
              </div>
              <div className="h-2 bg-red-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse" style={{width: `${(stats.overdue/stats.total)*100}%`}} />
              </div>
            </div>
          </div>

          {/* Premium Homework List */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-blue-400" />
                    Your Assignments
                  </h2>
                  <p className="text-blue-100/70">Manage and track your homework progress</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Quick Start
                </Button>
              </div>
            </div>
            
            <div className="p-8">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-5 bg-white/5 backdrop-blur-sm border border-white/10">
                  <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    All ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Pending ({stats.pending})
                  </TabsTrigger>
                  <TabsTrigger value="not_started" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Not Started
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Completed ({stats.completed})
                  </TabsTrigger>
                  <TabsTrigger value="overdue" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Overdue ({stats.overdue})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="mt-8">
                  <div className="space-y-4">
                    {filterHomework(selectedTab === "all" ? undefined : selectedTab).map((homework) => (
                      <div key={homework.id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {homework.title}
                              </h3>
                              <Badge className={getStatusColor(homework.status)}>
                                {homework.status.replace("_", " ")}
                              </Badge>
                              <Badge variant="outline" className={getDifficultyColor(homework.difficulty)}>
                                {homework.difficulty}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-blue-100/70 mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {homework.dueDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {homework.status === "completed"
                                    ? `Completed in ${homework.timeTaken}min`
                                    : `Est. ${homework.estimatedTime}min`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                <span>
                                  {homework.status === "completed"
                                    ? `${homework.xpEarned} XP earned`
                                    : `${homework.xpReward} XP reward`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-2 text-blue-100">
                                  <span>Progress</span>
                                  <span>
                                    {homework.completedQuestions}/{homework.totalQuestions} questions
                                  </span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                                    style={{width: `${homework.progress}%`}}
                                  />
                                </div>
                              </div>
                              {homework.status === "completed" && homework.score && (
                                <div className="text-center bg-green-500/20 rounded-xl p-3">
                                  <div className="text-2xl font-bold text-green-300">{homework.score}%</div>
                                  <div className="text-xs text-green-200">Score</div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="ml-6">
                            <Button
                              className={
                                homework.status === "completed"
                                  ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                                  : homework.status === "overdue"
                                    ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0 shadow-lg"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                              }
                            >
                              {homework.status === "completed"
                                ? "Review"
                                : homework.status === "not_started"
                                  ? "Start"
                                  : "Continue"}
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Premium Insights Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-300/20 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                  Performance Insights
                </h3>
                <Brain className="h-8 w-8 text-blue-400 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Average Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 bg-blue-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{width: `${stats.avgScore}%`}} />
                    </div>
                    <span className="font-bold text-white">{Math.round(stats.avgScore)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Completion Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 bg-blue-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" style={{width: `${(stats.completed / stats.total) * 100}%`}} />
                    </div>
                    <span className="font-bold text-white">
                      {Math.round((stats.completed / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">On-time Submissions</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 bg-blue-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" style={{width: `${((stats.total - stats.overdue) / stats.total) * 100}%`}} />
                    </div>
                    <span className="font-bold text-white">
                      {Math.round(((stats.total - stats.overdue) / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-300/20 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Award className="h-6 w-6 text-green-400" />
                  XP Summary
                </h3>
                <Zap className="h-8 w-8 text-green-400 animate-bounce" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-100">XP Earned</span>
                  <span className="font-bold text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {mockHomework
                      .filter((hw) => hw.status === "completed")
                      .reduce((sum, hw) => sum + (hw.xpEarned || 0), 0)} XP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Potential XP</span>
                  <span className="font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    {mockHomework.filter((hw) => hw.status !== "completed").reduce((sum, hw) => sum + (hw.xpReward || 0), 0)} XP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Total Available</span>
                  <span className="font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    {mockHomework.reduce((sum, hw) => sum + (hw.xpEarned || hw.xpReward || 0), 0)} XP
                  </span>
                </div>
              </div>
            </div>
                     </div>
         </div>
       </div>
     </div>
     </div>
   )
 }
