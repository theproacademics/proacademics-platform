"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import Particles from "@/components/ui/particles"
import { 
  BookOpen, 
  Video, 
  User, 
  Clock, 
  Search, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Target,
  Play,
  GraduationCap,
  X,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Types for dynamic data - based on actual database fields
interface TimetableLesson {
  id: string;
  lessonName?: string;  // Lesson name
  topic?: string;       // Topic/title of the lesson
  subject?: string;
  program?: string;
  type?: 'Lesson' | 'Tutorial' | 'Workshop';
  scheduledDate?: string;
  time?: string;
  duration?: string;
  teacher?: string;     // Teacher name (not instructor)
  status?: 'draft' | 'active';
  videoUrl?: string;
  zoomLink?: string;
  // Legacy fields for compatibility
  week?: string;
  grade?: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const subjectColors = {
  Mathematics: "from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-200",
  Physics: "from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200",
  Chemistry: "from-purple-500/20 to-violet-500/20 border-purple-400/30 text-purple-200",
  Biology: "from-orange-500/20 to-amber-500/20 border-orange-400/30 text-orange-200",
  "Computer Science": "from-indigo-500/20 to-blue-500/20 border-indigo-400/30 text-indigo-200",
  English: "from-pink-500/20 to-rose-500/20 border-pink-400/30 text-pink-200",
}

export default function TimetablePage() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState(() => {
    // Initialize with today's day
    const today = new Date()
    const dayName = daysOfWeek[today.getDay() === 0 ? 6 : today.getDay() - 1]
    return dayName
  })
  const [mounted, setMounted] = useState(false)
  const [lessons, setLessons] = useState<TimetableLesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [schedule, setSchedule] = useState<Record<string, TimetableLesson[]>>({})
  const [dataReady, setDataReady] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { showPreloader, mounted: preloaderMounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch lessons data
  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/lessons?limit=1000&status=active')
        const apiResult = await response.json()
        const apiLessons = apiResult.lessons || []

        const transformedLessons: TimetableLesson[] = apiLessons.map((lesson: any) => ({
          id: lesson.id,
          lessonName: lesson.lessonName,
          topic: lesson.topic || lesson.title, // Use topic from DB, fallback to title for legacy data
          subject: lesson.subject,
          program: lesson.program,
          type: lesson.type,
          scheduledDate: lesson.scheduledDate,
          time: lesson.time,
          duration: lesson.duration || '90 min',
          teacher: lesson.teacher || 'ProAcademics Team',
          status: lesson.status,
          videoUrl: lesson.videoUrl,
          zoomLink: lesson.zoomLink,
          // Legacy fields for compatibility
          week: lesson.week,
          grade: lesson.grade
        }))
        setLessons(transformedLessons)
        
        const organizedSchedule: Record<string, TimetableLesson[]> = {
          Monday: [], Tuesday: [], Wednesday: [], Thursday: [], 
          Friday: [], Saturday: [], Sunday: []
        }
        
        transformedLessons.forEach((lesson) => {
          if (lesson.scheduledDate) {
            const date = new Date(lesson.scheduledDate)
            const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]
            organizedSchedule[dayName].push(lesson)
          }
        })
        
        setSchedule(organizedSchedule)
        setDataReady(true)
        
      } catch (error) {
        console.error("Failed to fetch lessons:", error)
        setLessons([])
        setSchedule({
          Monday: [], Tuesday: [], Wednesday: [], Thursday: [], 
          Friday: [], Saturday: [], Sunday: []
        })
        setDataReady(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const currentDate = new Date(today)
    const dayOfWeek = currentDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() + mondayOffset + weekOffset * 7)
    
    return daysOfWeek.map((_, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      return date
    })
  }

  const weekDates = getWeekDates(currentWeek)
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const goToToday = () => {
    setCurrentWeek(0)
    const today = new Date()
    const dayName = daysOfWeek[today.getDay() === 0 ? 6 : today.getDay() - 1]
    setSelectedDay(dayName)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      const today = new Date()
      const startOfThisWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1))
      const startOfSelectedWeek = new Date(date)
      startOfSelectedWeek.setDate(date.getDate() - date.getDay() + 1)
      
      const weeksDiff = Math.round((startOfSelectedWeek.getTime() - startOfThisWeek.getTime()) / (7 * 24 * 60 * 60 * 1000))
      setCurrentWeek(weeksDiff)
      
      const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]
      setSelectedDay(dayName)
      setShowCalendar(false)
    }
  }

  const getLessonStatus = (lesson: TimetableLesson) => {
    if (!lesson.scheduledDate) {
      // No scheduled date - default to join lesson
      return {
        status: 'future',
        buttonText: 'Join Lesson',
        buttonClass: 'bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:border-white/50 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl shadow-white/10 hover:shadow-white/20'
      }
    }

    const now = new Date()
    const lessonDate = new Date(lesson.scheduledDate)
    
    if (isNaN(lessonDate.getTime())) {
      // Invalid date - default to join lesson
      return {
        status: 'future',
        buttonText: 'Join Lesson',
        buttonClass: 'bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:border-white/50 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl shadow-white/10 hover:shadow-white/20'
      }
    }
    
    let durationMinutes = 60
    if (lesson.duration) {
      const durationMatch = lesson.duration.match(/(\d+)/)
      if (durationMatch) {
        durationMinutes = parseInt(durationMatch[1])
      }
    }
    
    const lessonEndTime = new Date(lessonDate.getTime() + durationMinutes * 60000)
    
    if (now < lessonDate) {
      // Future lesson
      return {
        status: 'future',
        buttonText: 'Join Lesson',
        buttonClass: 'bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:border-white/50 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl shadow-white/10 hover:shadow-white/20'
      }
    } else if (now >= lessonDate && now <= lessonEndTime) {
      // Currently live (happening right now)
      return {
        status: 'live',
        buttonText: 'Join Lesson',
        buttonClass: 'bg-red-500/30 backdrop-blur-xl border border-red-400/50 hover:bg-red-500/40 hover:border-red-400/70 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl shadow-red-500/20 hover:shadow-red-500/30 animate-pulse'
      }
    } else {
      // Past lesson
      return {
        status: 'past',
        buttonText: 'Watch Lesson',
        buttonClass: 'bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:border-white/50 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl shadow-white/10 hover:shadow-white/20'
      }
    }
  }

  const filteredClasses = (() => {
    const dayLessons = schedule[selectedDay] || []
    return dayLessons.filter((lesson) => {
      if (!lesson || (!lesson.topic && !lesson.lessonName)) return false
      
      if (lesson.scheduledDate) {
        const lessonDate = new Date(lesson.scheduledDate)
        const dayIndex = daysOfWeek.indexOf(selectedDay)
        
        if (dayIndex !== -1 && weekDates[dayIndex] && !isNaN(lessonDate.getTime())) {
          const selectedDate = weekDates[dayIndex]
          return lessonDate.toDateString() === selectedDate.toDateString()
        }
      }
      
      return true
    })
  })()

  if (showPreloader || !preloaderMounted || isLoading) {
    return <Preloader isVisible={showPreloader || !preloaderMounted || isLoading} colorScheme="blue" loadingText="Loading your class schedule" />
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-indigo-900/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Animated Particles */}
      <Particles
        className="fixed inset-0 pointer-events-none"
        quantity={60}
        ease={80}
        color="#60a5fa"
        size={0.6}
        staticity={50}
      />

      {/* Additional smaller particles for depth */}
      <Particles
        className="fixed inset-0 pointer-events-none"
        quantity={80}
        ease={40}
        color="#a78bfa"
        size={0.3}
        staticity={30}
      />

      {/* Subtle geometric patterns */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <svg 
          className="absolute inset-0 w-full h-full" 
          width="100%" 
          height="100%" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern 
              id="grid-pattern" 
              width="120" 
              height="120" 
              patternUnits="userSpaceOnUse"
            >
              <path 
                d="M 120 0 L 0 0 0 120" 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="1"
                opacity="0.6"
              />
            </pattern>
            <pattern 
              id="dot-pattern" 
              width="60" 
              height="60" 
              patternUnits="userSpaceOnUse"
            >
              <circle 
                cx="30" 
                cy="30" 
                r="1.5" 
                fill="#a78bfa"
                opacity="0.4"
              />
            </pattern>
          </defs>
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#grid-pattern)" 
          />
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#dot-pattern)" 
          />
        </svg>
      </div>

      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <ResponsiveContainer padding="lg" animated>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  My Timetable
                </h1>
                <p className="text-gray-300 text-base">
                  Track your learning journey with scheduled classes
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2">
                  <CalendarIcon className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-white font-medium">Week View</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {/* Weekly Schedule */}
            <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all duration-300 relative overflow-hidden group">
              {/* Enhanced card background with subtle animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse opacity-30" />
                              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center text-xl font-semibold">
                    <CalendarIcon className="w-5 h-5 mr-3 text-emerald-400" />
                    Weekly Schedule
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={goToToday}
                      size="sm"
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 rounded-lg px-3 py-1.5 text-sm"
                    >
                      Today
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentWeek(currentWeek - 1)}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg w-8 h-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <button
                      onClick={() => setShowCalendar(true)}
                      className="bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/20 rounded-lg px-4 py-1.5"
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">
                          {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentWeek(currentWeek + 1)}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg w-8 h-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                {/* Mobile Day Selector */}
                <div className="lg:hidden mb-4">
                  <div className="flex overflow-x-auto gap-2 pb-2">
                    {daysOfWeek.map((day, index) => {
                      const date = weekDates[index]
                      const today = isToday(date)
                      const isSelected = selectedDay === day
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={cn(
                            "flex-shrink-0 px-3 py-2 rounded-lg text-center transition-all duration-200 min-w-[80px]",
                            isSelected 
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" 
                              : "bg-white/10 text-slate-300 border border-white/20 hover:bg-white/20",
                            today && !isSelected && "ring-2 ring-amber-400/50"
                          )}
                        >
                          <div className="text-xs font-medium">{day.slice(0, 3)}</div>
                          <div className={cn(
                            "text-xs mt-1",
                            today && !isSelected ? "font-bold text-amber-400" : ""
                          )}>
                            {date.getDate()}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop Day Tabs */}
                <div className="hidden lg:block mb-4">
                  <div className="bg-white/10 border border-white/20 grid grid-cols-7 w-full p-2 gap-1 rounded-lg">
                    {daysOfWeek.map((day, index) => {
                      const date = weekDates[index]
                      const today = isToday(date)
                      const isSelected = selectedDay === day
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={cn(
                            "w-full text-sm font-medium px-2 py-2 rounded-md transition-all duration-200",
                            isSelected 
                              ? "bg-white/20 text-white" 
                              : "text-gray-300 hover:bg-white/10 hover:text-white",
                            today && "ring-2 ring-amber-400/50"
                          )}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{day.slice(0, 3)}</div>
                            <div className={cn(
                              "text-xs mt-1",
                              today ? "font-bold text-amber-400" : "text-gray-400"
                            )}>
                              {date.getDate()}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Compact Lessons List */}
                <div className="space-y-3">
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="group p-4 lg:p-5 rounded-xl bg-white/8 backdrop-blur-2xl hover:bg-white/12 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 relative overflow-hidden hover:scale-[1.01]"
                      >
                          {/* Subtle hover gradient effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4 relative z-10">
                            <div className="flex-1 space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-semibold text-white text-lg leading-tight">
                                {lesson.lessonName || lesson.topic || 'Untitled Lesson'}
                              </h3>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                {lesson.topic && (
                                  <span className={`inline-flex items-center bg-gradient-to-r ${subjectColors[lesson.subject as keyof typeof subjectColors] || 'from-gray-500/20 to-gray-600/20 border-gray-400/30 text-gray-300'} px-2.5 py-1.5 text-xs font-bold border rounded-md shadow-sm hover:shadow-md transition-all duration-200`}>
                                    {lesson.topic}
                                  </span>
                                )}
                                {lesson.type && (
                                  <span className="inline-flex items-center bg-gradient-to-r from-purple-500/25 to-indigo-500/25 border-purple-400/40 text-purple-100 gap-1.5 px-2.5 py-1.5 text-xs font-bold border rounded-md shadow-sm hover:from-purple-500/35 hover:to-indigo-500/35 transition-all duration-200">
                                    {lesson.type === 'Lesson' && <GraduationCap className="w-3 h-3" />}
                                    {lesson.type === 'Tutorial' && <Video className="w-3 h-3" />}
                                    {lesson.type === 'Workshop' && <ExternalLink className="w-3 h-3" />}
                                    {lesson.type}
                                  </span>
                                )}
                                {(() => {
                                  const lessonStatus = getLessonStatus(lesson)
                                  if (lessonStatus.status === 'live') {
                                    return (
                                      <Badge className="bg-gradient-to-r from-red-500/40 to-red-600/40 border-red-400/60 text-red-100 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold animate-pulse border shadow-lg rounded-full backdrop-blur-sm">
                                        <div className="w-2 h-2 bg-red-300 rounded-full animate-ping"></div>
                                        LIVE
                                      </Badge>
                                    )
                                  }
                                  return null
                                })()}
                              </div>
                            </div>

                            {lesson.program && (
                              <div className="inline-flex items-center bg-indigo-500/15 text-indigo-200 border border-indigo-400/25 px-2.5 py-1.5 text-xs font-medium rounded-md">
                                <Target className="w-3 h-3 mr-1.5" />
                                {lesson.program}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2.5 text-sm">
                              {lesson.duration && (
                                <div className="flex items-center bg-amber-500/15 px-2.5 py-1.5 rounded-md border border-amber-400/25">
                                  <Clock className="w-3 h-3 mr-1.5 text-amber-400" />
                                  <span className="text-amber-200 font-medium text-xs">{lesson.duration}</span>
                                </div>
                              )}
                              {lesson.teacher && (
                                <div className="flex items-center bg-blue-500/15 px-2.5 py-1.5 rounded-md border border-blue-400/25">
                                  <User className="w-3 h-3 mr-1.5 text-blue-400" />
                                  <span className="text-blue-200 font-medium text-xs truncate max-w-[120px]">{lesson.teacher}</span>
                                </div>
                              )}
                              {lesson.subject && (
                                <div className="flex items-center bg-emerald-500/15 px-2.5 py-1.5 rounded-md border border-emerald-400/25">
                                  <BookOpen className="w-3 h-3 mr-1.5 text-emerald-400" />
                                  <span className="text-emerald-200 font-medium text-xs">{lesson.subject}</span>
                                </div>
                              )}
                              {lesson.time && (
                                <div className="flex items-center bg-purple-500/15 px-2.5 py-1.5 rounded-md border border-purple-400/25">
                                  <Play className="w-3 h-3 mr-1.5 text-purple-400" />
                                  <span className="text-purple-200 font-medium text-xs">{lesson.time}</span>
                                </div>
                              )}
                            </div>

                            {lesson.scheduledDate && (() => {
                              const date = new Date(lesson.scheduledDate)
                              if (!isNaN(date.getTime())) {
                                return (
                                  <div className="inline-flex items-center bg-slate-500/15 px-2 py-1 rounded-md border border-slate-400/25 text-xs">
                                    <CalendarIcon className="w-3 h-3 mr-1 text-slate-400" />
                                    <span className="text-slate-300 font-medium">
                                    {date.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                    </span>
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>

                          <div className="flex-shrink-0">
                            {(() => {
                              const lessonStatus = getLessonStatus(lesson)
                              
                              return (
                                <Button 
                                  className={`w-full lg:w-auto ${lessonStatus.buttonClass} transition-all duration-200 px-6 py-2.5 text-sm font-semibold`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Simple logic: Past = watch lesson (video), Live/Future = join lesson (prefer zoom)
                                    if (lessonStatus.status === 'past') {
                                      // Past lesson - watch lesson (video)
                                      window.location.href = `/lesson/${lesson.id}?from=timetable`
                                    } else {
                                      // Live/Future lesson - join lesson (prefer zoom if available)
                                      if (lesson.zoomLink) {
                                        window.open(lesson.zoomLink, '_blank')
                                      } else {
                                        window.location.href = `/lesson/${lesson.id}?from=timetable`
                                      }
                                    }
                                  }}
                                >
                                  {lessonStatus.status === 'live' && <Play className="w-4 h-4 mr-2" />}
                                  {lessonStatus.buttonText}
                                </Button>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                        <CalendarIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        No classes scheduled for {selectedDay}
                      </h3>
                      <p className="text-gray-400">
                        Your schedule is free for this day
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ResponsiveContainer>
      </main>

      {/* Custom Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="w-full max-w-[320px] sm:max-w-[380px] bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-0 [&>button:last-child]:hidden">
          {/* Enhanced gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 pointer-events-none rounded-2xl"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent rounded-t-2xl"></div>
          
          <div className="relative z-10">
            {/* Custom Close Button */}
            <DialogClose className="absolute right-4 top-4 z-50 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 w-8 h-8 flex items-center justify-center text-white hover:text-white transition-all duration-200 hover:scale-105">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <DialogHeader className="p-6 pb-4 border-b border-white/20">
              <DialogTitle className="text-white flex items-center text-lg font-semibold">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-3 border border-blue-400/30">
                  <CalendarIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">Select Date</div>
                  <div className="text-sm text-gray-400 font-normal">Choose a date to navigate</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-6">
              <div className="bg-white/8 backdrop-blur-2xl border border-white/15 rounded-xl p-4 shadow-inner relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none rounded-xl"></div>
                <div className="relative z-10">
                  {/* Custom Calendar Implementation */}
                  <div className="space-y-4">
                    {/* Calendar Header */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() - 1)
                          setSelectedDate(newDate)
                        }}
                        className="h-8 w-8 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-lg transition-all duration-200 text-white flex items-center justify-center border border-white/20 hover:border-white/30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() + 1)
                          setSelectedDate(newDate)
                        }}
                        className="h-8 w-8 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-lg transition-all duration-200 text-white flex items-center justify-center border border-white/20 hover:border-white/30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="text-gray-300 text-center py-2 text-sm font-semibold">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const year = selectedDate.getFullYear()
                        const month = selectedDate.getMonth()
                        const firstDay = new Date(year, month, 1)
                        const lastDay = new Date(year, month + 1, 0)
                        const daysInMonth = lastDay.getDate()
                        const startingDayOfWeek = firstDay.getDay()
                        
                        const days = []
                        
                        // Previous month's trailing days
                        const prevMonth = new Date(year, month - 1, 0)
                        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
                          const day = prevMonth.getDate() - i
                          days.push(
                            <button
                              key={`prev-${day}`}
                              className="h-9 sm:h-10 w-full p-0 font-medium text-gray-500 opacity-40 hover:bg-white/10 hover:opacity-60 rounded-lg transition-all duration-200 flex items-center justify-center text-sm"
                              onClick={() => {
                                const newDate = new Date(year, month - 1, day)
                                handleDateSelect(newDate)
                              }}
                            >
                              {day}
                            </button>
                          )
                        }
                        
                        // Current month days
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(year, month, day)
                          const isToday = date.toDateString() === new Date().toDateString()
                          const isSelected = date.toDateString() === selectedDate.toDateString()
                          
                          days.push(
                            <button
                              key={day}
                              className={cn(
                                "h-9 sm:h-10 w-full p-0 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center text-sm border border-transparent",
                                isSelected
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-blue-400/40 shadow-lg scale-105"
                                  : isToday
                                  ? "bg-white/15 text-white font-black border-2 border-amber-400/80 shadow-lg shadow-amber-400/20"
                                  : "text-white hover:bg-white/20 hover:scale-105 hover:border-white/20"
                              )}
                              onClick={() => handleDateSelect(date)}
                            >
                              {day}
                            </button>
                          )
                        }
                        
                        // Next month's leading days
                        const remainingDays = 42 - days.length // 6 rows × 7 days
                        for (let day = 1; day <= remainingDays; day++) {
                          days.push(
                            <button
                              key={`next-${day}`}
                              className="h-9 sm:h-10 w-full p-0 font-medium text-gray-500 opacity-40 hover:bg-white/10 hover:opacity-60 rounded-lg transition-all duration-200 flex items-center justify-center text-sm"
                              onClick={() => {
                                const newDate = new Date(year, month + 1, day)
                                handleDateSelect(newDate)
                              }}
                            >
                              {day}
                            </button>
                          )
                        }
                        
                        return days
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
