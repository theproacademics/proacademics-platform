"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { BookOpen, Video, User, Clock, Search, Filter, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Types for dynamic data - only real database fields
interface TimetableLesson {
  id: string;
  title: string;
  subject: string;
  subtopic?: string;
  instructor: string;
  duration: string;
  videoUrl?: string;
  scheduledDate?: string;
  week?: string;
  grade?: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const subjectColors = {
  Mathematics: "from-blue-500/20 to-cyan-500/20 border-blue-400/40 text-blue-300",
  Physics: "from-green-500/20 to-emerald-500/20 border-green-400/40 text-green-300",
  Chemistry: "from-purple-500/20 to-violet-500/20 border-purple-400/40 text-purple-300",
  Biology: "from-orange-500/20 to-amber-500/20 border-orange-400/40 text-orange-300",
  "Computer Science": "from-indigo-500/20 to-blue-500/20 border-indigo-400/40 text-indigo-300",
  English: "from-pink-500/20 to-rose-500/20 border-pink-400/40 text-pink-300",
}

export default function TimetablePage() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [mounted, setMounted] = useState(false)
  const [lessons, setLessons] = useState<TimetableLesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [schedule, setSchedule] = useState<Record<string, TimetableLesson[]>>({})
  const [searchQuery, setSearchQuery] = useState("")
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

  // Set document background
  useEffect(() => {
    document.body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #581c87 100%)'
    document.documentElement.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #581c87 100%)'
    
    return () => {
      document.body.style.background = ''
      document.documentElement.style.background = ''
    }
  }, [])



