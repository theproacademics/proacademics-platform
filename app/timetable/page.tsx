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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
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
  GraduationCap
} from "lucide-react"
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
  Mathematics: "from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-200",
  Physics: "from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200",
  Chemistry: "from-purple-500/20 to-violet-500/20 border-purple-400/30 text-purple-200",
  Biology: "from-orange-500/20 to-amber-500/20 border-orange-400/30 text-orange-200",
  "Computer Science": "from-indigo-500/20 to-blue-500/20 border-indigo-400/30 text-indigo-200",
  English: "from-pink-500/20 to-rose-500/20 border-pink-400/30 text-pink-200",
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
          title: lesson.title,
          subject: lesson.subject,
          subtopic: lesson.subtopic,
          instructor: lesson.instructor || 'ProAcademics Team',
          duration: lesson.duration || '90 min',
          videoUrl: lesson.videoUrl,
          scheduledDate: lesson.scheduledDate,
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
      return {
        status: 'available',
        buttonText: 'Watch Now',
        buttonClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
      }
    }

    const now = new Date()
    const lessonDate = new Date(lesson.scheduledDate)
    
    if (isNaN(lessonDate.getTime())) {
      return {
        status: 'available',
        buttonText: 'Watch Now',
        buttonClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
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
    const tenMinutesBefore = new Date(lessonDate.getTime() - 10 * 60000)
    
    if (now >= tenMinutesBefore && now <= lessonEndTime) {
      return {
        status: 'live',
        buttonText: 'Join Live',
        buttonClass: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white animate-pulse'
      }
    } else if (now < tenMinutesBefore) {
      return {
        status: 'future',
        buttonText: 'Scheduled',
        buttonClass: 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
      }
    } else {
      return {
        status: 'past',
        buttonText: 'Watch Replay',
        buttonClass: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
      }
    }
  }

  const filteredClasses = (() => {
    const dayLessons = schedule[selectedDay] || []
    return dayLessons.filter((lesson) => {
      if (!lesson || !lesson.title) return false
      
      const matchesSearch = (lesson.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.instructor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.subtopic && lesson.subtopic.toLowerCase().includes(searchQuery.toLowerCase()))
      
      if (lesson.scheduledDate) {
        const lessonDate = new Date(lesson.scheduledDate)
        const dayIndex = daysOfWeek.indexOf(selectedDay)
        
        if (dayIndex !== -1 && weekDates[dayIndex] && !isNaN(lessonDate.getTime())) {
          const selectedDate = weekDates[dayIndex]
          return matchesSearch && lessonDate.toDateString() === selectedDate.toDateString()
        }
      }
      
      return matchesSearch
    })
  })()

  if (showPreloader || !preloaderMounted || isLoading) {
    return <Preloader isVisible={showPreloader || !preloaderMounted || isLoading} colorScheme="blue" loadingText="Loading your class schedule" />
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="lg:ml-72 min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="My Timetable"
            description="Your personalized schedule with smart notifications and quick access"
            actions={
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search classes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 rounded-lg"
                  />
                </div>
              </div>
            }
          />

          <div className="space-y-6 mb-10">
            {/* Compact Weekly Schedule */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
              <CardHeader className="pb-4">
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
                      <Target className="w-3 h-3 mr-1" />
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
              
              <CardContent>
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
                  <div className="bg-white/10 border border-white/20 grid grid-cols-7 w-full p-1 rounded-lg">
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
                        className="group p-4 rounded-lg bg-white/10 backdrop-blur-xl hover:bg-white/15 transition-all duration-200 cursor-pointer border border-white/20 hover:border-white/30"
                        onClick={() => window.location.href = `/lesson/${lesson.id}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-semibold text-white text-lg leading-tight">
                                {lesson.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge className={`bg-gradient-to-r ${subjectColors[lesson.subject as keyof typeof subjectColors] || 'from-gray-500/20 to-gray-600/20 border-gray-400/30 text-gray-300'} px-2 py-1 text-xs font-medium border`}>
                                  {lesson.subject}
                                </Badge>
                                {(() => {
                                  const lessonStatus = getLessonStatus(lesson)
                                  if (lessonStatus.status === 'live') {
                                    return (
                                      <Badge className="bg-gradient-to-r from-red-500/30 to-red-600/30 border-red-400/50 text-red-200 flex items-center gap-1 px-2 py-1 text-xs font-medium animate-pulse border">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                        LIVE
                                      </Badge>
                                    )
                                  } else if (lessonStatus.status === 'future') {
                                    return (
                                      <Badge className="bg-gradient-to-r from-orange-500/30 to-orange-600/30 border-orange-400/50 text-orange-200 flex items-center gap-1 px-2 py-1 text-xs font-medium border">
                                        <Clock className="w-3 h-3" />
                                        Upcoming
                                      </Badge>
                                    )
                                  }
                                  return null
                                })()}
                                {lesson.videoUrl && (
                                  <Badge className="bg-gradient-to-r from-purple-500/30 to-purple-600/30 border-purple-400/50 text-purple-200 flex items-center gap-1 px-2 py-1 text-xs font-medium border">
                                    <Video className="w-3 h-3" />
                                    Video
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {lesson.subtopic && (
                              <p className="text-gray-300 text-sm">Topic: {lesson.subtopic}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1.5 text-amber-400" />
                                {lesson.duration}
                              </div>
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1.5 text-blue-400" />
                                <span className="truncate">{lesson.instructor}</span>
                              </div>
                              {lesson.grade && (
                                <div className="flex items-center">
                                  <GraduationCap className="w-4 h-4 mr-1.5 text-green-400" />
                                  Grade {lesson.grade}
                                </div>
                              )}
                            </div>

                            {lesson.scheduledDate && (() => {
                              const date = new Date(lesson.scheduledDate)
                              if (!isNaN(date.getTime())) {
                                return (
                                  <div className="flex items-center text-sm text-gray-400">
                                    <CalendarIcon className="w-4 h-4 mr-1.5" />
                                    {date.toLocaleDateString('en-US', { 
                                      weekday: 'short',
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>

                          <div className="flex-shrink-0">
                            {(() => {
                              const lessonStatus = getLessonStatus(lesson)
                              const isDisabled = lessonStatus.status === 'future'
                              
                              return (
                                <Button 
                                  className={`w-full lg:w-auto ${lessonStatus.buttonClass} transition-all duration-200 px-6 py-2 text-sm font-medium ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                                  disabled={isDisabled}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (!isDisabled) {
                                      window.location.href = `/lesson/${lesson.id}`
                                    }
                                  }}
                                >
                                  {lessonStatus.status === 'live' && <Play className="w-4 h-4 mr-1.5" />}
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
                        {searchQuery ? 'No matching classes found' : `No classes scheduled for ${selectedDay}`}
                      </h3>
                      <p className="text-gray-400">
                        {searchQuery ? 'Try adjusting your search terms' : 'Your schedule is free for this day'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ResponsiveContainer>
      </main>

      {/* Enhanced Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-sm bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          
          <div className="relative z-10">
            <DialogHeader className="pb-4 border-b border-white/20">
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
            
            <div className="p-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="w-full"
                  classNames={{
                    months: "flex w-full",
                    month: "w-full space-y-4",
                    caption: "flex justify-between items-center mb-4 px-0",
                    caption_label: "text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent",
                    nav: "flex items-center space-x-2",
                    nav_button: "h-8 w-8 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-lg transition-all duration-200 text-white flex items-center justify-center disabled:opacity-50 border border-white/20 hover:border-white/30",
                    nav_button_previous: "",
                    nav_button_next: "",
                    table: "w-full",
                    head_row: "flex w-full mb-3",
                    head_cell: "text-gray-300 w-full text-center py-2 text-sm font-semibold",
                    row: "flex w-full mb-1",
                    cell: "w-full text-center p-0.5",
                    day: "h-9 w-full p-0 font-semibold text-white hover:bg-white/20 hover:scale-105 rounded-lg transition-all duration-200 flex items-center justify-center text-sm border border-transparent hover:border-white/20",
                    day_selected: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-blue-400/40 shadow-lg scale-105",
                    day_today: "bg-white/15 text-white font-black border-2 border-amber-400/80 shadow-lg shadow-amber-400/20",
                    day_outside: "text-gray-500 opacity-40",
                    day_disabled: "text-gray-600 opacity-20",
                    day_range_middle: "bg-blue-500/30 text-white",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
