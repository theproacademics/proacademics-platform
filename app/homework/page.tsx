"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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



// Homework assignment interface
interface HomeworkAssignment {
  _id: string
  assignmentId: string
  homeworkName: string
  subject: string
  program: string
  topic: string
  subtopic: string
  level: 'easy' | 'medium' | 'hard'
  teacher: string
  dateAssigned: string
  dueDate: string
  estimatedTime: number
  xpAwarded: number
  questionSet: Array<{
    questionId: string
    topic: string
    subtopic: string
    level: 'easy' | 'medium' | 'hard'
    question: string
    markScheme: string
    image?: string
  }>
  status: 'draft' | 'active'
  totalQuestions: number
  createdAt: string
  updatedAt: string
  // Student progress fields
  completionStatus?: "not_started" | "in_progress" | "completed" | "overdue"
  completedQuestions?: number
  score?: number
  xpEarned?: number
  timeTaken?: number
  progress?: number
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200"
    case "not_started":
      return "bg-gray-100 text-gray-800 border-gray-200"
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
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("all")
  const [dataReady, setDataReady] = useState(false)
  const [homework, setHomework] = useState<HomeworkAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { showPreloader, mounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  // Fetch homework data
  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch only active homework assignments
        const response = await fetch('/api/admin/homework?status=active&limit=50')
        const data = await response.json()
        
        // Handle the response like lessons page - more resilient
        if (data.success) {
          // Transform homework data to match the expected format
          const homeworkData = data.data?.homework || data.homework || []
          const transformedHomework = homeworkData.map((hw: any) => ({
            ...hw,
            completionStatus: hw.completionStatus || "not_started",
            completedQuestions: hw.completedQuestions || 0,
            progress: hw.totalQuestions > 0 ? Math.round((hw.completedQuestions || 0) / hw.totalQuestions * 100) : 0,
            // Convert date to readable format
            dueDate: new Date(hw.dueDate).toISOString().split('T')[0]
          }))
          
          setHomework(transformedHomework)
        } else {
          // If API returns error, just set empty array like lessons page
          setHomework([])
        }
      } catch (err) {
        console.error('Error fetching homework:', err)
        // On error, just set empty array like lessons page
        setHomework([])
      } finally {
        setLoading(false)
        setDataReady(true)
      }
    }

    fetchHomework()
  }, [])

  const filterHomework = (status?: string) => {
    if (!status || status === "all") return homework
    if (status === "not_started") return homework.filter((hw: HomeworkAssignment) => hw.completionStatus === "not_started")
    if (status === "pending") return homework.filter((hw: HomeworkAssignment) => hw.completionStatus === "in_progress")
    return homework.filter((hw: HomeworkAssignment) => hw.completionStatus === status)
  }

  const stats = {
    total: homework.length,
    completed: homework.filter((hw: HomeworkAssignment) => hw.completionStatus === "completed").length,
    pending: homework.filter((hw: HomeworkAssignment) => hw.completionStatus === "in_progress").length,
    overdue: homework.filter((hw: HomeworkAssignment) => hw.completionStatus === "overdue").length,
    avgScore:
      homework.filter((hw: HomeworkAssignment) => hw.completionStatus === "completed").reduce((sum: number, hw: HomeworkAssignment) => sum + (hw.score || 0), 0) /
        homework.filter((hw: HomeworkAssignment) => hw.completionStatus === "completed").length || 0,
  }

  // Show preloader
  if (showPreloader) {
    return <Preloader isVisible={showPreloader} colorScheme="blue" loadingText="Loading homework assignments" />
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-red-400 text-xl font-semibold mb-2">Error loading homework</div>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Try Again
            </Button>
            {error.includes('Authentication') && (
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/auth/signin'}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    )
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
      
      <div className="lg:ml-[270px] relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Compact Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Homework Dashboard</h1>
              <p className="text-sm text-slate-400">Track your assignments and excel in your studies</p>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-300/20 rounded-xl p-3 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-105 transition-transform duration-300">
                  <FileText className="w-4 h-4 text-blue-300" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{stats.total}</div>
                  <div className="text-blue-200 text-xs">Total</div>
                </div>
              </div>
              <div className="h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" style={{width: '100%'}} />
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-300/20 rounded-xl p-3 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:scale-105 transition-transform duration-300">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{stats.completed}</div>
                  <div className="text-green-200 text-xs">Completed</div>
                </div>
              </div>
              <div className="h-1.5 bg-green-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" style={{width: `${(stats.completed/stats.total)*100}%`}} />
              </div>
              <div className="text-green-100 text-xs mt-1">Avg: {Math.round(stats.avgScore)}%</div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-300/20 rounded-xl p-3 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-500/20 rounded-lg group-hover:scale-105 transition-transform duration-300">
                  <Clock className="w-4 h-4 text-orange-300" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{stats.pending}</div>
                  <div className="text-orange-200 text-xs">Pending</div>
                </div>
              </div>
              <div className="h-1.5 bg-orange-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse" style={{width: `${(stats.pending/stats.total)*100}%`}} />
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-300/20 rounded-xl p-3 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-red-500/20 rounded-lg group-hover:scale-105 transition-transform duration-300">
                  <AlertCircle className="w-4 h-4 text-red-300" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{stats.overdue}</div>
                  <div className="text-red-200 text-xs">Overdue</div>
                </div>
              </div>
              <div className="h-1.5 bg-red-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse" style={{width: `${(stats.overdue/stats.total)*100}%`}} />
              </div>
            </div>
          </div>

          {/* Premium Homework List */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
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
            
            <div className="p-6">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-5 bg-white/5 backdrop-blur-sm border border-white/10">
                  <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    All ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    In Progress ({stats.pending})
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
                      <div key={homework._id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {homework.homeworkName}
                              </h3>
                              <Badge className={getStatusColor(homework.completionStatus || "not_started")}>
                                {(homework.completionStatus || "not_started").replace("_", " ")}
                              </Badge>
                              <Badge variant="outline" className={getDifficultyColor(homework.level)}>
                                {homework.level}
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
                                  {homework.completionStatus === "completed"
                                    ? `Completed in ${homework.timeTaken}min`
                                    : `Est. ${homework.estimatedTime}min`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                <span>
                                  {homework.completionStatus === "completed"
                                    ? `${homework.xpEarned} XP earned`
                                    : `${homework.xpAwarded} XP reward`}
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
                              {homework.completionStatus === "completed" && homework.score && (
                                <div className="text-center bg-green-500/20 rounded-xl p-3">
                                  <div className="text-2xl font-bold text-green-300">{homework.score}%</div>
                                  <div className="text-xs text-green-200">Score</div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="ml-6">
                            <Button
                              onClick={() => {
                                if (homework.completionStatus === "completed") {
                                  // Navigate to review page (future implementation)
                                  router.push(`/homework/${homework._id}/review`)
                                } else {
                                  // Navigate to question page
                                  router.push(`/homework/${homework._id}`)
                                }
                              }}
                              className={
                                homework.completionStatus === "completed"
                                  ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                                  : homework.completionStatus === "overdue"
                                    ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0 shadow-lg"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                              }
                            >
                              {homework.completionStatus === "completed"
                                ? "Review"
                                : homework.completionStatus === "not_started"
                                  ? "Start"
                                  : "Continue"}
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Empty State */}
                    {filterHomework(selectedTab === "all" ? undefined : selectedTab).length === 0 && !loading && (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {selectedTab === "all" 
                            ? "No homework assignments available" 
                            : `No ${selectedTab.replace("_", " ")} assignments found`}
                        </h3>
                        <p className="text-slate-400 mb-6 max-w-md mx-auto">
                          {selectedTab === "all" 
                            ? "There are currently no homework assignments available. Check back later or contact your teacher for more information." 
                            : `No ${selectedTab.replace("_", " ")} homework assignments found. Try selecting a different category or check back later.`}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedTab("all")
                            }}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            View All Assignments
                          </Button>
                          <Button 
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            Refresh Page
                          </Button>
                        </div>
                      </div>
                    )}
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
                    {homework
                      .filter((hw: HomeworkAssignment) => hw.completionStatus === "completed")
                      .reduce((sum: number, hw: HomeworkAssignment) => sum + (hw.xpEarned || 0), 0)} XP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Potential XP</span>
                  <span className="font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    {homework.filter((hw: HomeworkAssignment) => hw.completionStatus !== "completed").reduce((sum: number, hw: HomeworkAssignment) => sum + (hw.xpAwarded || 0), 0)} XP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Total Available</span>
                  <span className="font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    {homework.reduce((sum: number, hw: HomeworkAssignment) => sum + (hw.xpEarned || hw.xpAwarded || 0), 0)} XP
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
