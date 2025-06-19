"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Video, User, Clock, Calendar, ArrowLeft, MessageSquare, Download, Share2, Lock, Unlock, Play, Trophy, CheckCircle, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
  Mathematics: "from-blue-500/20 to-cyan-500/20 border-blue-400/40 text-blue-300",
  Physics: "from-green-500/20 to-emerald-500/20 border-green-400/40 text-green-300",
  Chemistry: "from-purple-500/20 to-violet-500/20 border-purple-400/40 text-purple-300",
  Biology: "from-orange-500/20 to-amber-500/20 border-orange-400/40 text-orange-300",
  "Computer Science": "from-indigo-500/20 to-blue-500/20 border-indigo-400/40 text-indigo-300",
  English: "from-pink-500/20 to-rose-500/20 border-pink-400/40 text-pink-300",
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
        const data = await response.json()
        setLesson(data.lesson)
        setDataReady(true)
      } catch (error) {
        console.error("Failed to fetch lesson:", error)
        setDataReady(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchLesson()
    }
  }, [params.id])



  if (showPreloader || !preloaderMounted || isLoading) {
    return <Preloader isVisible={showPreloader || !preloaderMounted || isLoading} colorScheme="blue" loadingText="Loading your lesson" />
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="lg:ml-72 min-h-screen relative z-10">
          <ResponsiveContainer padding="lg">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h1>
              <p className="text-gray-400 mb-8">The lesson you're looking for doesn't exist or has been removed.</p>
              <Link href="/timetable">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
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

  // Set document background
  useEffect(() => {
    document.body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #581c87 100%)'
    document.documentElement.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #581c87 100%)'
    
    return () => {
      document.body.style.background = ''
      document.documentElement.style.background = ''
    }
  }, [])

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        {/* Fixed Background Layer - covers entire viewport */}
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-0"></div>
      
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <div className="relative z-10">
        <Navigation />
      </div>

              <main className="lg:ml-72 min-h-screen relative z-10">
          <ResponsiveContainer padding="lg">
            <div className="space-y-8 pb-20">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              className="text-white hover:text-blue-300 group"
              onClick={() => window.location.href = '/timetable'}
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Timetable
            </Button>

            {/* Video Player Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Card className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <CardHeader className="pb-6">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
                  <CardTitle className="text-white text-xl">{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative">
                    {lesson.videoUrl ? (
                      <>
                        {/* Video Content */}
                        {isVideoUnlocked ? (
                          isStreamingUrl(lesson.videoUrl) && getYouTubeVideoId(lesson.videoUrl) ? (
                            // Handle YouTube URLs - embed without extra UI elements
                            <iframe
                              src={`https://www.youtube.com/embed/${getYouTubeVideoId(lesson.videoUrl)}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=1&cc_load_policy=0&disablekb=0&autohide=1&color=white&controls=1`}
                              title={lesson.title}
                              className="w-full h-full"
                              allowFullScreen
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          ) : (
                            // Handle direct video files
                            <video
                              src={lesson.videoUrl}
                              controls
                              className="w-full h-full"
                              poster="/video-placeholder.jpg"
                              onError={(e) => {
                                console.error('Video failed to load:', lesson.videoUrl)
                                e.currentTarget.style.display = 'none'
                                const errorDiv = document.createElement('div')
                                errorDiv.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/50 to-orange-900/50'
                                errorDiv.innerHTML = `
                                  <div class="text-center">
                                    <div class="w-16 h-16 text-red-400 mx-auto mb-4">⚠️</div>
                                    <p class="text-red-400 mb-2">Video failed to load</p>
                                    <p class="text-gray-400 text-sm">Please check the video URL or try again later</p>
                                  </div>
                                `
                                e.currentTarget.parentNode?.appendChild(errorDiv)
                              }}
                            />
                          )
                        ) : (
                          /* Locked Video State */
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="w-full h-full" style={{
                                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                                backgroundSize: '20px 20px'
                              }}></div>
                            </div>
                            
                            {/* Lock overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm"></div>
                            
                            {/* Content */}
                            <div className="relative text-center space-y-6 p-8">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-full blur-xl animate-pulse"></div>
                                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30">
                                  <Lock className="w-10 h-10 text-white" />
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-white">Lesson Video</h3>
                                <p className="text-slate-300 text-lg">
                                  {(() => {
                                    const status = getLessonStatus()
                                    if (status.type === 'past') {
                                      return 'Click "Watch Now" to access this recorded lesson'
                                    } else if (status.type === 'live') {
                                      return 'Join the live session happening now'
                                    } else if (status.type === 'future') {
                                      return 'This lesson will be available on the scheduled date'
                                    }
                                    return 'Click "Watch Now" to start learning'
                                  })()}
                                </p>
                              </div>
                              
                              {/* Watch Now Button for Past Lessons */}
                              {getLessonStatus().type === 'past' && (
                                <Button
                                  onClick={handleUnlockVideo}
                                  disabled={isUnlocking}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                >
                                  {isUnlocking ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                      Unlocking...
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="w-5 h-5 mr-3" />
                                      Watch Now
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                        <div className="text-center">
                          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">Video content will be available soon</p>
                          <p className="text-gray-500 text-sm mt-2">Check back later for video content</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lesson Details Card */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">{lesson.title}</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">{lesson.subject}{lesson.subtopic && ` • ${lesson.subtopic}`}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Lesson Description */}
                  {lesson.description && (
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-400" />
                        Lesson Description
                      </h4>
                      <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                        {lesson.description}
                      </p>
                    </div>
                  )}

                  {/* Lesson Details Grid */}
                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      Lesson Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lesson.teacher && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-slate-400 text-sm">Instructor</p>
                              <p className="text-white font-medium">{lesson.teacher}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {lesson.duration && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-amber-400" />
                            <div>
                              <p className="text-slate-400 text-sm">Duration</p>
                              <p className="text-white font-medium">{lesson.duration}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {lesson.grade && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-emerald-400" />
                            <div>
                              <p className="text-slate-400 text-sm">Grade Level</p>
                              <p className="text-white font-medium">Grade {lesson.grade}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {lesson.week && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="text-slate-400 text-sm">Week</p>
                              <p className="text-white font-medium">Week {lesson.week}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {lesson.scheduledDate && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-slate-400 text-sm">Scheduled Date</p>
                              <p className="text-white font-medium">{lesson.scheduledDate}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {lesson.program && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-cyan-400" />
                            <div>
                              <p className="text-slate-400 text-sm">Program</p>
                              <p className="text-white font-medium">{lesson.program}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject Badge */}
                  <div className="flex flex-wrap gap-3">
                    <Badge className={`bg-gradient-to-r ${subjectColors[lesson.subject as keyof typeof subjectColors] || 'from-gray-500/20 to-gray-600/20 border-gray-400/40 text-gray-300'} px-4 py-2 text-sm font-medium`}>
                      {lesson.subject}
                    </Badge>
                    {lesson.status === 'active' && (
                      <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/40 text-green-300 px-4 py-2 text-sm font-medium">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">About This Lesson</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-4">
                        <Badge className={`bg-gradient-to-r ${subjectColors[lesson.subject as keyof typeof subjectColors] || 'from-gray-500/20 to-gray-600/20 border-gray-400/40 text-gray-300'} px-3 py-1`}>
                          {lesson.subject}
                        </Badge>
                        {lesson.grade && (
                          <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/40 text-emerald-300 px-3 py-1">
                            Grade {lesson.grade}
                          </Badge>
                        )}
                      </div>
                      
                      {lesson.description && (
                        <p className="text-gray-300 leading-relaxed">
                          {lesson.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-5 h-5 mr-3 text-amber-400" />
                          <span className="font-medium">{lesson.duration}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <User className="w-5 h-5 mr-3 text-blue-400" />
                          <span>{lesson.teacher}</span>
                        </div>
                        {lesson.week && (
                          <div className="flex items-center text-gray-300">
                            <Calendar className="w-5 h-5 mr-3 text-green-400" />
                            <span>Week {lesson.week}</span>
                          </div>
                        )}
                        {lesson.scheduledDate && (
                          <div className="flex items-center text-gray-300">
                            <Calendar className="w-5 h-5 mr-3 text-purple-400" />
                            <span>{lesson.scheduledDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const status = getLessonStatus()
                        
                        return (
                          <>
                            {/* Primary Action Button */}
                            {status.type === 'past' && !isVideoUnlocked ? (
                              <Button 
                                onClick={handleUnlockVideo}
                                disabled={isUnlocking}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
                              >
                                {isUnlocking ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Unlocking...
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    {status.label}
                                  </>
                                )}
                              </Button>
                            ) : status.type === 'live' ? (
                              <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                                {status.label}
                              </Button>
                            ) : status.type === 'future' ? (
                              <Button 
                                disabled
                                className="w-full bg-gradient-to-r from-blue-500/50 to-purple-600/50 text-white/70 font-bold py-3 cursor-not-allowed"
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                {status.label}
                              </Button>
                            ) : isVideoUnlocked ? (
                              <div className="flex items-center justify-center p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-green-400 font-semibold">Video Unlocked</span>
                                </div>
                              </div>
                            ) : (
                              <Button 
                                onClick={handleUnlockVideo}
                                disabled={isUnlocking}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3"
                              >
                                {isUnlocking ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Unlocking...
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    {status.label}
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Mark as Finished Button */}
                            {isVideoUnlocked && !isFinished && (
                              <Button 
                                onClick={handleMarkAsFinished}
                                disabled={isFinishing}
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                              >
                                {isFinishing ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Earning XP...
                                  </>
                                ) : (
                                  <>
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Mark as Finished (Earn XP)
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Completion Status */}
                            {isFinished && (
                              <div className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/40 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                  <CheckCircle className="w-6 h-6 text-yellow-400" />
                                  <span className="text-yellow-400 font-bold text-lg">Lesson Completed!</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <Trophy className="w-4 h-4 text-orange-400" />
                                  <span className="text-orange-300 font-medium">+50 XP Earned</span>
                                </div>
                              </div>
                            )}

                            {/* Secondary Actions */}
                            <Button className="w-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Ask Questions
                            </Button>
                            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                              <Download className="w-4 h-4 mr-2" />
                              Download Resources
                            </Button>
                            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Lesson
                            </Button>
                          </>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
              </main>
      </div>
    )
  }