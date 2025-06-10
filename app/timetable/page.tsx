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
import { BookOpen, Plus, Video, User, Clock, Search, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
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
  const { showPreloader, mounted: preloaderMounted } = usePreloader({ delay: 2000 })

  useEffect(() => {
    setMounted(true)
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
        
        // Organize lessons by day of week (simple distribution)
        const organizedSchedule: Record<string, TimetableLesson[]> = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: []
        }
        
        // Simple distribution across days
        transformedLessons.forEach((lesson, index) => {
          const dayIndex = index % 7
          const dayName = daysOfWeek[dayIndex]
          organizedSchedule[dayName].push(lesson)
        })
        
        setSchedule(organizedSchedule)
        
      } catch (error) {
        console.error("Failed to fetch lessons:", error)
        setLessons([])
        setSchedule({
          Monday: [], Tuesday: [], Wednesday: [], Thursday: [], 
          Friday: [], Saturday: [], Sunday: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7))
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

  const filteredClasses = (schedule[selectedDay] || []).filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.subtopic && lesson.subtopic.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (showPreloader || !preloaderMounted || isLoading) {
    return <Preloader isVisible={showPreloader || !preloaderMounted || isLoading} colorScheme="blue" loadingText="Loading your class schedule and timetable" />
  }

  if (!mounted) return null

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #581c87 100%)',
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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #581c87 100%)'
        }}
      />
      
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
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4 z-10" />
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
                  className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-lg transition-all duration-300"></div>
                  <Filter className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Filter</span>
                </Button>
                <Button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Plus className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Add Event</span>
                </Button>
              </div>
            }
          />

          <div className="space-y-8 mb-8">
            {/* Main Schedule Area */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <AnimatedCard delay={200}>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                  <CardHeader className="pb-6 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center text-xl">
                        <Calendar className="w-6 h-6 mr-3 text-emerald-400" />
                        Weekly Schedule
                      </CardTitle>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCurrentWeek(currentWeek - 1)}
                          className="group/nav relative bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white hover:text-blue-300 transition-all duration-300 border border-white/20 hover:border-white/30 rounded-lg overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover/nav:from-blue-500/20 group-hover/nav:to-purple-500/20 transition-all duration-300"></div>
                          <ChevronLeft className="w-5 h-5 relative z-10" />
                        </Button>
                        <div className="text-center px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg">
                          <div className="text-sm font-medium text-white">
                            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {weekDates[0].getFullYear()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCurrentWeek(currentWeek + 1)}
                          className="group/nav relative bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white hover:text-blue-300 transition-all duration-300 border border-white/20 hover:border-white/30 rounded-lg overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover/nav:from-blue-500/20 group-hover/nav:to-purple-500/20 transition-all duration-300"></div>
                          <ChevronRight className="w-5 h-5 relative z-10" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
                      <TabsList className="bg-white/10 backdrop-blur-xl border border-white/20 grid grid-cols-7 w-full h-full mb-6 p-2 rounded-xl shadow-xl">
                        {daysOfWeek.map((day, index) => {
                          const date = weekDates[index]
                          const today = isToday(date)
                          return (
                            <TabsTrigger
                              key={day}
                              value={day}
                              className={cn(
                                "w-full h-full text-sm font-medium px-3 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group/tab",
                                today && "ring-2 ring-amber-400/50"
                              )}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover/tab:from-blue-500/20 group-hover/tab:to-purple-500/20 transition-all duration-300"></div>
                              <div className="text-center relative z-10">
                                <div className="font-semibold">{day.slice(0, 3)}</div>
                                <div className={cn(
                                  "text-xs mt-1 px-2 py-1 rounded-full transition-all duration-300",
                                  today 
                                    ? "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 font-bold shadow-lg" 
                                    : "text-gray-400 group-hover/tab:text-white"
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
                          <div className="space-y-4">
                            {filteredClasses.length > 0 ? (
                              filteredClasses.map((lesson, index) => (
                                <div
                                  key={lesson.id}
                                  className="group p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-500 cursor-pointer border border-white/10 hover:border-white/30 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden"
                                  style={{ 
                                    animationDelay: `${(index + 3) * 100}ms`,
                                    transform: `translateY(${mounted ? 0 : 30}px)`,
                                    opacity: mounted ? 1 : 0,
                                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${(index + 3) * 100}ms`
                                  }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                  <div className="flex items-start justify-between relative z-10">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-3 mb-4">
                                        <h4 className="font-bold text-white text-lg leading-tight group-hover:text-blue-300 transition-colors">
                                          {lesson.title}
                                        </h4>
                                        <Badge className={`bg-gradient-to-r ${subjectColors[lesson.subject as keyof typeof subjectColors] || 'from-gray-500/20 to-gray-600/20 border-gray-400/40 text-gray-300'} px-3 py-1 shadow-lg`}>
                                          {lesson.subject}
                                        </Badge>
                                        {lesson.videoUrl && (
                                          <Badge className="bg-gradient-to-r from-red-500/30 to-red-600/30 border-red-400/50 text-red-200 flex items-center gap-1.5 px-3 py-1 shadow-lg">
                                            <Video className="w-4 h-4" />
                                            <span className="font-medium">Video</span>
                                          </Badge>
                                        )}
                                      </div>
                                      {lesson.subtopic && (
                                        <p className="text-gray-300 text-sm mb-3">
                                          Topic: {lesson.subtopic}
                                        </p>
                                      )}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                        <div className="flex items-center text-gray-300">
                                          <Clock className="w-4 h-4 mr-3 text-amber-400" />
                                          <span className="font-medium">{lesson.duration}</span>
                                        </div>
                                        <div className="flex items-center text-gray-300">
                                          <User className="w-4 h-4 mr-3 text-blue-400" />
                                          <span className="truncate">{lesson.instructor}</span>
                                        </div>
                                        {lesson.grade && (
                                          <div className="flex items-center text-gray-300">
                                            <BookOpen className="w-4 h-4 mr-3 text-green-400" />
                                            <span className="truncate">Grade {lesson.grade}</span>
                                          </div>
                                        )}
                                      </div>
                                      {(lesson.week || lesson.scheduledDate) && (
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                          {lesson.week && (
                                            <div className="flex items-center">
                                              <Calendar className="w-3 h-3 mr-1" />
                                              Week {lesson.week}
                                            </div>
                                          )}
                                          {lesson.scheduledDate && (
                                            <div className="flex items-center">
                                              <Clock className="w-3 h-3 mr-1" />
                                              {lesson.scheduledDate}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <Button className="ml-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group/btn relative overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                                      <span className="relative z-10">
                                        {lesson.videoUrl ? "Watch Lesson" : "Start Lesson"}
                                      </span>
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                                  <Calendar className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                  {searchQuery ? 'No matching classes found' : `No classes scheduled for ${day}`}
                                </h3>
                                <p className="text-gray-400 mb-6">
                                  {searchQuery ? 'Try adjusting your search terms' : 'Your schedule is free for this day'}
                                </p>
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group/btn relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                                  <Plus className="w-4 h-4 mr-2 relative z-10" />
                                  <span className="relative z-10">Add New Class</span>
                                </Button>
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
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  )
}
