"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Play, Clock, Star, Search, Users, ArrowRight, User, Video, Award, ChevronLeft, ChevronRight, GraduationCap, ExternalLink, Target, Calendar as CalendarIcon, AlignLeft } from "lucide-react"

// Helper function to get YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Helper function to get video thumbnail
const getVideoThumbnail = (videoUrl: string): string | null => {
  if (!videoUrl) return null
  
  // For YouTube videos, get thumbnail
  const youtubeId = getYouTubeVideoId(videoUrl)
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
  }
  
  // For other video URLs, return null (will show placeholder)
  return null
}

// Helper function to check if URL is a streaming URL
const isStreamingUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
}



// Subject colors for consistent theming (matching timetable)
const subjectColors = {
  Mathematics: "from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-200",
  Physics: "from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200",
  Chemistry: "from-purple-500/20 to-violet-500/20 border-purple-400/30 text-purple-200",
  Biology: "from-orange-500/20 to-amber-500/20 border-orange-400/30 text-orange-200",
  "Computer Science": "from-indigo-500/20 to-blue-500/20 border-indigo-400/30 text-indigo-200",
  English: "from-pink-500/20 to-rose-500/20 border-pink-400/30 text-pink-200",
}



// Define the lesson type for the frontend component (matching timetable)
interface Lesson {
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
  description?: string; // Lesson description
}

