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
import { Calendar, Clock, MapPin, User, BookOpen, Plus, ChevronLeft, ChevronRight, Video, Users, Bell, Filter, Search, Star, Zap, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Enhanced mock data with more realistic content
const timeSlots = Array.from({ length: 12 }, (_, i) => {
  const hour = 8 + i
  return `${hour.toString().padStart(2, '0')}:00`
})

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const mockSchedule = {
  Monday: [
    {
      id: "1",
      title: "Advanced Calculus",
      subject: "Mathematics",
      time: "09:00 - 10:30",
      instructor: "Dr. Sarah Chen",
      location: "Math Lab 101",
      type: "live",
      color: "blue",
      participants: 24,
      duration: 90,
      difficulty: "advanced",
      rating: 4.8,
    },
    {
      id: "2",
      title: "Quantum Physics Lab",
      subject: "Physics",
      time: "14:00 - 15:30",
      instructor: "Prof. Michael Rodriguez",
      location: "Physics Lab 2",
      type: "in-person",
      color: "green",
      participants: 16,
      duration: 90,
      difficulty: "intermediate",
      rating: 4.9,
    },
  ],
  Tuesday: [
    {
      id: "3",
      title: "Organic Chemistry",
      subject: "Chemistry",
      time: "10:00 - 11:30",
      instructor: "Dr. Emily Watson",
      location: "Chemistry Room 203",
      type: "live",
      color: "purple",
      participants: 28,
      duration: 90,
      difficulty: "advanced",
      rating: 4.7,
    },
    {
      id: "4",
      title: "Biology Study Circle",
      subject: "Biology",
      time: "15:00 - 16:00",
      instructor: "Dr. James Liu",
      location: "Virtual Meeting",
      type: "group",
      color: "orange",
      participants: 12,
      duration: 60,
      difficulty: "beginner",
      rating: 4.6,
    },
  ],
  Wednesday: [
    {
      id: "5",
      title: "Calculus Workshop",
      subject: "Mathematics",
      time: "11:00 - 12:30",
      instructor: "Dr. Sarah Chen",
      location: "Workshop Room 101",
      type: "workshop",
      color: "blue",
      participants: 20,
      duration: 90,
      difficulty: "intermediate",
      rating: 4.8,
    },
    {
      id: "10",
      title: "Data Structures",
      subject: "Computer Science",
      time: "16:00 - 17:30",
      instructor: "Prof. Alex Kumar",
      location: "CS Lab 301",
      type: "live",
      color: "indigo",
      participants: 32,
      duration: 90,
      difficulty: "advanced",
      rating: 4.9,
    },
  ],
  Thursday: [
    {
      id: "6",
      title: "Theoretical Physics",
      subject: "Physics",
      time: "09:30 - 11:00",
      instructor: "Prof. Michael Rodriguez",
      location: "Lecture Hall 105",
      type: "live",
      color: "green",
      participants: 45,
      duration: 90,
      difficulty: "advanced",
      rating: 4.8,
    },
    {
      id: "7",
      title: "Analytical Chemistry",
      subject: "Chemistry",
      time: "13:00 - 14:30",
      instructor: "Dr. Emily Watson",
      location: "Chemistry Lab 1",
      type: "in-person",
      color: "purple",
      participants: 18,
      duration: 90,
      difficulty: "intermediate",
      rating: 4.7,
    },
  ],
  Friday: [
    {
      id: "8",
      title: "Mathematics Assessment",
      subject: "Mathematics",
      time: "10:00 - 11:00",
      instructor: "Dr. Sarah Chen",
      location: "Exam Hall 101",
      type: "assessment",
      color: "red",
      participants: 35,
      duration: 60,
      difficulty: "advanced",
      rating: 4.5,
    },
    {
      id: "9",
      title: "Literature Discussion",
      subject: "English",
      time: "14:00 - 15:30",
      instructor: "Prof. Jane Smith",
      location: "Literature Room 205",
      type: "group",
      color: "pink",
      participants: 22,
      duration: 90,
      difficulty: "beginner",
      rating: 4.6,
    },
  ],
  Saturday: [
    {
      id: "11",
      title: "Weekend Math Clinic",
      subject: "Mathematics",
      time: "10:00 - 12:00",
      instructor: "Dr. Sarah Chen",
      location: "Help Center",
      type: "workshop",
      color: "blue",
      participants: 15,
      duration: 120,
      difficulty: "intermediate",
      rating: 4.9,
    },
  ],
  Sunday: [],
}

const upcomingClasses = [
  {
    id: "next-1",
    title: "Advanced Calculus",
    subject: "Mathematics",
    time: "Tomorrow 09:00",
    instructor: "Dr. Sarah Chen",
    type: "live",
    location: "Math Lab 101",
    urgent: true,
  },
  {
    id: "next-2",
    title: "Organic Chemistry",
    subject: "Chemistry",
    time: "Tomorrow 10:00",
    instructor: "Dr. Emily Watson",
    type: "live",
    location: "Chemistry Room 203",
    urgent: false,
  },
  {
    id: "next-3",
    title: "Quantum Physics Lab",
    subject: "Physics",
    time: "Tomorrow 14:00",
    instructor: "Prof. Michael Rodriguez",
    type: "in-person",
    location: "Physics Lab 2",
    urgent: false,
  },
]

const typeColors = {
  live: "from-blue-500/30 via-cyan-500/30 to-blue-600/30 border-blue-400/50 text-blue-200",
  "in-person": "from-emerald-500/30 via-green-500/30 to-emerald-600/30 border-emerald-400/50 text-emerald-200",
  workshop: "from-purple-500/30 via-violet-500/30 to-purple-600/30 border-purple-400/50 text-purple-200",
  group: "from-orange-500/30 via-amber-500/30 to-orange-600/30 border-orange-400/50 text-orange-200",
  assessment: "from-red-500/30 via-rose-500/30 to-red-600/30 border-red-400/50 text-red-200",
}

const typeIcons = {
  live: <Video className="w-4 h-4" />,
  "in-person": <MapPin className="w-4 h-4" />,
  workshop: <BookOpen className="w-4 h-4" />,
  group: <Users className="w-4 h-4" />,
  assessment: <Clock className="w-4 h-4" />,
}

const subjectColors = {
  Mathematics: "from-blue-500/20 to-cyan-500/20 border-blue-400/40 text-blue-300",
  Physics: "from-green-500/20 to-emerald-500/20 border-green-400/40 text-green-300",
  Chemistry: "from-purple-500/20 to-violet-500/20 border-purple-400/40 text-purple-300",
  Biology: "from-orange-500/20 to-amber-500/20 border-orange-400/40 text-orange-300",
  "Computer Science": "from-indigo-500/20 to-blue-500/20 border-indigo-400/40 text-indigo-300",
  English: "from-pink-500/20 to-rose-500/20 border-pink-400/40 text-pink-300",
}

const difficultyColors = {
  beginner: "from-green-500/20 to-emerald-500/20 text-green-300",
  intermediate: "from-yellow-500/20 to-amber-500/20 text-yellow-300",
  advanced: "from-red-500/20 to-rose-500/20 text-red-300",
}

export default function TimetablePage() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [viewMode, setViewMode] = useState<"week" | "calendar">("week")
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const { showPreloader, mounted: preloaderMounted } = usePreloader({ delay: 2000 })

  useEffect(() => {
    setMounted(true)
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

  const filteredClasses = mockSchedule[selectedDay as keyof typeof mockSchedule].filter(
    (class_) =>
      class_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      class_.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      class_.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (showPreloader || !preloaderMounted) {
    return <Preloader isVisible={showPreloader || !preloaderMounted} colorScheme="blue" loadingText="Loading your class schedule and timetable" />
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
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

          {/* View Mode Toggle with Glass Effect */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-1 rounded-xl shadow-2xl">
                <div className="flex items-center">
                  <Button
                    variant={viewMode === "week" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                    className={cn(
                      "relative transition-all duration-300 px-6 py-2 rounded-lg",
                      viewMode === "week" 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                        : "hover:bg-white/10 text-gray-300"
                    )}
                  >
                    Weekly View
                  </Button>
                  <Button
                    variant={viewMode === "calendar" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("calendar")}
                    className={cn(
                      "relative transition-all duration-300 px-6 py-2 rounded-lg",
                      viewMode === "calendar" 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                        : "hover:bg-white/10 text-gray-300"
                    )}
                  >
                    Calendar View
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8">
            {/* Upcoming Classes Sidebar with Enhanced Glass Effect */}
            <div className="xl:col-span-1 space-y-6">
              <div className="sticky top-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <AnimatedCard delay={100}>
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                      <CardHeader className="pb-4 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                        <CardTitle className="text-white flex items-center text-lg">
                          <div className="relative mr-3">
                            <Bell className="w-5 h-5 text-amber-400 animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                          </div>
                          Upcoming Classes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {upcomingClasses.map((class_, index) => (
                          <div
                            key={class_.id}
                            className={cn(
                              "group p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-500 cursor-pointer border border-white/10 hover:border-white/30 hover:shadow-xl relative overflow-hidden",
                              class_.urgent && "ring-2 ring-amber-400/50 animate-pulse"
                            )}
                            style={{ 
                              animationDelay: `${(index + 2) * 150}ms`,
                              transform: `translateY(${mounted ? 0 : 20}px)`,
                              opacity: mounted ? 1 : 0,
                              transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${(index + 2) * 150}ms`
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <div className="flex items-start justify-between mb-3 relative z-10">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white text-sm leading-tight mb-2 truncate group-hover:text-blue-300 transition-colors">
                                  {class_.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Badge className={`bg-gradient-to-r ${subjectColors[class_.subject as keyof typeof subjectColors]} text-xs px-2 py-1 shadow-lg`}>
                                    {class_.subject}
                                  </Badge>
                                  {class_.urgent && (
                                    <Badge className="bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-400/50 text-amber-200 text-xs px-2 py-1 animate-pulse">
                                      <Zap className="w-3 h-3 mr-1" />
                                      Urgent
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Badge className={`bg-gradient-to-r ${typeColors[class_.type as keyof typeof typeColors]} ml-2 flex items-center gap-1 shadow-lg`}>
                                {typeIcons[class_.type as keyof typeof typeIcons]}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-xs text-gray-300 relative z-10">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-2 text-amber-400" />
                                <span className="font-medium">{class_.time}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-2 text-blue-400" />
                                <span className="truncate">{class_.instructor}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-2 text-green-400" />
                                <span className="truncate">{class_.location}</span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full mt-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white border border-blue-400/30 hover:border-blue-400/50 backdrop-blur-sm transition-all duration-300 relative z-10 group/btn overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover/btn:from-blue-500/20 group-hover/btn:to-purple-500/20 transition-all duration-300"></div>
                              <span className="relative z-10">Join Class</span>
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </div>
                  </AnimatedCard>
                </div>
              </div>
            </div>

            {/* Main Schedule Area */}
            <div className="xl:col-span-4">
              {viewMode === "week" ? (
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
                          <TabsList className="bg-white/10 backdrop-blur-xl border border-white/20 grid grid-cols-7 w-full mb-6 h-auto p-2 rounded-xl shadow-xl">
                            {daysOfWeek.map((day, index) => {
                              const date = weekDates[index]
                              const today = isToday(date)
                              return (
                                <TabsTrigger
                                  key={day}
                                  value={day}
                                  className={cn(
                                    "text-sm font-medium px-3 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group/tab",
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
                                  filteredClasses.map((class_, index) => (
                                    <div
                                      key={class_.id}
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
                                              {class_.title}
                                            </h4>
                                            <Badge className={`bg-gradient-to-r ${subjectColors[class_.subject as keyof typeof subjectColors]} px-3 py-1 shadow-lg`}>
                                              {class_.subject}
                                            </Badge>
                                            <Badge className={`bg-gradient-to-r ${typeColors[class_.type as keyof typeof typeColors]} flex items-center gap-1.5 px-3 py-1 shadow-lg`}>
                                              {typeIcons[class_.type as keyof typeof typeIcons]}
                                              <span className="capitalize font-medium">{class_.type}</span>
                                            </Badge>
                                            <Badge className={`bg-gradient-to-r ${difficultyColors[class_.difficulty as keyof typeof difficultyColors]} px-2 py-1 text-xs`}>
                                              {class_.difficulty}
                                            </Badge>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                            <div className="flex items-center text-gray-300">
                                              <Clock className="w-4 h-4 mr-3 text-amber-400" />
                                              <span className="font-medium">{class_.time}</span>
                                            </div>
                                            <div className="flex items-center text-gray-300">
                                              <User className="w-4 h-4 mr-3 text-blue-400" />
                                              <span className="truncate">{class_.instructor}</span>
                                            </div>
                                            <div className="flex items-center text-gray-300">
                                              <MapPin className="w-4 h-4 mr-3 text-green-400" />
                                              <span className="truncate">{class_.location}</span>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                              <div className="flex items-center">
                                                <Users className="w-3 h-3 mr-1" />
                                                {class_.participants} students
                                              </div>
                                              <div className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {class_.duration} min
                                              </div>
                                              <div className="flex items-center">
                                                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                                                {class_.rating}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <Button className="ml-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group/btn relative overflow-hidden">
                                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                                          <span className="relative z-10">Join Class</span>
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
              ) : (
                /* Enhanced Calendar Grid View */
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <AnimatedCard delay={300}>
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                      <CardHeader>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
                        <CardTitle className="text-white text-xl flex items-center">
                          <Calendar className="w-6 h-6 mr-3 text-emerald-400" />
                          Calendar Grid View
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <div className="min-w-[800px]">
                            <div className="grid grid-cols-8 gap-2">
                              {/* Time column */}
                              <div className="space-y-2">
                                <div className="h-16 flex items-center justify-center text-sm font-semibold text-white border-b border-white/20 bg-white/10 backdrop-blur-sm rounded-t-lg">
                                  Time
                                </div>
                                {timeSlots.map((time, index) => (
                                  <div 
                                    key={time} 
                                    className="h-20 flex items-center justify-center text-xs text-gray-400 bg-white/5 backdrop-blur-sm rounded border border-white/10 hover:bg-white/10 transition-all duration-300"
                                    style={{
                                      animationDelay: `${index * 50}ms`,
                                      transform: `translateX(${mounted ? 0 : -20}px)`,
                                      opacity: mounted ? 1 : 0,
                                      transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms`
                                    }}
                                  >
                                    {time}
                                  </div>
                                ))}
                              </div>

                              {/* Day columns */}
                              {daysOfWeek.map((day, dayIndex) => {
                                const date = weekDates[dayIndex]
                                const today = isToday(date)
                                return (
                                  <div key={day} className="space-y-2">
                                    <div className={cn(
                                      "h-16 flex flex-col items-center justify-center text-sm font-semibold border-b border-white/20 rounded-t-lg backdrop-blur-sm transition-all duration-300",
                                      today 
                                        ? "bg-gradient-to-br from-amber-500/30 to-orange-500/30 text-amber-200 shadow-lg" 
                                        : "text-white bg-white/10 hover:bg-white/15"
                                    )}>
                                      <div>{day.slice(0, 3)}</div>
                                      <div className={cn(
                                        "text-xs mt-1 px-2 py-1 rounded-full transition-all duration-300",
                                        today 
                                          ? "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 font-bold shadow-lg" 
                                          : "text-gray-400"
                                      )}>
                                        {date.getDate()}
                                      </div>
                                    </div>
                                    {timeSlots.map((time, timeIndex) => (
                                      <div
                                        key={`${day}-${time}`}
                                        className="h-20 border border-white/10 rounded hover:bg-white/10 transition-all duration-300 cursor-pointer relative group/cell backdrop-blur-sm"
                                        style={{
                                          animationDelay: `${(dayIndex * timeSlots.length + timeIndex) * 20}ms`,
                                          transform: `translateY(${mounted ? 0 : 20}px)`,
                                          opacity: mounted ? 1 : 0,
                                          transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${(dayIndex * timeSlots.length + timeIndex) * 20}ms`
                                        }}
                                      >
                                        {/* Render classes that fall in this time slot */}
                                        {mockSchedule[day as keyof typeof mockSchedule]
                                          .filter((class_) => {
                                            const classStartTime = class_.time.split(" - ")[0]
                                            return classStartTime === time
                                          })
                                          .map((class_) => (
                                            <div
                                              key={class_.id}
                                              className="absolute inset-1 rounded-lg text-xs p-2 overflow-hidden bg-gradient-to-br from-blue-500/40 to-purple-500/40 border border-blue-400/50 hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-lg group/class"
                                              title={`${class_.title}\n${class_.instructor}\n${class_.location}`}
                                            >
                                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/class:translate-x-[100%] transition-transform duration-700"></div>
                                              <div className="relative z-10">
                                                <div className="font-semibold text-white truncate mb-1 group-hover/class:text-blue-200 transition-colors">{class_.title}</div>
                                                <div className="text-gray-300 truncate text-[10px]">{class_.instructor}</div>
                                                <div className="text-gray-400 truncate text-[10px]">{class_.location}</div>
                                              </div>
                                            </div>
                                          ))}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all duration-300 bg-white/5 backdrop-blur-sm rounded">
                                          <Plus className="w-4 h-4 text-gray-400 group-hover/cell:text-blue-400 transition-colors" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </AnimatedCard>
                </div>
              )}
            </div>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  )
}
