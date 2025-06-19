"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Video, User, Clock, Calendar, ArrowLeft, MessageSquare, Lock, Unlock, Play, Trophy, CheckCircle, Award, Target, GraduationCap } from "lucide-react"
import Link from "next/link"
import Particles from "@/components/ui/particles"

interface Lesson {
  _id?: string
  id: string
  title: string
  subject: string
  subtopic?: string
  teacher?: string
  program?: string
  duration?: string
  videoUrl?: string
  status: 'draft' | 'active'
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  week?: string
  grade?: string
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

export default function LessonPage() {
  const params = useParams()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dataReady, setDataReady] = useState(false)
  const [isVideoUnlocked, setIsVideoUnlocked] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [videoWatched, setVideoWatched] = useState(false)

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

  // Get lesson status
  const getLessonStatus = () => {
    if (!lesson?.scheduledDate) return { type: 'available', label: 'Watch Lesson' }
    
    if (isDatePassed(lesson.scheduledDate)) {
      return { type: 'past', label: 'Watch Lesson' }
    } else if (isLiveToday(lesson.scheduledDate)) {
      return { type: 'live', label: 'Join Lesson' }
    } else if (isFutureLesson(lesson.scheduledDate)) {
      return { type: 'future', label: 'Join Lesson' }
    }
    
    return { type: 'available', label: 'Watch Lesson' }
  }

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

