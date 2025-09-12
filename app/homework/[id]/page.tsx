'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import MathField from '@/components/ui/math-field'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Preloader } from '@/components/ui/preloader'
import { usePreloader } from '@/hooks/use-preloader'
import { Navigation } from '@/components/layout/navigation'
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  BookOpen, 
  Brain,
  Send,
  Lightbulb,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react'
import { toast } from 'sonner'

// Animated Background Component
const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: ['#3B82F6', '#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
      speed: Math.random() * 2 + 1,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20" />
      
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full opacity-40 animate-particle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.id * 0.1}s`,
            animationDuration: `${4 + particle.speed}s`,
          }}
        />
      ))}

      {/* Shooting Stars */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-shooting-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: '8s',
          }}
        />
      ))}

      {/* Floating Geometric Shapes */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`shape-${i}`}
          className={`absolute opacity-20 animate-shape-float ${
            i % 3 === 0 ? 'w-4 h-4 bg-blue-400 rounded-full' :
            i % 3 === 1 ? 'w-3 h-3 bg-purple-400 rotate-45' :
            'w-2 h-2 bg-cyan-400 rounded-full'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Large Floating Orbs */}
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full opacity-10 animate-float-slow"
          style={{
            width: '300px',
            height: '300px',
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            background: `radial-gradient(circle, ${['#3B82F6', '#8B5CF6', '#06D6A0'][i]} 0%, transparent 70%)`,
            animationDelay: `${i * 5}s`,
            animationDuration: `${20 + i * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

interface HomeworkQuestion {
  _id?: string
  questionId: string
  topic: string
  subtopic: string
  level: 'easy' | 'medium' | 'hard'
  question: string
  markScheme: string
  image?: string
}

interface HomeworkAssignment {
  _id: string
  assignmentId: string
  homeworkName: string
  subject: string
  program: string
  topic: string
  subtopic: string
  level: 'easy' | 'medium' | 'hard'
  teacher: string
  dateAssigned: string
  dueDate: string
  estimatedTime: number
  xpAwarded: number
  questionSet: HomeworkQuestion[]
  status: 'draft' | 'active'
  totalQuestions: number
  completionStatus?: "not_started" | "in_progress" | "completed" | "overdue"
  completedQuestions?: number
  score?: number
  xpEarned?: number
  timeTaken?: number
  progress?: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function HomeworkQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [homework, setHomework] = useState<HomeworkAssignment | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [dataReady, setDataReady] = useState(false)
  
  // ChatGPT integration
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { showPreloader, mounted } = usePreloader({ 
    delay: 1200,
    dependencies: [homework, dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  const homeworkId = params.id as string

  useEffect(() => {
    if (homeworkId) {
      fetchHomework()
    }
  }, [homeworkId])

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const fetchHomework = async () => {
    try {
      const response = await fetch(`/api/admin/homework/${homeworkId}`)
      const data = await response.json()
      
      if (data.success) {
        setHomework(data.data)
        setSessionStartTime(new Date())
        // Initialize chat with homework context
        initializeChat(data.data)
        setTimeout(() => setDataReady(true), 300)
      } else {
        toast.error('Failed to load homework assignment')
        router.push('/homework')
      }
    } catch (error) {
      console.error('Error fetching homework:', error)
      toast.error('Error loading homework assignment')
      router.push('/homework')
    }
  }

  const initializeChat = (homeworkData: HomeworkAssignment) => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: `Hello! I'm here to help you with your "${homeworkData.homeworkName}" homework. I can provide hints, explanations, and guidance for the questions. What would you like to know?`,
      timestamp: new Date()
    }
    setChatMessages([welcomeMessage])
  }

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !homework) return

    setIsSubmitting(true)
    try {
      // Submit answer to API
      const response = await fetch(`/api/homework/${homeworkId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionIndex: currentQuestionIndex,
          answer: userAnswer,
          timeSpent: sessionStartTime ? Date.now() - sessionStartTime.getTime() : 0
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Answer submitted successfully!')
        
        // Move to next question or complete homework
        if (currentQuestionIndex < homework.questionSet.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setUserAnswer('')
          setShowHint(false)
        } else {
          // Homework completed
          toast.success('Congratulations! You have completed the homework!')
          router.push('/homework')
        }
      } else {
        toast.error(data.message || 'Failed to submit answer')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Error submitting answer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          context: {
            type: 'homework',
            homeworkId: homeworkId,
            currentQuestion: homework?.questionSet[currentQuestionIndex],
            subject: homework?.subject
          }
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, assistantMessage])
      } else {
        toast.error('Failed to get AI response')
      }
    } catch (error) {
      console.error('Error sending chat message:', error)
      toast.error('Error sending message')
    } finally {
      setIsChatLoading(false)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />
  }

  if (showPreloader || !mounted) {
    return <Preloader isVisible={showPreloader || !mounted} colorScheme="purple" loadingText="Loading homework question" />
  }

  if (!homework) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #312e81 100%)',
          minHeight: '100vh'
        }}
      >
        <AnimatedBackground />
        <Navigation />
        
        <div className="lg:ml-[270px] relative z-10">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-white text-xl mb-4">Homework not found</p>
              <Button 
                onClick={() => router.push('/homework')} 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Back to Homework
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = homework.questionSet[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / homework.totalQuestions) * 100

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #312e81 100%)',
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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #312e81 100%)'
        }}
      />
      
      <AnimatedBackground />
      <Navigation />
      
      <div className="lg:ml-[270px] relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/homework')}
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Homework
                </Button>
              </div>
              
              <div className="text-right">
                <h1 className="text-2xl font-bold text-white">{homework.homeworkName}</h1>
                <p className="text-gray-300">{homework.subject} • {homework.program}</p>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Badge className={getDifficultyColor(currentQuestion.level)}>
                      {currentQuestion.level.toUpperCase()}
                    </Badge>
                    <span className="text-white font-medium">
                      Question {currentQuestionIndex + 1} of {homework.totalQuestions}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{homework.estimatedTime}min</span>
                  </div>
                </div>
                <Progress value={progress} className="h-3 bg-white/20" />
              </CardContent>
            </Card>

            {/* Question Card */}
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Question Details
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-purple-400 text-purple-200 bg-purple-500/20">
                      {currentQuestion.topic}
                    </Badge>
                    <Badge variant="outline" className="border-blue-400 text-blue-200 bg-blue-500/20">
                      {currentQuestion.subtopic}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Image */}
                {currentQuestion.image && currentQuestion.image !== 'n' && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={currentQuestion.image} 
                      alt="Question illustration"
                      className="w-full h-auto max-h-64 object-contain bg-white rounded-lg"
                    />
                  </div>
                )}

                {/* Question Text */}
                <div className="bg-black/30 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Question:</h3>
                  <div className="text-gray-200 whitespace-pre-wrap text-base leading-relaxed">
                    {currentQuestion.question}
                  </div>
                </div>

                {/* Answer Input */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Your Answer:</h3>
                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <MathField
                      value={userAnswer}
                      onChange={setUserAnswer}
                      placeholder="Enter your mathematical answer here..."
                      className="w-full text-white"
                      virtualKeyboardMode="onfocus"
                      virtualKeyboards="all"
                    />
                  </div>
                </div>

                {/* Hint Section */}
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowHint(!showHint)}
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                  
                  {showHint && (
                    <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4">
                      <h4 className="text-yellow-200 font-semibold mb-2">Hint:</h4>
                      <p className="text-yellow-100 text-sm">
                        Check the mark scheme for guidance on how to approach this question.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mark Scheme (for reference) */}
                <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-4">
                  <h4 className="text-blue-200 font-semibold mb-2">Mark Scheme:</h4>
                  <div className="text-blue-100 whitespace-pre-wrap text-sm">
                    {currentQuestion.markScheme}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Answer
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ChatGPT Integration Section */}
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl">
              <h2 className="text-white text-lg font-semibold mb-1">{homework.homeworkName}</h2>
              <p className="text-gray-300 text-sm">{homework.subject} • {homework.program}</p>
            </div>

            {/* XP and Stats Card */}
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">XP Reward</span>
                </div>
                <div className="text-2xl font-bold text-yellow-300">
                  +{homework.xpAwarded}
                </div>
                <p className="text-gray-300 text-sm">For completing this homework</p>
              </CardContent>
            </Card>

            {/* AI Assistant Chat */}
            <Card className="bg-black/40 backdrop-blur-md border-white/20 h-[600px] flex flex-col shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-300" />
                  AI Assistant
                </CardTitle>
                <p className="text-gray-300 text-sm">
                  Ask questions, get hints, or request explanations
                </p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 pt-0">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-gray-200 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-400"></div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="space-y-2">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything about this question..."
                    className="bg-black/30 border-white/20 text-white placeholder-gray-300 resize-none focus:border-purple-400"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleChatSubmit()
                      }
                    }}
                  />
                  <Button
                    onClick={handleChatSubmit}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
