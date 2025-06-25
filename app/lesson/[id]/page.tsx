"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Video, User, Clock, Calendar, ArrowLeft, MessageSquare, Lock, Unlock, Play, Trophy, CheckCircle, Award, Target, GraduationCap, ExternalLink, AlignLeft } from "lucide-react"
import Link from "next/link"
import Particles from "@/components/ui/particles"

interface Lesson {
  _id?: string
  id: string
  lessonName?: string  // Lesson name
  topic?: string       // Topic/title of the lesson
  subject?: string
  program?: string
  type?: 'Lesson' | 'Tutorial' | 'Workshop'
  scheduledDate?: string
  time?: string
  duration?: string
  teacher?: string     // Teacher name
  status: 'draft' | 'active'
  videoUrl?: string
  zoomLink?: string
  createdAt: string
  updatedAt: string
  description?: string
}

const subjectColors = {
  Mathematics: "from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-200",
  Physics: "from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200",
  Chemistry: "from-purple-500/20 to-violet-500/20 border-purple-400/30 text-purple-200",
  Biology: "from-orange-500/20 to-amber-500/20 border-orange-400/30 text-orange-200",
  "Computer Science": "from-indigo-500/20 to-blue-500/20 border-indigo-400/30 text-indigo-200",
  English: "from-pink-500/20 to-rose-500/20 border-pink-400/30 text-pink-200",
}

// Helper function to check if URL is a YouTube/streaming URL
const isStreamingUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
}

const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url)
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
}

