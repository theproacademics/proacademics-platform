"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Play, Clock, Star, Search, Zap, Users, Calendar, Filter, Sparkles } from "lucide-react"

// Enhanced Particle Background Component
const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Large floating orbs */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-float-slow opacity-70"></div>
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-bl from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-float-slow-reverse opacity-70" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-32 left-1/4 w-72 h-72 bg-gradient-to-tr from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-float-slow opacity-70" style={{ animationDelay: '4s' }}></div>
      
      {/* Moving particles */}
      {[...Array(60)].map((_, i) => {
        const size = Math.random() * 3 + 1;
        const colors = [
          'from-blue-400/40 to-cyan-400/40',
          'from-purple-400/40 to-pink-400/40',
          'from-cyan-400/40 to-blue-400/40',
          'from-indigo-400/40 to-purple-400/40'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${randomColor} animate-particle-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${Math.random() * 15 + 10}s`,
              filter: `blur(${Math.random() * 1}px)`,
              boxShadow: `0 0 ${size * 3}px currentColor`
            }}
          />
        );
      })}
      
      {/* Shooting stars */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white/60 rounded-full animate-shooting-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: '3s'
          }}
        />
      ))}
      
      {/* Floating geometric shapes */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`shape-${i}`}
          className="absolute animate-shape-float opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 20 + 15}s`
          }}
        >
          {i % 3 === 0 && (
            <div className="w-1.5 h-1.5 border border-blue-400/30 rotate-45 transform"></div>
          )}
          {i % 3 === 1 && (
            <div className="w-1 h-1 bg-purple-400/30 rounded-full"></div>
          )}
          {i % 3 === 2 && (
            <div className="w-1.5 h-1.5 border border-cyan-400/30 rounded-full"></div>
          )}
        </div>
      ))}
    </div>
  )
}

const difficultyColors = {
  Beginner: "border-green-500 text-green-400",
  Intermediate: "border-yellow-500 text-yellow-400",
  Advanced: "border-red-500 text-red-400",
}

// Background color utilities for difficulty badges
const difficultyBg: Record<string, string> = {
  Beginner: "bg-green-500/40",
  Intermediate: "bg-yellow-500/40",
  Advanced: "bg-red-500/40",
}

const difficultyBgSolid: Record<string, string> = {
  Beginner: "bg-green-500/90",
  Intermediate: "bg-yellow-500/90",
  Advanced: "bg-red-500/90",
}

// Define the lesson type for the frontend component
interface Lesson {
  id: string;
  title: string;
  subject: string;
  topic: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xp: number;
  instructor: string;
  isLive: boolean;
  liveDate?: string;
  description: string;
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [dataReady, setDataReady] = useState(false)
  const { showPreloader, mounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  // Add styles to prevent white background on scroll
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* Fix background coverage for all scroll scenarios */
      html, body {
        background: linear-gradient(135deg, #111827 0%, #1e3a8a 40%, #581c87 100%) !important;
        background-attachment: fixed !important;
        min-height: 100vh !important;
      }
      
      /* Prevent elastic scroll on mobile */
      body {
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true)
      try {
        // Fetch all lessons by setting a high limit and filtering to show only active ones
        const response = await fetch('/api/admin/lessons?limit=1000&status=active')
        const apiResult = await response.json()
        
        const apiLessons = apiResult.lessons || []

        const transformedLessons: Lesson[] = apiLessons.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          subject: lesson.subject,
          topic: lesson.subtopic || 'General Topic',
          duration: lesson.duration || 'N/A',
          difficulty: lesson.difficulty || 'Intermediate',
          xp: lesson.xp || 50,
          instructor: lesson.instructor || 'ProAcademics Team',
          isLive: lesson.status === 'active',
          liveDate: lesson.scheduledDate,
          description: lesson.description || 'Join us for this exciting lesson!',
        }));
        
