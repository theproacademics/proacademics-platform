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
import { BookOpen, Play, Clock, Star, Search, Users, ArrowRight, User, Video, Award, ChevronLeft, ChevronRight, GraduationCap, ExternalLink } from "lucide-react"

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



// Subject colors for consistent theming
const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-500/10 border-blue-400/30 text-blue-300",
  Physics: "bg-green-500/10 border-green-400/30 text-green-300",
  Chemistry: "bg-purple-500/10 border-purple-400/30 text-purple-300",
  Biology: "bg-orange-500/10 border-orange-400/30 text-orange-300",
  "Computer Science": "bg-indigo-500/10 border-indigo-400/30 text-indigo-300",
  English: "bg-pink-500/10 border-pink-400/30 text-pink-300",
}

// Difficulty colors
const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-500/15 text-green-300 border-green-400/30",
  Intermediate: "bg-yellow-500/15 text-yellow-300 border-yellow-400/30",
  Advanced: "bg-red-500/15 text-red-300 border-red-400/30",
}

// Define the lesson type for the frontend component
interface Lesson {
  id: string;
  subject?: string;
  topic: string;
  program?: string;
  type?: string;
  duration: string;
  instructor: string;
  isLive: boolean;
  liveDate?: string;
  description: string;
  videoUrl?: string;
  zoomLink?: string;
  scheduledDate?: string;
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
          subject: lesson.subject,
          topic: lesson.subtopic || lesson.topic || 'General Topic',
          program: lesson.program || lesson.course,
          type: lesson.type || lesson.lessonType || 'Regular',
          duration: lesson.duration || '30 min',
          instructor: lesson.teacher || lesson.instructor || 'ProAcademics Team',
          isLive: lesson.status === 'active',
          liveDate: lesson.scheduledDate,
          description: lesson.description || 'Join us for this exciting lesson!',
          videoUrl: lesson.videoUrl,
          zoomLink: lesson.zoomLink,
          scheduledDate: lesson.scheduledDate,
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
    const matchesSearch = (lesson.topic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lesson.instructor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                                  <span className="font-medium">{lesson.instructor}</span>
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
                          placeholder="Search lessons, topics, or instructors..."
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

          {/* Lessons List */}
          <div className="space-y-4">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="group p-4 lg:p-5 rounded-xl bg-white/8 backdrop-blur-2xl hover:bg-white/12 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl relative overflow-hidden hover:scale-[1.01]"
              >
                {/* Subtle hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 relative z-10">
                  {/* Left side - Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 relative">
                      {lesson.videoUrl && getVideoThumbnail(lesson.videoUrl) ? (
                        <img 
                          src={getVideoThumbnail(lesson.videoUrl)!}
                          alt={lesson.topic}
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
                      
                      {/* Small overlay for consistency */}
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 space-y-3">
                    {/* Title and main badges */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-white text-lg leading-tight">
                          {lesson.topic}
                        </h3>
                        
                        {/* Main info badges */}
                        <div className="flex items-center gap-2 flex-wrap">
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
                              <Video className="w-3 h-3" />
                              {lesson.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Secondary info */}
                    <div className="flex flex-wrap items-center gap-2.5 text-sm">
                      {lesson.duration && (
                        <div className="flex items-center bg-amber-500/15 px-2.5 py-1.5 rounded-md border border-amber-400/25">
                          <Clock className="w-3 h-3 mr-1.5 text-amber-400" />
                          <span className="text-amber-200 font-medium text-xs">{lesson.duration}</span>
                        </div>
                      )}
                      {lesson.instructor && (
                        <div className="flex items-center bg-emerald-500/15 px-2.5 py-1.5 rounded-md border border-emerald-400/25">
                          <User className="w-3 h-3 mr-1.5 text-emerald-400" />
                          <span className="text-emerald-200 font-medium text-xs truncate max-w-[120px]">{lesson.instructor}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {lesson.description && (
                      <div className="bg-slate-500/15 px-2.5 py-2 rounded-md border border-slate-400/25">
                        <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right side - Action button */}
                  <div className="flex-shrink-0 flex sm:justify-end">
                    <Button 
                      className="bg-gradient-to-r from-violet-500/80 to-purple-600/80 hover:from-violet-500 hover:to-purple-600 text-white border border-violet-400/50 hover:border-violet-400/70 transition-all duration-200 px-6 py-2.5 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLessonClick(lesson.id)
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