export default function LessonPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dataReady, setDataReady] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [videoWatched, setVideoWatched] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  // Determine where user came from for dynamic back button
  const getBackButtonConfig = () => {
    const from = searchParams.get('from')
    const referrer = typeof window !== 'undefined' ? document.referrer : ''
    
    if (from === 'lessons' || referrer.includes('/lessons')) {
      return {
        text: 'Back to Lessons',
        href: '/lessons',
        icon: '📚'
      }
    } else if (from === 'timetable' || referrer.includes('/timetable')) {
      return {
        text: 'Back to Timetable',
        href: '/timetable',
        icon: '📅'
      }
    } else {
      // Default to timetable if unclear
      return {
        text: 'Back to Timetable',
        href: '/timetable',
        icon: '📅'
      }
    }
  }

  const { showPreloader, mounted: preloaderMounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  // Helper function to check if lesson is live today
  const isLiveToday = (scheduledDate?: string) => {
    if (!scheduledDate) return false
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    return scheduledDate === today
  }

  // Helper function to check if lesson date has passed
  const isDatePassed = (scheduledDate?: string) => {
    if (!scheduledDate) return false
    const today = new Date().toISOString().split('T')[0]
    return scheduledDate < today
  }

  // Helper function to check if lesson is in the future
  const isFutureLesson = (scheduledDate?: string) => {
    if (!scheduledDate) return false
    const today = new Date().toISOString().split('T')[0]
    return scheduledDate > today
  }

  // Get lesson status with dual button support - memoized to prevent flickering
  const getLessonStatus = useMemo(() => {
    const hasVideo = !!lesson?.videoUrl
    const hasZoom = !!lesson?.zoomLink
    
    if (!lesson?.scheduledDate) {
      if (hasVideo && hasZoom) {
        return {
          type: 'available',
          showBothButtons: true,
          videoLabel: 'Watch Video',
          zoomLabel: 'Join Live',
          videoClass: 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700',
          zoomClass: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
        }
      } else if (hasZoom) {
        return { type: 'available', label: 'Join Live', class: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' }
      } else {
        return { type: 'available', label: 'Watch Video', class: 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700' }
      }
    }
    
    const now = new Date()
    const lessonDate = new Date(lesson.scheduledDate)
    
    // Use more stable timing calculations
    const tenMinutesBefore = new Date(lessonDate.getTime() - 10 * 60000)
    const lessonEndTime = new Date(lessonDate.getTime() + 60 * 60000)
    const extendedLiveStart = new Date(lessonDate.getTime() - 30 * 60000)
    const extendedLiveEnd = new Date(lessonDate.getTime() + 120 * 60000)
    
    if (now >= tenMinutesBefore && now <= lessonEndTime) {
      // Currently live - use pulse animation only during actual lesson time
      if (hasVideo && hasZoom) {
        return {
          type: 'live',
          showBothButtons: true,
          videoLabel: 'Watch Video',
          zoomLabel: 'Join Live',
          videoClass: 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700',
          zoomClass: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
        }
      } else if (hasZoom) {
        return { type: 'live', label: 'Join Live', class: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 animate-pulse' }
      } else {
        return { type: 'live', label: 'Watch Live', class: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 animate-pulse' }
      }
    } else if (now >= extendedLiveStart && now <= extendedLiveEnd) {
      // Extended live window - no pulse to reduce flickering
      if (hasVideo && hasZoom) {
        return {
          type: 'live',
          showBothButtons: true,
          videoLabel: 'Watch Video',
          zoomLabel: 'Join Live',
          videoClass: 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700',
          zoomClass: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
        }
      } else if (hasZoom) {
        return { type: 'live', label: 'Join Live', class: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' }
      } else {
        return { type: 'live', label: 'Watch Live', class: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' }
      }
    } else if (now < extendedLiveStart) {
      // Future lesson - but still show Join Live if zoom is available
      if (hasZoom) {
        return { type: 'future', label: 'Join Live (Scheduled)', class: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white' }
      }
      return { type: 'future', label: 'Coming Soon', class: 'bg-gradient-to-r from-slate-600/40 to-slate-700/40 text-white/60 cursor-not-allowed', disabled: true }
    } else {
      // Past lesson - always allow access to zoom if available  
      if (hasVideo && hasZoom) {
        return {
          type: 'past',
          showBothButtons: true,
          videoLabel: 'Watch Replay',
          zoomLabel: 'Join Live',
          videoClass: 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700',
          zoomClass: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
        }
      } else if (hasZoom && !hasVideo) {
        return { type: 'past', label: 'Join Live', class: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' }
      } else {
        return { type: 'past', label: 'Watch Replay', class: 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700' }
      }
    }
    
    return { type: 'available', label: 'Watch Lesson', class: 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700' }
  }, [lesson?.videoUrl, lesson?.zoomLink, lesson?.scheduledDate])

  // Track video view
  const trackVideoView = async () => {
    if (!lesson) return
    
    try {
      await fetch('/api/lessons/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          action: 'video_unlocked',
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to track video view:', error)
    }
  }

  // Handle video completion tracking
  const handleVideoEnd = () => {
    setVideoWatched(true)
  }

  // Handle video progress tracking for YouTube videos
  const handleYouTubeMessage = (event: MessageEvent) => {
    if (event.origin !== 'https://www.youtube.com') return
    
    try {
      const data = JSON.parse(event.data)
      if (data.event === 'video-ended') {
        setVideoWatched(true)
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }


    
  // Handle watch now button click
  const handleWatchNow = async () => {
    // Track the video unlock
    await trackVideoView()
    
    // Show the actual video player
    setShowVideoPlayer(true)
  }

  // Auto-show video player for live lessons
  useEffect(() => {
    if (lesson?.scheduledDate) {
      const status = getLessonStatus
      if (status.type === 'live') {
        setShowVideoPlayer(true)
      }
    }
  }, [lesson?.scheduledDate, getLessonStatus])

  // Handle mark as finished
  const handleMarkAsFinished = async () => {
    if (!lesson) return
    
    setIsFinishing(true)
    
    try {
      // Track completion
      await fetch('/api/lessons/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          action: 'lesson_completed',
          timestamp: new Date().toISOString()
        })
      })
      
      // Simulate XP earning animation
      setTimeout(() => {
        setIsFinished(true)
        setIsFinishing(false)
      }, 1500)
    } catch (error) {
      console.error('Failed to mark lesson as finished:', error)
      setIsFinishing(false)
    }
  }

  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/lessons/${params.id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setLesson(data.lesson)
        setDataReady(true)
      } catch (error) {
        console.error("Failed to fetch lesson:", error)
        setLesson(null)
        setDataReady(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchLesson()
    }
  }, [params.id])

  // Listen for YouTube video events
  useEffect(() => {
    window.addEventListener('message', handleYouTubeMessage)
    return () => window.removeEventListener('message', handleYouTubeMessage)
  }, [])

  if (showPreloader || !preloaderMounted || isLoading) {
    return <Preloader isVisible={showPreloader || !preloaderMounted || isLoading} colorScheme="purple" loadingText="Loading your lesson" />
  }

  if (!lesson) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background for not found page */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-tr from-purple-800/30 via-transparent to-blue-800/30 pointer-events-none" />
        
        <Navigation />
        <main className="lg:ml-72 min-h-screen relative z-10">
          <ResponsiveContainer padding="lg">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h1>
              <p className="text-gray-400 mb-8">The lesson you're looking for doesn't exist or has been removed.</p>
              <Link href={getBackButtonConfig().href}>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {getBackButtonConfig().text}
                </Button>
              </Link>
            </div>
          </ResponsiveContainer>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Dark Background with Purple/Blue Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/60 to-slate-900 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-tr from-purple-900/30 via-transparent to-blue-900/30 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.3),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Floating 3D elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-32 left-16 w-40 h-40 border border-purple-400/40 rounded-full animate-pulse shadow-2xl shadow-purple-500/20"></div>
        <div className="absolute top-60 right-32 w-28 h-28 border border-blue-400/40 rotate-45 animate-pulse delay-1000 shadow-xl shadow-blue-500/20"></div>
        <div className="absolute bottom-60 left-1/3 w-24 h-24 border border-indigo-400/40 rounded-lg animate-pulse delay-2000 shadow-lg shadow-indigo-500/20"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-violet-400/40 rounded-full animate-pulse delay-3000"></div>
      </div>
      
      {/* Premium Purple Particles */}
      <Particles
        className="fixed inset-0 pointer-events-none"
        quantity={50}
        ease={80}
        color="#a855f7"
        size={0.8}
        staticity={60}
      />

      {/* Blue accent particles */}
      <Particles
        className="fixed inset-0 pointer-events-none"
        quantity={70}
        ease={60}
        color="#3b82f6"
        size={0.4}
        staticity={40}
      />

      {/* Modern geometric grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <svg 
          className="absolute inset-0 w-full h-full" 
          width="100%" 
          height="100%" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern 
              id="lesson-grid" 
              width="80" 
              height="80" 
              patternUnits="userSpaceOnUse"
            >
              <path 
                d="M 80 0 L 0 0 0 80" 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="1"
                opacity="0.6"
              />
              <circle cx="40" cy="40" r="2" fill="#3b82f6" opacity="0.4"/>
            </pattern>
          </defs>
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#lesson-grid)" 
          />
        </svg>
      </div>

      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <ResponsiveContainer padding="lg" animated>
          <div className="space-y-6 pb-16">

            {/* Lesson Card */}
            <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group">
              {/* Enhanced card background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-purple-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse opacity-30" />
              
              <CardHeader className="pb-4 relative z-10">
              </CardHeader>
              
              <CardContent className="relative z-10">
                {/* Video Player Section */}
                <div className="space-y-8">
                  {/* Video Player */}
                  <div>
                    {/* Back to Lessons Button Above Video */}
                    <div className="mb-4">
                      <Button 
                        variant="ghost" 
                        className="text-white hover:text-purple-300 group rounded-full px-6 py-3 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20"
                        onClick={() => {
                          const backConfig = getBackButtonConfig()
                          window.location.href = backConfig.href
                        }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">{getBackButtonConfig().text}</span>
                      </Button>
                    </div>
                    
                    <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden relative transition-all duration-300">
                  {lesson.videoUrl ? (
                    <>
                          {/* Show video player or click-to-play overlay */}
                          {showVideoPlayer ? (
                            // Actual Video Player
                            <>
                              {isStreamingUrl(lesson.videoUrl) && getYouTubeVideoId(lesson.videoUrl) ? (
                              // Handle YouTube URLs
                            <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(lesson.videoUrl)}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=1&cc_load_policy=0&disablekb=0&autohide=1&color=white&controls=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                              title={lesson.lessonName || lesson.topic || 'Lesson'}
                              className="w-full h-full"
                              allowFullScreen
                              frameBorder="0"
                                  sandbox="allow-same-origin allow-scripts allow-presentation"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                              onLoad={() => {
                                setTimeout(() => setVideoWatched(true), 30000)
                              }}
                            />
                          ) : (
                                                      // Handle direct video files
                            <video
                              src={lesson.videoUrl}
                              controls
                              className="w-full h-full"
                              poster="/video-placeholder.jpg"
                              onEnded={handleVideoEnd}
                              onTimeUpdate={(e) => {
                                const video = e.currentTarget
                                if (video.duration && video.currentTime >= video.duration * 0.9) {
                                  setVideoWatched(true)
                                }
                              }}
                            />
                              )}
                            </>
                          ) : (
                            // Click-to-Play Overlay with Lock
                            <div className="w-full h-full relative cursor-pointer group" onClick={handleWatchNow}>
                              {/* Video Thumbnail with Heavy Blur */}
                              {isStreamingUrl(lesson.videoUrl) && getYouTubeThumbnail(lesson.videoUrl) ? (
                                <img 
                                  src={getYouTubeThumbnail(lesson.videoUrl)!}
                                  alt={lesson.lessonName || lesson.topic || 'Video Thumbnail'}
                                  className="w-full h-full object-cover blur-lg group-hover:blur-md transition-all duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-900/70 via-purple-900/30 to-slate-900/70 flex items-center justify-center blur-sm group-hover:blur-none transition-all duration-500">
                                  <Video className="w-16 h-16 text-purple-300" />
                          </div>
                              )}
                              
                              {/* Heavy dark overlay */}
                              <div className="absolute inset-0 bg-black/70 group-hover:bg-black/60 transition-all duration-500"></div>
                              
                              {/* Centered Lock Icon */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-6">
                                  <div className="bg-white/10 border border-white/30 rounded-full p-4 shadow-2xl group-hover:bg-white/20 transition-all duration-300">
                                    <Lock className="w-8 h-8 text-white" />
                                  </div>
                                  
                                  {/* Watch Now Button - Badge Style */}
                                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-400/30 hover:border-blue-400/50 flex items-center gap-2 text-sm">
                                    <Play className="w-4 h-4 text-white" fill="currentColor" />
                                    <span>Watch Now</span>
                                  </button>
                                </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900/70 via-purple-900/30 to-slate-900/70 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20">
                            <div className="w-full h-full" style={{
                              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139,92,246,0.3) 1px, transparent 0)',
                              backgroundSize: '30px 30px'
                            }}></div>
                          </div>
                          <div className="text-center relative z-10">
                            <div className="relative">
                              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse"></div>
                              <Video className="w-16 h-16 text-purple-300 mx-auto mb-4 relative" />
                            </div>
                            <p className="text-gray-300 text-base font-medium">Video content available soon</p>
                          </div>
                        </div>
                      )}
                  </div>

                    {/* Separator Line */}
                    <div className="border-t border-white/20 my-8 relative">
                      <div className="absolute inset-0 border-t border-purple-400/20"></div>
                    </div>

                    {/* Video Details - Below video */}
                    <div className="space-y-4">
                      {/* Lesson Title */}
                      <h1 className="text-white text-2xl lg:text-3xl font-bold">{lesson.lessonName || lesson.topic || 'Untitled Lesson'}</h1>
                      
                      {/* Lesson Tags */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {lesson.topic && (
                          <span className={`inline-flex items-center bg-gradient-to-r ${subjectColors[lesson.subject as keyof typeof subjectColors] || 'from-gray-500/20 to-gray-600/20 border-gray-400/30 text-gray-300'} px-3 py-2 text-sm font-bold border rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}>
                            {lesson.topic}
                          </span>
                        )}
                        {lesson.type && (
                          <span className="inline-flex items-center bg-gradient-to-r from-purple-500/25 to-indigo-500/25 border-purple-400/40 text-purple-100 gap-2 px-3 py-2 text-sm font-bold border rounded-lg shadow-sm hover:from-purple-500/35 hover:to-indigo-500/35 transition-all duration-200">
                            {lesson.type === 'Lesson' && <GraduationCap className="w-4 h-4" />}
                            {lesson.type === 'Tutorial' && <Video className="w-4 h-4" />}
                            {lesson.type === 'Workshop' && <ExternalLink className="w-4 h-4" />}
                            {lesson.type}
                          </span>
                        )}
                        {lesson.program && (
                          <span className="inline-flex items-center bg-indigo-500/15 text-indigo-200 border border-indigo-400/25 px-3 py-2 text-sm font-medium rounded-lg">
                            <Target className="w-4 h-4 mr-2" />
                            {lesson.program}
                          </span>
                        )}
                      </div>

                      {/* Lesson Info Pills */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {lesson.duration && (
                          <div className="flex items-center bg-amber-500/15 px-3 py-2 rounded-lg border border-amber-400/25">
                            <Clock className="w-4 h-4 mr-2 text-amber-400" />
                            <span className="text-amber-200 font-medium">{lesson.duration}</span>
                          </div>
                        )}
                        {lesson.teacher && (
                          <div className="flex items-center bg-blue-500/15 px-3 py-2 rounded-lg border border-blue-400/25">
                            <User className="w-4 h-4 mr-2 text-blue-400" />
                            <span className="text-blue-200 font-medium truncate max-w-[120px]">{lesson.teacher}</span>
                          </div>
                        )}
                        {lesson.subject && (
                          <div className="flex items-center bg-emerald-500/15 px-3 py-2 rounded-lg border border-emerald-400/25">
                            <BookOpen className="w-4 h-4 mr-2 text-emerald-400" />
                            <span className="text-emerald-200 font-medium">{lesson.subject}</span>
                          </div>
                        )}
                        {lesson.time && (
                          <div className="flex items-center bg-purple-500/15 px-3 py-2 rounded-lg border border-purple-400/25">
                            <Play className="w-4 h-4 mr-2 text-purple-400" />
                            <span className="text-purple-200 font-medium">{lesson.time}</span>
                          </div>
                        )}
                      </div>

                      {lesson.scheduledDate && (() => {
                        const date = new Date(lesson.scheduledDate)
                        if (!isNaN(date.getTime())) {
                          return (
                            <div className="inline-flex items-center bg-slate-500/15 px-3 py-2 rounded-lg border border-slate-400/25 text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
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

                      {/* Lesson Description - Matching Other Badges */}
                      {lesson.description && (
                        <div className="flex items-center bg-cyan-500/15 px-3 py-2 rounded-lg border border-cyan-400/25">
                          <AlignLeft className="w-4 h-4 mr-2 text-cyan-400" />
                          <span className="text-cyan-200 font-medium">
                            {lesson.description.length > 80 
                              ? lesson.description.substring(0, 80) + '...' 
                              : lesson.description
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Section - Now Below Video */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white font-semibold mb-4 text-xl">Actions</h3>
                      <div className="flex flex-wrap gap-4">
                        {lesson?.zoomLink && (
                                <Button 
                                  onClick={() => {
                                    if (lesson?.zoomLink) {
                                      window.open(lesson.zoomLink, '_blank')
                                    }
                                  }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-green-400/30"
                          >
                            <ExternalLink className="w-5 h-5 mr-2" />
                            Join Live Session
                                  </Button>
                            )}

                        {/* Mark as Finished Button - Always visible */}
                        {!isFinished && (
                              <Button 
                                onClick={handleMarkAsFinished}
                                disabled={isFinishing}
                            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-amber-400/30"
                              >
                                {isFinishing ? (
                                  <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Completing Lesson...
                                  </>
                                ) : (
                                  <>
                                <Trophy className="w-5 h-5 mr-2" />
                                    Complete & Earn XP
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Completion Status */}
                            {isFinished && (
                                <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-400/50 rounded-xl p-5 text-center shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 animate-pulse"></div>
                                  <div className="relative z-10">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                      <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-400/50 rounded-full blur-md animate-pulse"></div>
                                        <CheckCircle className="w-6 h-6 text-emerald-300 relative" />
                                      </div>
                                <span className="text-emerald-200 font-bold text-lg">Lesson Completed!</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                      <Trophy className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-300 font-bold text-base">+50 XP Earned</span>
                                    </div>
                                </div>
                              </div>
                            )}
                      </div>
                    </div>
                  </div>
                </div>
                  </CardContent>
                </Card>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  )
}