  // Handle video unlock
  const handleUnlockVideo = async () => {
    setIsUnlocking(true)
    
    // Track the unlock action
    await trackVideoView()
    
    // Unlock the video after a brief delay
    setTimeout(() => {
      setIsVideoUnlocked(true)
      setIsUnlocking(false)
    }, 1000)
  }

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
    return <Preloader isVisible={showPreloader || !preloaderMounted || isLoading} colorScheme="purple" loadingText="Loading your premium lesson" />
  }

  if (!lesson) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Premium background for not found page */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-tr from-purple-800/30 via-transparent to-blue-800/30 pointer-events-none" />
        
        <Navigation />
        <main className="lg:ml-72 min-h-screen relative z-10">
          <ResponsiveContainer padding="lg">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h1>
              <p className="text-gray-400 mb-8">The lesson you're looking for doesn't exist or has been removed.</p>
              <Link href="/timetable">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Timetable
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
            {/* Compact Header */}
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="text-white hover:text-purple-300 group rounded-full px-4 py-2 hover:bg-white/10 transition-all duration-200"
                onClick={() => window.location.href = '/timetable'}
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center bg-gradient-to-r ${subjectColors[lesson.subject as keyof typeof subjectColors] || 'from-gray-500/20 to-gray-600/20 border-gray-400/30 text-gray-300'} px-2.5 py-1 text-xs font-bold border rounded-md shadow-sm`}>
                  {lesson.subject}
                </span>
                {lesson.status === 'active' && (
                  <span className="inline-flex items-center bg-gradient-to-r from-green-500/25 to-emerald-500/25 border-green-400/40 text-green-100 px-2.5 py-1 text-xs font-bold border rounded-md shadow-sm">
                    Active
                  </span>
                )}
              </div>
            </div>

            {/* Premium Lesson Card */}
            <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group">
              {/* Enhanced card background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-purple-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse opacity-30" />
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-white text-xl lg:text-2xl font-bold">{lesson.title}</CardTitle>
                    {lesson.subtopic && (
                      <div className="inline-flex items-center bg-indigo-500/15 text-indigo-200 border border-indigo-400/25 px-2 py-1 text-xs font-medium rounded-md">
                        <Target className="w-3 h-3 mr-1" />
                        {lesson.subtopic}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                {/* Compact Details */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
                  {lesson.teacher && (
                    <div className="flex items-center bg-blue-500/15 px-2 py-1 rounded-md border border-blue-400/25">
                      <User className="w-3 h-3 mr-1 text-blue-400" />
                      <span className="text-blue-200 font-medium text-xs truncate">{lesson.teacher}</span>
                    </div>
                  )}
                  
                  {lesson.duration && (
                    <div className="flex items-center bg-amber-500/15 px-2 py-1 rounded-md border border-amber-400/25">
                      <Clock className="w-3 h-3 mr-1 text-amber-400" />
                      <span className="text-amber-200 font-medium text-xs">{lesson.duration}</span>
                    </div>
                  )}

                  {lesson.grade && (
                    <div className="flex items-center bg-purple-500/15 px-2 py-1 rounded-md border border-purple-400/25">
                      <GraduationCap className="w-3 h-3 mr-1 text-purple-400" />
                      <span className="text-purple-200 font-medium text-xs">Grade {lesson.grade}</span>
                    </div>
                  )}

                  {lesson.week && (
                    <div className="flex items-center bg-green-500/15 px-2 py-1 rounded-md border border-green-400/25">
                      <Calendar className="w-3 h-3 mr-1 text-green-400" />
                      <span className="text-green-200 font-medium text-xs">Week {lesson.week}</span>
                    </div>
                  )}

                  {lesson.scheduledDate && (
                    <div className="inline-flex items-center bg-slate-500/15 px-2 py-1 rounded-md border border-slate-400/25 text-xs col-span-2">
                      <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                      <span className="text-slate-300 font-medium">
                        {new Date(lesson.scheduledDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Video Player Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Video Player */}
                  <div className="lg:col-span-2">
                    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative">
                      {lesson.videoUrl ? (
                        <>
                          {/* Video Content */}
                          {isVideoUnlocked ? (
                            isStreamingUrl(lesson.videoUrl) && getYouTubeVideoId(lesson.videoUrl) ? (
                              // Handle YouTube URLs
                              <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(lesson.videoUrl)}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=1&cc_load_policy=0&disablekb=0&autohide=1&color=white&controls=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                                title={lesson.title}
                                className="w-full h-full"
                                allowFullScreen
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                            )
                          ) : (
                            /* Locked Video State */
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-indigo-900/40 to-slate-900/95 relative overflow-hidden">
                              {/* Premium animated background */}
                              <div className="absolute inset-0 opacity-20">
                                <div className="w-full h-full" style={{
                                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(139,92,246,0.4) 2px, transparent 0)',
                                  backgroundSize: '40px 40px'
                                }}></div>
                              </div>
                              
                              {/* Floating orbs */}
                              <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                              <div className="absolute bottom-10 right-10 w-16 h-16 bg-blue-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
                              
                              {/* Premium lock overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-md"></div>
                              
                              {/* Enhanced content */}
                              <div className="relative text-center space-y-6 p-8 max-w-md">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-full blur-2xl animate-pulse"></div>
                                  <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/40 to-blue-500/40 rounded-full flex items-center justify-center backdrop-blur-xl border-2 border-white/40 shadow-2xl">
                                    <Lock className="w-12 h-12 text-white drop-shadow-lg" />
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">Premium Lesson</h3>
                                  <p className="text-slate-200 text-base leading-relaxed">
                                    {(() => {
                                      const status = getLessonStatus()
                                      if (status.type === 'past') {
                                        return 'Unlock this premium lesson content'
                                      } else if (status.type === 'live') {
                                        return 'Join the live learning experience'
                                      } else if (status.type === 'future') {
                                        return 'Coming soon - scheduled for later'
                                      }
                                      return 'Discover premium educational content'
                                    })()}
                                  </p>
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
                            <p className="text-gray-300 text-base font-medium">Premium content loading soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Sidebar */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white font-semibold mb-3 text-lg">Actions</h3>
                      <div className="space-y-3">
                        {(() => {
                          const status = getLessonStatus()
                          
                          return (
                            <>
                              {/* Primary Action Button */}
                              {status.type === 'past' && !isVideoUnlocked ? (
                                <Button 
                                  onClick={handleUnlockVideo}
                                  disabled={isUnlocking}
                                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-4 rounded-full shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 border border-purple-400/30 relative overflow-hidden group"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                  {isUnlocking ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                      Unlocking Premium...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-5 h-5 mr-2" />
                                      Start Premium Lesson
                                    </>
                                  )}
                                </Button>
                              ) : status.type === 'live' ? (
                                <Button className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 rounded-full shadow-2xl shadow-red-500/30 animate-pulse border border-red-400/40 relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                                  <div className="w-3 h-3 bg-white rounded-full mr-2 animate-ping shadow-lg"></div>
                                  Join Live Session
                                </Button>
                              ) : status.type === 'future' ? (
                                <Button 
                                  disabled
                                  className="w-full bg-gradient-to-r from-slate-600/40 to-slate-700/40 text-white/60 font-bold py-4 rounded-full cursor-not-allowed border border-slate-500/30 shadow-lg relative overflow-hidden"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-slate-600/10"></div>
                                  <Calendar className="w-5 h-5 mr-2" />
                                  Coming Soon
                                </Button>
                              ) : isVideoUnlocked ? (
                                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500/25 to-emerald-500/25 border-2 border-green-400/40 rounded-xl shadow-lg shadow-green-500/20 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
                                  <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                                    <span className="text-green-200 font-bold text-base">Premium Access Active</span>
                                  </div>
                                </div>
                              ) : (
                                <Button 
                                  onClick={handleUnlockVideo}
                                  disabled={isUnlocking}
                                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-4 rounded-full shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 border border-purple-400/30 relative overflow-hidden group"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                  {isUnlocking ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                      Unlocking Premium...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-5 h-5 mr-2" />
                                      Start Premium Lesson
                                    </>
                                  )}
                                </Button>
                              )}

                              {/* Mark as Finished Button */}
                              {isVideoUnlocked && videoWatched && !isFinished && (
                                <Button 
                                  onClick={handleMarkAsFinished}
                                  disabled={isFinishing}
                                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold py-4 rounded-full shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 border border-amber-400/30 relative overflow-hidden group"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                  {isFinishing ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                      Earning Premium XP...
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
                                <div className="w-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-400/50 rounded-xl p-5 text-center shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 animate-pulse"></div>
                                  <div className="relative z-10">
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                      <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-400/50 rounded-full blur-md animate-pulse"></div>
                                        <CheckCircle className="w-6 h-6 text-emerald-300 relative" />
                                      </div>
                                      <span className="text-emerald-200 font-bold text-lg">Lesson Mastered!</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                      <Trophy className="w-4 h-4 text-yellow-400" />
                                      <span className="text-yellow-300 font-bold text-base">+50 Premium XP Earned</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Secondary Actions */}
                              <Button className="w-full bg-gradient-to-r from-blue-500/20 to-indigo-600/20 border border-blue-400/40 text-blue-200 hover:from-blue-500/30 hover:to-indigo-600/30 hover:border-blue-300/50 transition-all duration-300 rounded-full py-3 font-semibold shadow-lg hover:shadow-blue-500/20 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Ask AI Tutor
                              </Button>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Quick Info */}
                    {lesson.description && (
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h4 className="text-white font-semibold mb-2 text-sm">About</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {lesson.description.length > 120 
                            ? lesson.description.substring(0, 120) + '...' 
                            : lesson.description
                          }
                        </p>
                      </div>
                    )}
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