  // Fetch lessons data
  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true)
      try {
        // Fetch all active lessons
        const response = await fetch('/api/admin/lessons?limit=1000&status=active')
        const apiResult = await response.json()
        
        const apiLessons = apiResult.lessons || []

        // Transform API lessons to timetable format - only real fields
        const transformedLessons: TimetableLesson[] = apiLessons.map((lesson: any) => {
          return {
            id: lesson.id,
            title: lesson.title,
            subject: lesson.subject,
            subtopic: lesson.subtopic,
            instructor: lesson.instructor || 'ProAcademics Team',
            duration: lesson.duration || '90 min',
            videoUrl: lesson.videoUrl,
            scheduledDate: lesson.scheduledDate,
            week: lesson.week,
            grade: lesson.grade
          }
        })
        
        setLessons(transformedLessons)
        
        // Organize lessons by day of week based on scheduledDate
        const organizedSchedule: Record<string, TimetableLesson[]> = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: []
        }
        
        // Distribute lessons based on their scheduledDate
        transformedLessons.forEach((lesson) => {
          if (lesson.scheduledDate) {
            const date = new Date(lesson.scheduledDate)
            const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1] // Convert Sunday (0) to index 6
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
    try {
      const today = new Date()
      const currentDate = new Date(today) // Create a copy to avoid mutation
      const dayOfWeek = currentDate.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday as start of week
      
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() + mondayOffset + weekOffset * 7)
      
      return daysOfWeek.map((_, index) => {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + index)
        return date
      })
    } catch (error) {
      console.error('Error calculating week dates:', error)
      return daysOfWeek.map(() => new Date()) // Fallback to current date
    }
  }

  const weekDates = getWeekDates(currentWeek)
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Navigate to today
  const goToToday = () => {
    setCurrentWeek(0)
    const today = new Date()
    const dayName = daysOfWeek[today.getDay() === 0 ? 6 : today.getDay() - 1]
    setSelectedDay(dayName)
  }

  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      // Calculate week offset from current week
      const today = new Date()
      const startOfThisWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1))
      const startOfSelectedWeek = new Date(date)
      startOfSelectedWeek.setDate(date.getDate() - date.getDay() + 1)
      
      const weeksDiff = Math.round((startOfSelectedWeek.getTime() - startOfThisWeek.getTime()) / (7 * 24 * 60 * 60 * 1000))
      setCurrentWeek(weeksDiff)
      
      // Set selected day
      const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]
      setSelectedDay(dayName)
      setShowCalendar(false)
    }
  }

  // Function to get lesson status and button details
  const getLessonStatus = (lesson: TimetableLesson) => {
    if (!lesson.scheduledDate) {
      return {
        status: 'available',
        buttonText: 'Watch Lesson',
        buttonClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
      }
    }

    try {
      const now = new Date()
      const lessonDate = new Date(lesson.scheduledDate)
      
      // Validate the date
      if (isNaN(lessonDate.getTime())) {
        return {
          status: 'available',
          buttonText: 'Watch Lesson',
          buttonClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }
      }
      
      // Extract duration in minutes safely
      let durationMinutes = 60 // default
      if (lesson.duration) {
        const durationMatch = lesson.duration.match(/(\d+)/)
        if (durationMatch) {
          durationMinutes = parseInt(durationMatch[1])
        }
      }
      
      const lessonEndTime = new Date(lessonDate.getTime() + durationMinutes * 60000)
      const tenMinutesBefore = new Date(lessonDate.getTime() - 10 * 60000)
      
      if (now >= tenMinutesBefore && now <= lessonEndTime) {
        return {
          status: 'live',
          buttonText: 'Join Lesson',
          buttonClass: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
        }
      } else if (now < tenMinutesBefore) {
        return {
          status: 'future',
          buttonText: 'Join Lesson',
          buttonClass: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
        }
      } else {
        return {
          status: 'past',
          buttonText: 'Watch Lesson',
          buttonClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }
      }
    } catch (error) {
      console.error('Error getting lesson status:', error)
      return {
        status: 'available',
        buttonText: 'Watch Lesson',
        buttonClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
      }
    }
  }

  const filteredClasses = (() => {
    try {
      const dayLessons = schedule[selectedDay] || []
      return dayLessons.filter((lesson) => {
        try {
          if (!lesson || !lesson.title) return false
          
          const matchesSearch = (lesson.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lesson.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lesson.instructor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lesson.subtopic && lesson.subtopic.toLowerCase().includes(searchQuery.toLowerCase()))
          
          // Check if the lesson's scheduled date matches the selected day's date
          if (lesson.scheduledDate) {
            try {
              const lessonDate = new Date(lesson.scheduledDate)
              const dayIndex = daysOfWeek.indexOf(selectedDay)
              
              if (dayIndex !== -1 && weekDates[dayIndex] && !isNaN(lessonDate.getTime())) {
                const selectedDate = weekDates[dayIndex]
                return matchesSearch && lessonDate.toDateString() === selectedDate.toDateString()
              }
            } catch (dateError) {
              console.error('Error comparing lesson date:', dateError)
            }
          }
          
          return matchesSearch
        } catch (lessonError) {
          console.error('Error filtering lesson:', lessonError)
          return false
        }
      })
    } catch (error) {
      console.error('Error filtering lessons:', error)
      return []
    }
  })()

  if (showPreloader || !preloaderMounted || isLoading) {
    return <Preloader isVisible={showPreloader || !preloaderMounted || isLoading} colorScheme="blue" loadingText="Loading your class schedule and timetable" />
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-0"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="My Timetable"
            description="Your personalized schedule with smart notifications and quick access"
            actions={
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <Input
                      placeholder="Search classes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            }
          />

                      <div className="space-y-10 mb-10">
            {/* Schedule Area */}
            <AnimatedCard delay={200}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden">
                <CardHeader className="pb-6">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center text-2xl font-bold">
                        <CalendarIcon className="w-7 h-7 mr-4 text-emerald-400" />
                        Weekly Schedule
                      </CardTitle>
                                              <div className="flex items-center space-x-3">
                          {/* Today Button */}
                          <Button
                            onClick={goToToday}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition-all duration-300 border border-emerald-400/40 hover:border-emerald-400/60 rounded-xl px-4 py-2 font-medium"
                          >
                            <Target className="w-4 h-4 mr-2" />
                            Today
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentWeek(currentWeek - 1)}
                            className="bg-white/10 hover:bg-white/20 text-white hover:text-blue-300 transition-all duration-300 border border-white/20 hover:border-white/30 rounded-xl w-10 h-10"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </Button>
                          
                          {/* Week Display */}
                          <button
                            onClick={() => setShowCalendar(true)}
                            className="bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30 rounded-xl px-6 py-2"
                          >
                            <div className="text-center">
                              <div className="text-sm font-semibold text-white">
                                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {weekDates[0].getFullYear()}
                              </div>
                            </div>
                          </button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentWeek(currentWeek + 1)}
                            className="bg-white/10 hover:bg-white/20 text-white hover:text-blue-300 transition-all duration-300 border border-white/20 hover:border-white/30 rounded-xl w-10 h-10"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
                                                                      <TabsList className="bg-white/10 border border-white/20 grid grid-cols-7 w-full mb-6 p-1 rounded-xl">
                          {daysOfWeek.map((day, index) => {
                            const date = weekDates[index]
                            const today = isToday(date)
                            return (
                              <TabsTrigger
                                key={day}
                                value={day}
                                className={cn(
                                  "w-full text-sm font-medium px-2 py-3 rounded-lg transition-all duration-300 data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10",
                                  today && "ring-2 ring-amber-400/50"
                                )}
                              >
                                <div className="text-center">
                                  <div className="font-semibold text-sm">{day.slice(0, 3)}</div>
                                  <div className={cn(
                                    "text-xs mt-1 px-1.5 py-0.5 rounded-md transition-all duration-300 font-medium",
                                    today 
                                      ? "bg-amber-400 text-amber-900 font-bold" 
                                      : "text-gray-400"
                                  )}>
                                    {date.getDate()}
                                  </div>
                                </div>
                              </TabsTrigger>
                            )
                          })}
                        </TabsList>

                      {daysOfWeek.map((day) => (
                        <TabsContent key={day} value={day} className="mt-0">
                                                      <div className="space-y-6">
                              {filteredClasses.length > 0 ? (
                                filteredClasses.map((lesson, index) => (
                                  <div
                                    key={lesson.id}
                                    className="group p-6 rounded-2xl bg-white/10 backdrop-blur-xl hover:bg-white/15 transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-blue-500/20 relative"
                                    onClick={(e) => {
                                      try {
                                        e.preventDefault()
                                        if (lesson?.id) {
                                          window.location.href = `/lesson/${lesson.id}`
                                        }
                                      } catch (error) {
                                        console.error('Error navigating to lesson:', error)
                                      }
                                    }}
                                  >
                                    {/* Content */}
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                      {/* Left section - Lesson info */}
                                      <div className="flex-1 space-y-4">
                                        {/* Title and badges */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                          <h4 className="font-bold text-white text-xl leading-tight">
                                            {lesson.title}
                                          </h4>
                                          <div className="flex items-center gap-2">
                                            <Badge className={`bg-gradient-to-r ${subjectColors[lesson.subject as keyof typeof subjectColors] || 'from-gray-500/20 to-gray-600/20 border-gray-400/40 text-gray-300'} px-3 py-1.5 text-sm font-medium`}>
                                              {lesson.subject}
                                            </Badge>
                                            {(() => {
                                              try {
                                                const lessonStatus = getLessonStatus(lesson)
                                                if (lessonStatus.status === 'live') {
                                                  return (
                                                    <Badge className="bg-gradient-to-r from-red-500/30 to-red-600/30 border-red-400/50 text-red-200 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium animate-pulse">
                                                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                                      LIVE
                                                    </Badge>
                                                  )
                                                } else if (lessonStatus.status === 'future') {
                                                  return (
                                                    <Badge className="bg-gradient-to-r from-orange-500/30 to-orange-600/30 border-orange-400/50 text-orange-200 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium">
                                                      <Clock className="w-3 h-3" />
                                                      Upcoming
                                                    </Badge>
                                                  )
                                                }
                                                return null
                                              } catch (error) {
                                                console.error('Error rendering status badge:', error)
                                                return null
                                              }
                                            })()}
                                            {lesson.videoUrl && (
                                              <Badge className="bg-gradient-to-r from-purple-500/30 to-purple-600/30 border-purple-400/50 text-purple-200 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium">
                                                <Video className="w-4 h-4" />
                                                Video
                                              </Badge>
                                            )}
                                          </div>
                                        </div>

                                        {/* Subtopic */}
                                        {lesson.subtopic && (
                                          <p className="text-gray-300 text-base">
                                            Topic: {lesson.subtopic}
                                          </p>
                                        )}

                                        {/* Details grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                          <div className="flex items-center text-gray-300">
                                            <Clock className="w-5 h-5 mr-3 text-amber-400" />
                                            <span className="font-medium">{lesson.duration}</span>
                                          </div>
                                          <div className="flex items-center text-gray-300">
                                            <User className="w-5 h-5 mr-3 text-blue-400" />
                                            <span className="truncate">{lesson.instructor}</span>
                                          </div>
                                          {lesson.grade && (
                                            <div className="flex items-center text-gray-300">
                                              <BookOpen className="w-5 h-5 mr-3 text-green-400" />
                                              <span className="truncate">Grade {lesson.grade}</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Schedule info */}
                                        {(lesson.week || lesson.scheduledDate) && (
                                          <div className="flex items-center gap-6 text-sm text-gray-400">
                                            {lesson.week && (
                                              <div className="flex items-center">
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                Week {lesson.week}
                                              </div>
                                            )}
                                            {lesson.scheduledDate && (() => {
                                              try {
                                                const date = new Date(lesson.scheduledDate)
                                                if (!isNaN(date.getTime())) {
                                                  return (
                                                    <div className="flex items-center">
                                                      <Clock className="w-4 h-4 mr-2" />
                                                      {date.toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                      })}
                                                    </div>
                                                  )
                                                }
                                              } catch (error) {
                                                console.error('Error formatting date:', error)
                                                return (
                                                  <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Scheduled
                                                  </div>
                                                )
                                              }
                                              return null
                                            })()}
                                          </div>
                                        )}
                                      </div>

                                      {/* Right section - Action button */}
                                      <div className="flex-shrink-0">
                                        {(() => {
                                          try {
                                            const lessonStatus = getLessonStatus(lesson)
                                            const isDisabled = lessonStatus.status === 'future'
                                            
                                            return (
                                              <Button 
                                                className={`w-full lg:w-auto ${lessonStatus.buttonClass} shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold ${isDisabled ? 'opacity-60 cursor-not-allowed hover:shadow-none' : ''}`}
                                                disabled={isDisabled}
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  if (!isDisabled) {
                                                    window.location.href = `/lesson/${lesson.id}`
                                                  }
                                                }}
                                              >
                                                {lessonStatus.buttonText}
                                                {lessonStatus.status === 'live' && (
                                                  <div className="w-2 h-2 bg-red-400 rounded-full ml-2 animate-pulse"></div>
                                                )}
                                                {lessonStatus.status === 'future' && lesson.scheduledDate && (() => {
                                                  try {
                                                    const date = new Date(lesson.scheduledDate)
                                                    if (!isNaN(date.getTime())) {
                                                      return (
                                                        <div className="ml-2 text-xs opacity-75">
                                                          {date.toLocaleTimeString('en-US', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                          })}
                                                        </div>
                                                      )
                                                    }
                                                  } catch (error) {
                                                    console.error('Error formatting time:', error)
                                                  }
                                                  return null
                                                })()}
                                              </Button>
                                            )
                                          } catch (error) {
                                            console.error('Error rendering lesson button:', error)
                                            return (
                                              <Button 
                                                className="w-full lg:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  window.location.href = `/lesson/${lesson.id}`
                                                }}
                                              >
                                                Watch Lesson
                                              </Button>
                                            )
                                          }
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/[0.08] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                                  <CalendarIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                  {searchQuery ? 'No matching classes found' : `No classes scheduled for ${day}`}
                                </h3>
                                <p className="text-gray-400">
                                  {searchQuery ? 'Try adjusting your search terms' : 'Your schedule is free for this day'}
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </div>
              </AnimatedCard>
            </div>
        </ResponsiveContainer>
        {/* Bottom padding for scroll safety */}
        <div className="h-20"></div>
      </main>

      {/* Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-lg bg-slate-900/95 backdrop-blur-3xl border border-white/30 rounded-3xl shadow-2xl shadow-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/10 to-pink-500/10 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="pb-6 border-b border-white/20">
              <DialogTitle className="text-white flex items-center text-xl font-bold">
                <CalendarIcon className="w-6 h-6 mr-3 text-blue-400" />
                Select Date
              </DialogTitle>
            </DialogHeader>
            <div className="pt-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-3xl bg-white/[0.05] backdrop-blur-3xl border border-white/20 p-4"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center text-white text-lg font-semibold",
                  caption_label: "text-base font-bold",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-8 w-8 bg-white/15 hover:bg-white/25 rounded-xl transition-colors text-white font-medium",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-gray-400 rounded-lg w-10 font-semibold text-sm",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative",
                  day: "h-10 w-10 p-0 font-semibold text-white hover:bg-white/25 rounded-xl transition-colors",
                  day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                  day_today: "bg-white/15 text-white font-bold border border-white/30",
                  day_outside: "text-gray-600 opacity-50",
                  day_disabled: "text-gray-600 opacity-50",
                  day_range_middle: "bg-blue-500/30 text-white",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
