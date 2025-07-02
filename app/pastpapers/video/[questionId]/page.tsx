"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BookOpen, Video, User, Clock, ArrowLeft, Play, ExternalLink, Target, ChevronRight, GraduationCap } from "lucide-react"

interface QuestionVideo {
  id: string
  questionNumber: number
  topic: string
  questionName: string
  questionDescription: string
  duration: string
  teacher: string
  videoEmbedLink: string
  createdAt: string
  updatedAt: string
}

interface PastPaper {
  _id: string
  id: string
  paperName: string
  board: string
  year: number
  subject: string
  program: string
  questions?: QuestionVideo[]
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

export default function QuestionVideoPage() {
  const params = useParams()
  const router = useRouter()
  const [question, setQuestion] = useState<QuestionVideo | null>(null)
  const [paper, setPaper] = useState<PastPaper | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dataReady, setDataReady] = useState(false)
  const [nextQuestion, setNextQuestion] = useState<QuestionVideo | null>(null)

  const { showPreloader, mounted: preloaderMounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  // Find next question in sequence
  const findNextQuestion = (currentQuestion: QuestionVideo, allQuestions: QuestionVideo[]): QuestionVideo | null => {
    const sortedQuestions = allQuestions.sort((a, b) => a.questionNumber - b.questionNumber)
    const currentIndex = sortedQuestions.findIndex(q => q.id === currentQuestion.id)
    return currentIndex < sortedQuestions.length - 1 ? sortedQuestions[currentIndex + 1] : null
  }

  // Handle next question navigation
  const handleNextQuestion = () => {
    if (nextQuestion) {
      router.push(`/pastpapers/video/${nextQuestion.id}`)
    }
  }

  // Handle study topic navigation
  const handleStudyTopic = () => {
    // Navigate to a topic study page or lessons related to this topic
    // For now, redirect to lessons page with topic filter
    if (question?.topic) {
      router.push(`/lessons?topic=${encodeURIComponent(question.topic)}`)
    } else {
      router.push('/lessons')
    }
  }

  useEffect(() => {
    const fetchQuestionAndPaper = async () => {
      setIsLoading(true)
      try {
        // First, find which paper contains this question
        const papersResponse = await fetch('/api/admin/pastpapers')
        if (!papersResponse.ok) throw new Error('Failed to fetch papers')
        
        const papersData = await papersResponse.json()
        if (!papersData.success) throw new Error('Failed to fetch papers')
        
        let foundQuestion: QuestionVideo | null = null
        let foundPaper: PastPaper | null = null
        
        // Search through all papers to find the question
        for (const paperItem of papersData.pastPapers) {
          try {
            const questionsResponse = await fetch(`/api/admin/pastpapers/${paperItem.id}/questions`)
            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json()
              if (questionsData.success && questionsData.questions) {
                const question = questionsData.questions.find((q: QuestionVideo) => q.id === params.questionId)
                if (question) {
                  foundQuestion = question
                  foundPaper = { ...paperItem, questions: questionsData.questions }
                  break
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching questions for paper ${paperItem.id}:`, error)
          }
        }
        
        if (foundQuestion && foundPaper) {
          setQuestion(foundQuestion)
          setPaper(foundPaper)
          
          // Find next question
          const next = findNextQuestion(foundQuestion, foundPaper.questions || [])
          setNextQuestion(next)
        }
        
        setDataReady(true)
      } catch (error) {
        console.error("Failed to fetch question:", error)
        setDataReady(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.questionId) {
      fetchQuestionAndPaper()
    }
  }, [params.questionId])

  if (showPreloader || !preloaderMounted || isLoading) {
    return <Preloader isVisible={showPreloader || !preloaderMounted || isLoading} colorScheme="purple" loadingText="Loading question video" />
  }

  if (!question || !paper) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-tr from-purple-800/30 via-transparent to-blue-800/30 pointer-events-none" />
        
        <Navigation />
        <main className="lg:ml-72 min-h-screen relative z-10">
          <ResponsiveContainer padding="lg">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-white mb-4">Question Video Not Found</h1>
              <p className="text-gray-400 mb-8">The question video you're looking for doesn't exist or has been removed.</p>
              <Button 
                onClick={() => router.push('/pastpapers')}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Past Papers
              </Button>
            </div>
          </ResponsiveContainer>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-indigo-900 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-tr from-blue-800/20 via-transparent to-purple-800/20 pointer-events-none" />
      
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <svg 
          className="absolute inset-0 w-full h-full" 
          width="100%" 
          height="100%" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern 
              id="question-grid" 
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
            fill="url(#question-grid)" 
          />
        </svg>
      </div>

      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <ResponsiveContainer padding="lg" animated>
          <div className="space-y-6 pb-16">

            {/* Question Video Card */}
            <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group">
              {/* Enhanced card background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-purple-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse opacity-30" />
              
              <CardContent className="relative z-10 p-6 lg:p-8">
                <div className="space-y-8">
                  {/* Back Button */}
                  <div>
                    <Button 
                      variant="ghost" 
                      className="text-white hover:text-purple-300 group rounded-full px-6 py-3 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20"
                      onClick={() => router.push('/pastpapers')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                      <span className="font-medium">Back to Past Papers</span>
                    </Button>
                  </div>
                  
                  {/* Video Player */}
                  <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden relative transition-all duration-300">
                    {question.videoEmbedLink ? (
                      <>
                        {isStreamingUrl(question.videoEmbedLink) && getYouTubeVideoId(question.videoEmbedLink) ? (
                          // Handle YouTube URLs
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(question.videoEmbedLink)}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=1&cc_load_policy=0&disablekb=0&autohide=1&color=white&controls=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                            title={question.questionName}
                            className="w-full h-full"
                            allowFullScreen
                            frameBorder="0"
                            sandbox="allow-same-origin allow-scripts allow-presentation"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          />
                        ) : (
                          // Handle direct video files
                          <video
                            src={question.videoEmbedLink}
                            controls
                            className="w-full h-full"
                            poster="/video-placeholder.jpg"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900/70 via-purple-900/30 to-slate-900/70 relative overflow-hidden">
                        <div className="text-center relative z-10">
                          <Video className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                          <p className="text-gray-300 text-base font-medium">Video content not available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Separator Line */}
                  <div className="border-t border-white/20 my-8 relative">
                    <div className="absolute inset-0 border-t border-purple-400/20"></div>
                  </div>

                  {/* Question Details */}
                  <div className="space-y-4">
                    {/* Paper Context */}
                    <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-200 font-semibold">{paper.paperName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span>{paper.board}</span>
                        <span>•</span>
                        <span>{paper.year}</span>
                        <span>•</span>
                        <span>{paper.subject}</span>
                        <span>•</span>
                        <span>{paper.program}</span>
                      </div>
                    </div>

                    {/* Question Title */}
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-lg font-bold px-4 py-2">
                        Q{question.questionNumber}
                      </Badge>
                      <h1 className="text-white text-2xl lg:text-3xl font-bold">{question.questionName}</h1>
                    </div>
                    
                    {/* Question Tags */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/30 text-emerald-200 px-3 py-2 text-sm font-bold border rounded-lg">
                        <Target className="w-4 h-4 mr-2" />
                        {question.topic}
                      </span>
                    </div>

                    {/* Question Info Pills */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center bg-amber-500/15 px-3 py-2 rounded-lg border border-amber-400/25">
                        <Clock className="w-4 h-4 mr-2 text-amber-400" />
                        <span className="text-amber-200 font-medium">{question.duration}</span>
                      </div>
                      <div className="flex items-center bg-blue-500/15 px-3 py-2 rounded-lg border border-blue-400/25">
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="text-blue-200 font-medium">{question.teacher}</span>
                      </div>
                    </div>

                    {/* Question Description */}
                    {question.questionDescription && (
                      <div className="bg-slate-800/30 border border-slate-600/50 rounded-xl p-4">
                        <p className="text-slate-300 leading-relaxed">{question.questionDescription}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-xl">What's Next?</h3>
                    <div className="flex flex-wrap gap-4">
                      {/* Study This Topic Button */}
                      <Button 
                        onClick={handleStudyTopic}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-emerald-400/30"
                      >
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Study This Topic
                      </Button>

                      {/* Next Question Button */}
                      {nextQuestion ? (
                        <Button 
                          onClick={handleNextQuestion}
                          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-purple-400/30"
                        >
                          <span>Next Question (Q{nextQuestion.questionNumber})</span>
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      ) : (
                        <div className="bg-slate-600/20 border border-slate-500/30 px-6 py-4 rounded-xl">
                          <p className="text-slate-400 font-medium">🎉 You've completed all questions in this paper!</p>
                        </div>
                      )}
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