// Lesson status function (matching timetable)
const getLessonStatus = (lesson: Lesson) => {
  if (!lesson.scheduledDate) {
    // No scheduled date - default to join lesson
    return {
      status: 'future',
      buttonText: 'Watch Now',
      buttonClass: 'bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:border-white/50 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl shadow-white/10 hover:shadow-white/20'
    }
  }

  const now = new Date()
  const lessonDate = new Date(lesson.scheduledDate)
  
  if (isNaN(lessonDate.getTime())) {
    // Invalid date - default to join lesson
    return {
      status: 'future',
      buttonText: 'Watch Now',
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
      buttonText: 'Watch Now',
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

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")

  const [dataReady, setDataReady] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const { showPreloader } = usePreloader({ 
    delay: 800,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/lessons?limit=1000&status=active')
        const apiResult = await response.json()
        
        const apiLessons = apiResult.lessons || []
        const transformedLessons: Lesson[] = apiLessons.map((lesson: any) => ({
          id: lesson.id,
          lessonName: lesson.lessonName,
          topic: lesson.topic || lesson.subtopic || 'General Topic',
          subject: lesson.subject,
          program: lesson.program || lesson.course,
          type: lesson.type || 'Lesson',
          scheduledDate: lesson.scheduledDate,
          time: lesson.time,
          duration: lesson.duration || '60 min',
          teacher: lesson.teacher || lesson.instructor || 'ProAcademics Team',
          status: lesson.status,
          videoUrl: lesson.videoUrl,
          zoomLink: lesson.zoomLink,
          description: lesson.description || 'Join us for this exciting lesson!',
        }))
        
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

  // Get unique subjects from lessons data
  const subjects = ["all", ...Array.from(new Set(lessons.map(l => l.subject).filter(Boolean)))]

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = (lesson.topic || lesson.lessonName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lesson.teacher || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lesson.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || lesson.subject === selectedSubject

    return matchesSearch && matchesSubject
  })

  const handleLessonClick = (lessonId: string) => {
    window.location.href = `/lesson/${lessonId}?from=lessons`
  }

  // Get featured lessons (first 3 lessons)
  const featuredLessons = filteredLessons.slice(0, 3)

  // Auto-slide functionality
  useEffect(() => {
    if (featuredLessons.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredLessons.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [featuredLessons.length])

  // Manual navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredLessons.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredLessons.length) % featuredLessons.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (showPreloader || isLoading) {
    return <Preloader isVisible={showPreloader || isLoading} colorScheme="purple" loadingText="Loading lessons library..." />
  }

  return (
    <div className="min-h-screen relative">
      {/* Enhanced lessons page background with better particles */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Modern gradient background - darker and more sophisticated */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-transparent to-purple-900/30"></div>
        
        {/* Large atmospheric orbs - more subtle */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-3/4 left-1/3 w-72 h-72 bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
        
        {/* Refined floating particles - fewer but better quality */}
        {[...Array(25)].map((_, i) => {
          const size = Math.random() * 3 + 1;
          const opacity = Math.random() * 0.6 + 0.2;

  return (
    <div 
              key={i}
              className="absolute rounded-full bg-white animate-float-slow"
      style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: opacity,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${Math.random() * 10 + 8}s`,
                filter: `blur(${Math.random() * 0.5}px)`,
              }}
            />
          );
        })}
        
        {/* Elegant geometric elements */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`geo-${i}`}
            className="absolute animate-float-slow opacity-20"
        style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${Math.random() * 15 + 10}s`
            }}
          >
            {i % 3 === 0 && (
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            )}
            {i % 3 === 1 && (
              <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400/50 to-transparent"></div>
            )}
            {i % 3 === 2 && (
              <div className="w-2 h-2 border border-blue-400/30 rounded-full"></div>
            )}
          </div>
        ))}
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30"></div>
        
        {/* Depth and atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
      </div>
      
      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Lessons Library
                </h1>
                <p className="text-slate-400">
                  Discover and learn from our comprehensive collection of lessons
                </p>
              </div>
            </div>
          </div>

          {/* Featured Lesson Carousel */}
          {featuredLessons.length > 0 && (
            <div className="mb-8">
              <div className="relative group overflow-hidden rounded-xl">
                {/* Carousel Container */}
                  <div className="relative">
                  {/* Slides */}
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {featuredLessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="w-full flex-shrink-0"
                      >
                        {/* Full-width YouTube Thumbnail */}
                        <div className="aspect-[16/7] relative overflow-hidden">
                          {lesson.videoUrl && getVideoThumbnail(lesson.videoUrl) ? (
                            <img 
                              src={getVideoThumbnail(lesson.videoUrl)!}
                              alt={lesson.topic}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                const youtubeId = lesson.videoUrl ? getYouTubeVideoId(lesson.videoUrl) : null
                                if (youtubeId && !target.src.includes('mqdefault')) {
                                  target.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                              <Video className="w-20 h-20 text-white/60" />
                            </div>
                          )}
                          
                          {/* Enhanced dark overlay for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          
                          {/* Content overlaid on thumbnail */}
                          <div className="absolute inset-0 p-6 lg:p-8 flex items-center">
                            <div className="max-w-2xl space-y-4">
                              {/* Recommended Badge */}
                              <div className="flex items-start gap-4">
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-2 text-sm font-bold">
                                  <Star className="w-4 h-4 mr-2 fill-current" />
                                  Recommended
                                </Badge>
                              </div>
                              
                              {/* Comprehensive Info Badges */}
                              <div className="flex flex-wrap items-center gap-2">
                                {lesson.subject && (
                                  <span className="inline-flex items-center bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-blue-400/40 text-blue-100 px-2.5 py-1.5 text-xs font-bold border rounded-md shadow-sm hover:shadow-md transition-all duration-200">
                                    {lesson.subject}
                                  </span>
                                )}
                                {lesson.program && (
                                  <span className="inline-flex items-center bg-gradient-to-r from-purple-500/25 to-indigo-500/25 border-purple-400/40 text-purple-100 px-2.5 py-1.5 text-xs font-bold border rounded-md shadow-sm hover:from-purple-500/35 hover:to-indigo-500/35 transition-all duration-200">
                                    {lesson.program}
                                  </span>
                                )}
                                {lesson.type && (
                                  <span className="inline-flex items-center bg-gradient-to-r from-green-500/25 to-green-600/25 border-green-400/40 text-green-100 gap-1.5 px-2.5 py-1.5 text-xs font-bold border rounded-md shadow-sm hover:shadow-md transition-all duration-200">
                                    {lesson.type === 'Lesson' && <GraduationCap className="w-3 h-3" />}
                                    {lesson.type === 'Tutorial' && <Video className="w-3 h-3" />}
                                    {lesson.type === 'Workshop' && <ExternalLink className="w-3 h-3" />}
                                    {!['Lesson', 'Tutorial', 'Workshop'].includes(lesson.type) && <Video className="w-3 h-3" />}
                                    {lesson.type}
                                  </span>
                                )}
                                <span className="inline-flex items-center bg-gradient-to-r from-amber-500/25 to-amber-600/25 border-amber-400/40 text-amber-100 gap-1.5 px-2.5 py-1.5 text-xs font-bold border rounded-md shadow-sm hover:shadow-md transition-all duration-200">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration}
                                </span>
                              </div>
                              
                              {/* Topic */}
                              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                                {lesson.topic}
                              </h2>
                              
                              {/* Description */}
                              <p className="text-white/90 text-lg leading-relaxed line-clamp-2 max-w-xl">
                                {lesson.description}
                              </p>
                              
                              {/* Teacher */}
                              <div className="flex items-center gap-6 text-white/80">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span className="font-medium">{lesson.teacher}</span>
                                </div>
                  </div>
                              
                              {/* Watch Now Button */}
                              <div className="pt-2">
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleLessonClick(lesson.id)
                                  }}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 text-lg font-semibold group-hover:scale-105 transition-all duration-300"
                                >
                                  <Play className="w-5 h-5 mr-2" />
                                  Watch Now
                                  <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                  </div>
                  </div>
                </div>
                

                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Navigation Arrows */}
                  {featuredLessons.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          prevSlide()
                        }}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          nextSlide()
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}
                  
                  {/* Pagination Dots */}
                  {featuredLessons.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {featuredLessons.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation()
                            goToSlide(index)
                          }}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            index === currentSlide 
                              ? 'bg-white scale-110' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                      <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          placeholder="Search lessons, topics, or teachers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-500/50"
                        />
                      </div>
                    </div>
              
              <div className="flex gap-3">
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject || ''}>
                              {subject === "all" ? "All Subjects" : subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 px-4 py-2 whitespace-nowrap"
                      >
                        Sort by Recent
                      </Button>
                    </div>
                  </div>
                </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-slate-400">
              Showing {filteredLessons.length} of {lessons.length} lessons
            </p>
          </div>

          {/* Lessons List - Enhanced UI with Time/Date Left and Thumbnails */}
          <div className="space-y-3">
            {filteredLessons.map((lesson) => {
              // Parse scheduled date and time
              const scheduledDate = lesson.scheduledDate ? new Date(lesson.scheduledDate) : new Date()
              const isValidDate = !isNaN(scheduledDate.getTime())
              
              // Extract time from scheduled date or use default
              const timeString = isValidDate 
                ? scheduledDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })
                : lesson.time || '2:30pm' // Use lesson.time or default
                
              // Format date
              const dateString = isValidDate
                ? scheduledDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Today' // Default date

              return (
                <div
                  key={lesson.id}
                  className="group p-4 lg:p-5 rounded-xl bg-white/8 backdrop-blur-2xl hover:bg-white/12 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl relative overflow-hidden hover:scale-[1.01]"
                >
                  {/* Subtle hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    {/* Left: Time and Date */}
                    <div className="flex-shrink-0 text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-white leading-tight">
                        {timeString}
                      </div>
                      <div className="text-sm text-slate-400 font-medium">
                        {lesson.duration || '20 min'}
                      </div>
                    </div>

                    {/* Video Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 relative">
                        {lesson.videoUrl && getVideoThumbnail(lesson.videoUrl) ? (
                          <img 
                            src={getVideoThumbnail(lesson.videoUrl)!}
                            alt={lesson.lessonName || lesson.topic}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              const youtubeId = lesson.videoUrl ? getYouTubeVideoId(lesson.videoUrl) : null
                              if (youtubeId && !target.src.includes('mqdefault')) {
                                target.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play className="w-3 h-3 text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Header with Lesson Name and Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-lg leading-tight">
                            {lesson.lessonName || lesson.topic || 'Untitled Lesson'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <span>{lesson.teacher}</span>
                            <span>•</span>
                            <span>{dateString}</span>
                          </div>
                        </div>
                        
                        {(() => {
                          const lessonStatus = getLessonStatus(lesson)
                          if (lessonStatus.status === 'live') {
                            return (
                              <Badge className="bg-gradient-to-r from-red-500/40 to-red-600/40 border-red-400/60 text-red-100 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold animate-pulse border shadow-lg rounded-full backdrop-blur-sm">
                                <div className="w-2 h-2 bg-red-300 rounded-full animate-ping"></div>
                                LIVE
                              </Badge>
                            )
                          } else if (lessonStatus.status === 'past') {
                            return (
                              <Badge className="bg-gradient-to-r from-gray-500/40 to-gray-600/40 border-gray-400/60 text-gray-100 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border shadow-lg rounded-full backdrop-blur-sm">
                                Completed
                              </Badge>
                            )
                          }
                          return null
                        })()}
                      </div>

                      {/* Program Badge */}
                      {lesson.program && (
                        <div className="inline-flex items-center bg-indigo-500/15 text-indigo-200 border border-indigo-400/25 px-2.5 py-1.5 text-xs font-medium rounded-md">
                          <Target className="w-3 h-3 mr-1.5" />
                          {lesson.program}
                        </div>
                      )}

                      {/* Subject Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {lesson.subject && (
                          <span className="inline-flex items-center bg-emerald-500/15 text-emerald-200 border border-emerald-400/25 px-2.5 py-1 text-xs font-semibold rounded-lg">
                            {lesson.subject}
                          </span>
                        )}
                        {lesson.type && (
                          <span className="inline-flex items-center bg-gradient-to-r from-purple-500/25 to-indigo-500/25 border-purple-400/40 text-purple-100 gap-1.5 px-2.5 py-1 text-xs font-bold border rounded-md shadow-sm hover:from-purple-500/35 hover:to-indigo-500/35 transition-all duration-200">
                            {lesson.type === 'Lesson' && <GraduationCap className="w-3 h-3" />}
                            {lesson.type === 'Tutorial' && <Video className="w-3 h-3" />}
                            {lesson.type === 'Workshop' && <ExternalLink className="w-3 h-3" />}
                            {lesson.type}
                          </span>
                        )}
                      </div>

                      {/* Lesson Description */}
                      {lesson.description && (
                        <div className="flex items-center bg-cyan-500/15 px-2.5 py-1.5 rounded-md border border-cyan-400/25">
                          <AlignLeft className="w-3 h-3 mr-1.5 text-cyan-400" />
                          <span className="text-cyan-200 font-medium text-xs truncate">
                            {lesson.description.length > 60 
                              ? lesson.description.substring(0, 60) + '...' 
                              : lesson.description
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
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
                                window.location.href = `/lesson/${lesson.id}?from=lessons`
                              } else {
                                // Live/Future lesson - join lesson (prefer zoom if available)
                                if (lesson.zoomLink) {
                                  window.open(lesson.zoomLink, '_blank')
                                } else {
                                  window.location.href = `/lesson/${lesson.id}?from=lessons`
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
              )
            })}
          </div>

          {/* Empty State */}
          {filteredLessons.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No lessons found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setSelectedSubject("all")
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
