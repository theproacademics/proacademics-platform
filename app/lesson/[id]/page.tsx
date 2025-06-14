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
import { BookOpen, Video, User, Clock, Calendar, ArrowLeft, MessageSquare, Download, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Lesson {
  id: string
  title: string
  subject: string
  subtopic?: string
  instructor: string
  duration: string
  videoUrl?: string
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

export default function LessonPage() {
  const params = useParams()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dataReady, setDataReady] = useState(false)
  const { showPreloader, mounted: preloaderMounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <ResponsiveContainer padding="lg">
          <div className="space-y-8">
            {/* Back Button */}
            <Link href="/timetable">
              <Button variant="ghost" className="text-white hover:text-blue-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Timetable
              </Button>
            </Link>

            {/* Video Player Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Card className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <CardHeader className="pb-6">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
                  <CardTitle className="text-white text-xl">{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
                    {lesson.videoUrl ? (
                      <video
                        src={lesson.videoUrl}
                        controls
                        className="w-full h-full"
                        poster="/video-placeholder.jpg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                        <div className="text-center">
                          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">Video content will be available soon</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

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
                          <span>{lesson.instructor}</span>
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
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
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