        setLessons(transformedLessons)
        setDataReady(true)
      } catch (error) {
        console.error("Failed to fetch lessons:", error)
        setLessons([])
        setDataReady(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const subjects = ["all", "Mathematics", "Physics", "Chemistry", "Biology"]
  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.topic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || lesson.subject === selectedSubject
    const matchesDifficulty = selectedDifficulty === "all" || lesson.difficulty === selectedDifficulty

    return matchesSearch && matchesSubject && matchesDifficulty
  })

  const stats = [
    {
      id: "total",
      title: "Total Lessons",
      value: lessons.length,
      icon: <BookOpen className="w-6 h-6" />,
      color: "blue" as const,
    },
    {
      id: "live",
      title: "Published",
      value: lessons.filter((l) => l.isLive).length,
      icon: <Calendar className="w-6 h-6" />,
      color: "green" as const,
    },
    {
      id: "xp",
      title: "Avg XP",
      value: lessons.length > 0 ? Math.round(lessons.reduce((acc, l) => acc + l.xp, 0) / lessons.length) : 0,
      icon: <Zap className="w-6 h-6" />,
      color: "purple" as const,
    },
    {
      id: "subjects",
      title: "Subjects",
      value: [...new Set(lessons.map(l => l.subject))].length,
      icon: <Sparkles className="w-6 h-6" />,
      color: "orange" as const,
    },
  ]

  // Show preloader
  if (showPreloader || isLoading) {
    return <Preloader isVisible={showPreloader || isLoading} colorScheme="purple" loadingText="Loading lessons and content" />
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden"
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
      
      <ParticleBackground />
      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <ResponsiveContainer padding="lg" animated>
          {/* Ultra-Modern Hero Section */}
          <div className="relative mb-20 animate-fade-in overflow-hidden">
            {/* Multiple layered backgrounds */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-[2rem] blur-3xl"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-[2rem] blur-2xl"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900/60 via-slate-800/60 to-slate-900/60 backdrop-blur-3xl rounded-[2rem] border border-white/30 shadow-2xl overflow-hidden">
              {/* Animated mesh gradient overlay */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-shift"></div>
              </div>
              
              {/* Advanced glass highlights */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-white/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-transparent via-white/30 to-transparent"></div>
              
              <div className="relative p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  {/* Content Section */}
                  <div className="flex-1 space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-2xl blur-xl animate-pulse"></div>
                          <div className="relative p-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl backdrop-blur-xl border border-white/30">
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">Live Lessons Available</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                          <span className="block text-transparent bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text animate-gradient-text">
                            Lessons
                          </span>
                          <span className="block text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text mt-2 animate-gradient-text-reverse">
                            Library
                          </span>
                        </h1>
                        <div className="absolute inset-0 text-5xl lg:text-7xl font-black text-blue-500/10 blur-3xl">
                          Lessons Library
                        </div>
                      </div>
                      
                      <p className="text-xl lg:text-2xl text-slate-300 font-medium leading-relaxed max-w-2xl">
                        Discover <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-bold">expert-led lessons</span> designed to accelerate your learning journey
                      </p>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-4">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl group-hover:blur-2xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
                        <Button size="lg" className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-2xl px-8 py-4 text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300">
                          <Play className="w-5 h-5 mr-3" />
                          Start Learning
                        </Button>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                        <Button size="lg" variant="outline" className="relative bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-2xl px-8 py-4 text-lg font-semibold backdrop-blur-xl hover:scale-105 transition-all duration-300">
                          <Filter className="w-5 h-5 mr-3" />
                          Browse Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual Element */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                      {/* Floating elements */}
                      <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-blue-500/60 to-cyan-500/60 rounded-2xl backdrop-blur-xl border border-white/30 flex items-center justify-center animate-float-slow shadow-2xl">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute top-16 right-12 w-12 h-12 bg-gradient-to-br from-purple-500/60 to-pink-500/60 rounded-xl backdrop-blur-xl border border-white/30 flex items-center justify-center animate-float-slow-reverse shadow-2xl" style={{ animationDelay: '1s' }}>
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute bottom-16 left-16 w-14 h-14 bg-gradient-to-br from-green-500/60 to-emerald-500/60 rounded-xl backdrop-blur-xl border border-white/30 flex items-center justify-center animate-float-slow shadow-2xl" style={{ animationDelay: '2s' }}>
                        <Star className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute bottom-8 right-8 w-10 h-10 bg-gradient-to-br from-orange-500/60 to-red-500/60 rounded-lg backdrop-blur-xl border border-white/30 flex items-center justify-center animate-float-slow-reverse shadow-2xl" style={{ animationDelay: '0.5s' }}>
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      
                      {/* Central orb */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl animate-pulse"></div>
                          <div className="relative w-32 h-32 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-full backdrop-blur-3xl border border-white/40 flex items-center justify-center shadow-2xl">
                            <div className="text-center">
                              <div className="text-3xl font-black text-white mb-1">∞</div>
                              <div className="text-xs font-semibold text-slate-300">INFINITE</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revolutionary Stats Grid */}
          <div className="mb-20 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.id}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${400 + index * 150}ms` }}
                >
                  {/* Dynamic glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    stat.color === 'blue' ? 'from-blue-500/30 to-cyan-500/30' :
                    stat.color === 'green' ? 'from-green-500/30 to-emerald-500/30' :
                    stat.color === 'purple' ? 'from-purple-500/30 to-pink-500/30' :
                    'from-orange-500/30 to-red-500/30'
                  } rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
                  
                  {/* Main card */}
                  <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl group-hover:shadow-3xl group-hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                    {/* Animated gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      stat.color === 'blue' ? 'from-blue-500/10 via-cyan-500/5 to-transparent' :
                      stat.color === 'green' ? 'from-green-500/10 via-emerald-500/5 to-transparent' :
                      stat.color === 'purple' ? 'from-purple-500/10 via-pink-500/5 to-transparent' :
                      'from-orange-500/10 via-red-500/5 to-transparent'
                    } opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                    
                    {/* Glass edges */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                    
                    <div className="relative p-8">
                      {/* Icon and trend */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${
                            stat.color === 'blue' ? 'from-blue-500/40 to-cyan-500/40' :
                            stat.color === 'green' ? 'from-green-500/40 to-emerald-500/40' :
                            stat.color === 'purple' ? 'from-purple-500/40 to-pink-500/40' :
                            'from-orange-500/40 to-red-500/40'
                          } rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                          <div className={`relative p-4 bg-gradient-to-br ${
                            stat.color === 'blue' ? 'from-blue-500/30 to-cyan-500/30' :
                            stat.color === 'green' ? 'from-green-500/30 to-emerald-500/30' :
                            stat.color === 'purple' ? 'from-purple-500/30 to-pink-500/30' :
                            'from-orange-500/30 to-red-500/30'
                          } rounded-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500`}>
                            {stat.icon}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-xs px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            Live
                          </div>
                        </div>
                      </div>
                      
                      {/* Value and title */}
                      <div className="space-y-3">
                        <div className={`text-4xl lg:text-5xl font-black ${
                          stat.color === 'blue' ? 'text-blue-400' :
                          stat.color === 'green' ? 'text-green-400' :
                          stat.color === 'purple' ? 'text-purple-400' :
                          'text-orange-400'
                        } group-hover:scale-105 transition-transform duration-300`}>
                          {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                        </div>
                        <p className="text-lg font-semibold text-slate-300 group-hover:text-white transition-colors duration-300">
                          {stat.title}
                        </p>
                        
                        {/* Progress bar */}
                        <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden mt-4">
                          <div className={`absolute left-0 top-0 h-full bg-gradient-to-r ${
                            stat.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                            stat.color === 'green' ? 'from-green-500 to-emerald-500' :
                            stat.color === 'purple' ? 'from-purple-500 to-pink-500' :
                            'from-orange-500 to-red-500'
                          } rounded-full transition-all duration-1000 group-hover:scale-x-110`}
                          style={{ width: `${Math.min(100, (typeof stat.value === 'number' ? stat.value : 75))}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-white/8 via-white/15 to-white/8 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 lg:p-8 overflow-hidden">
                {/* Glass edge highlights */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                
                <div className="relative flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-hover:blur-lg transition-all duration-300"></div>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                        <Input
                          placeholder="Search lessons, topics, or instructors..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:bg-white/15 transition-all duration-300 shadow-lg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-sm group-hover:blur-lg transition-all duration-300"></div>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="relative w-40 bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl text-white shadow-lg hover:bg-white/15 transition-all duration-300">
                          <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject === "all" ? "All Subjects" : subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl blur-sm group-hover:blur-lg transition-all duration-300"></div>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="relative w-40 bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl text-white shadow-lg hover:bg-white/15 transition-all duration-300">
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty === "all" ? "All Levels" : difficulty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Lessons Grid */}
          <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {filteredLessons.map((lesson, index) => (
                <div key={lesson.id} className="group overflow-hidden animate-fade-in" style={{ animationDelay: `${600 + index * 100}ms` }}>
                  <div className="relative">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    
                    {/* Main card */}
                    <div className="relative bg-gradient-to-br from-white/8 via-white/15 to-white/8 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-purple-500/25 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                      {/* Glass edge highlights */}
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                      
                      {/* Image Section with Advanced Overlay */}
                      <div className="relative overflow-hidden">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
                        
                        {/* Placeholder for now - can be replaced with actual image */}
                        <div className="w-full h-64 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex items-center justify-center">
                          <div className="text-center space-y-3">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-slate-400 font-medium">Preview Available</p>
                          </div>
                        </div>
                        
                        {/* Status badges */}
                        <div className="absolute top-6 left-6 flex flex-col gap-3">
                          {lesson.isLive && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-red-500/40 rounded-2xl blur-xl animate-pulse"></div>
                              <div className="relative bg-red-500/90 backdrop-blur-2xl border border-white/30 rounded-2xl px-4 py-2 shadow-2xl">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                                  <span className="text-white font-bold text-sm uppercase tracking-wider">LIVE</span>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500/40 rounded-2xl blur-lg"></div>
                            <div className="relative bg-yellow-500/90 backdrop-blur-2xl border border-white/30 rounded-2xl px-4 py-2 shadow-2xl">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-white" />
                                <span className="text-white font-bold text-sm">{lesson.xp} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Difficulty badge */}
                        <div className="absolute top-6 right-6">
                          <div className="relative">
                            <div className={`absolute inset-0 ${difficultyBg[lesson.difficulty] || 'bg-gray-500/40'} rounded-2xl blur-lg`}></div>
                            <div className={`relative ${difficultyBgSolid[lesson.difficulty] || 'bg-gray-500/90'} backdrop-blur-2xl border border-white/30 rounded-2xl px-4 py-2 shadow-2xl`}>
                              <span className="text-white font-bold text-sm">{lesson.difficulty}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Interactive overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center space-y-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl"></div>
                              <Button size="lg" className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-2xl px-8 py-4 text-lg font-bold shadow-2xl hover:scale-110 transition-all duration-300">
                                <Play className="w-6 h-6 mr-3" />
                                {lesson.isLive ? "Join Live Session" : "Start Lesson"}
                              </Button>
                            </div>
                            <p className="text-white/80 font-medium">Click to begin learning</p>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="relative p-8 space-y-6">
                        {/* Subject */}
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-lg"></div>
                            <div className="relative bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-xl px-4 py-2">
                              <span className="text-blue-300 font-semibold text-sm">{lesson.subject}</span>
                            </div>
                          </div>
                        </div>

                        {/* Title and description */}
                        <div className="space-y-4">
                          <h3 className="text-2xl font-black text-white group-hover:text-blue-300 transition-colors duration-300 leading-tight">
                            {lesson.title}
                          </h3>
                          <p className="text-slate-400 text-base leading-relaxed line-clamp-3">
                            {lesson.description}
                          </p>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                            <div className="text-lg font-bold text-white">{lesson.duration}</div>
                            <div className="text-xs text-slate-400 font-medium">Duration</div>
                          </div>
                          <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                            <Sparkles className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                            <div className="text-lg font-bold text-white">{lesson.difficulty}</div>
                            <div className="text-xs text-slate-400 font-medium">Level</div>
                          </div>
                        </div>

                        {/* Instructor info */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/15">
                          <div>
                            <p className="text-white font-semibold text-lg">{lesson.instructor}</p>
                            <p className="text-slate-400 text-sm font-medium">Expert Instructor</p>
                          </div>
                          {lesson.isLive && lesson.liveDate && (
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                <span className="text-red-400 font-bold text-sm uppercase tracking-wider">LIVE NOW</span>
                              </div>
                              <p className="text-slate-300 text-sm font-semibold">{lesson.liveDate}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredLessons.length === 0 && (
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-white/8 via-white/15 to-white/8 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-16 text-center">
                {/* Glass edge highlights */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 to-slate-500/20 rounded-full blur-2xl"></div>
                  <BookOpen className="relative w-20 h-20 mx-auto text-slate-400 opacity-60" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">No lessons found</h3>
                <p className="text-lg text-slate-400 font-medium">Try adjusting your search criteria or filters</p>
              </div>
            </div>
          )}
        </ResponsiveContainer>
      </main>
    </div>
  )
}
