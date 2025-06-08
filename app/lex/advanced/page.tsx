"use client"

import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Brain,
  Target,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Trophy,
  Clock,
  TrendingUp,
  Sparkles,
  Zap,
  PlayCircle,
  Star,
  Timer,
  Flame,
  Rocket,
} from "lucide-react"

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-purple-900/40"></div>
      
      {/* Large floating orbs with movement */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-slow opacity-60"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-bl from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float-slow-reverse opacity-60" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-40 left-1/4 w-72 h-72 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-float-slow opacity-60" style={{ animationDelay: '4s' }}></div>
      
      {/* Moving particles */}
      {[...Array(60)].map((_, i) => {
        const size = Math.random() * 4 + 2;
        const colors = [
          'from-purple-400/60 to-pink-400/60',
          'from-blue-400/60 to-cyan-400/60',
          'from-emerald-400/60 to-teal-400/60',
          'from-orange-400/60 to-red-400/60',
          'from-violet-400/60 to-fuchsia-400/60'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${randomColor} animate-particle-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${Math.random() * 15 + 10}s`,
              filter: `blur(${Math.random() * 1}px)`,
            }}
          />
        );
      })}
      
      {/* Shooting stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: '3s'
          }}
        />
      ))}
    </div>
  )
}

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  difficulty: "easy" | "medium" | "hard"
  topic: string
  subject: string
  explanation: string
  hint: string
  gradeRating: number
  lastAttempted?: Date
  timesAttempted: number
  lastCorrect: boolean
}

interface LexSession {
  questionsAnswered: number
  correctAnswers: number
  xpEarned: number
  topicsStudied: string[]
  difficultyProgression: string[]
  timeSpent: number
}

// Mock question bank following the algorithm specification
const questionBank: Question[] = [
  {
    id: "q1",
    text: "Solve for x: 2x² - 8x + 6 = 0",
    options: ["x = 1, x = 3", "x = 2, x = 4", "x = 1, x = 6", "x = 3, x = 2"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Quadratic Equations",
    subject: "Mathematics",
    explanation: "Using the quadratic formula or factoring: 2x² - 8x + 6 = 2(x² - 4x + 3) = 2(x-1)(x-3) = 0",
    hint: "Try factoring out the common factor first, then use factoring or the quadratic formula.",
    gradeRating: 75,
    lastAttempted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    timesAttempted: 2,
    lastCorrect: true,
  },
  {
    id: "q2",
    text: "What is the amplitude of the wave y = 3sin(2x + π/4)?",
    options: ["3", "2", "π/4", "1"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Wave Motion",
    subject: "Physics",
    explanation: "The amplitude is the coefficient of the sine function, which is 3.",
    hint: "Look at the coefficient in front of the sine function.",
    gradeRating: 70,
    lastAttempted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    timesAttempted: 1,
    lastCorrect: false,
  },
  {
    id: "q3",
    text: "Which functional group is present in alcohols?",
    options: ["-OH", "-COOH", "-NH₂", "-CHO"],
    correctAnswer: 0,
    difficulty: "easy",
    topic: "Organic Chemistry",
    subject: "Chemistry",
    explanation: "Alcohols contain the hydroxyl functional group (-OH).",
    hint: "Think about the functional group that makes a compound an alcohol.",
    gradeRating: 60,
    lastAttempted: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    timesAttempted: 3,
    lastCorrect: false,
  },
]

export default function LexAdvancedPage() {
  const [currentSession, setCurrentSession] = useState<LexSession>({
    questionsAnswered: 0,
    correctAnswers: 0,
    xpEarned: 0,
    topicsStudied: [],
    difficultyProgression: [],
    timeSpent: 0,
  })
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  // Lex AI Algorithm Implementation
  const generateNextQuestion = (): Question => {
    const now = new Date()
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)

    // 50% from topics studied in the last 2 weeks
    const recentTopics = questionBank.filter(
      (q) => q.lastAttempted && q.lastAttempted >= twoWeeksAgo && q.lastAttempted <= now,
    )

    // 40% from weakly-performing topics (incorrect answers or low grade rating)
    const weakTopics = questionBank.filter((q) => !q.lastCorrect || q.gradeRating < 70)

    // 10% from well-performing but unseen topics
    const unseenTopics = questionBank.filter((q) => !q.lastAttempted || q.lastAttempted < fourWeeksAgo)

    // Reattempt questions if they were incorrect & it's been 4+ weeks
    const reattemptQuestions = questionBank.filter(
      (q) => !q.lastCorrect && q.lastAttempted && q.lastAttempted < fourWeeksAgo,
    )

    let selectedPool: Question[] = []
    const rand = Math.random()

    if (rand < 0.5 && recentTopics.length > 0) {
      selectedPool = recentTopics
    } else if (rand < 0.9 && weakTopics.length > 0) {
      selectedPool = weakTopics
    } else if (unseenTopics.length > 0) {
      selectedPool = unseenTopics
    } else if (reattemptQuestions.length > 0) {
      selectedPool = reattemptQuestions
    } else {
      selectedPool = questionBank
    }

    return selectedPool[Math.floor(Math.random() * selectedPool.length)]
  }

  const adjustDifficulty = (wasCorrect: boolean, currentTopic: string): Question => {
    const topicQuestions = questionBank.filter((q) => q.topic === currentTopic)

    if (wasCorrect) {
      // Find harder question in same topic
      const harderQuestions = topicQuestions.filter((q) => q.gradeRating > (currentQuestion?.gradeRating || 0))
      if (harderQuestions.length > 0) {
        return harderQuestions[Math.floor(Math.random() * harderQuestions.length)]
      }
    } else {
      // Find easier or similar level question
      const easierQuestions = topicQuestions.filter((q) => q.gradeRating <= (currentQuestion?.gradeRating || 100))
      if (easierQuestions.length > 0) {
        return easierQuestions[Math.floor(Math.random() * easierQuestions.length)]
      }
    }

    return generateNextQuestion()
  }

  const startSession = () => {
    setSessionStarted(true)
    setSessionStartTime(new Date())
    setCurrentQuestion(generateNextQuestion())
    setCurrentSession({
      questionsAnswered: 0,
      correctAnswers: 0,
      xpEarned: 0,
      topicsStudied: [],
      difficultyProgression: [],
      timeSpent: 0,
    })
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const xpGain = currentQuestion.difficulty === "hard" ? 30 : currentQuestion.difficulty === "medium" ? 20 : 10

    setShowResult(true)

    // Update session data
    const newSession = {
      ...currentSession,
      questionsAnswered: currentSession.questionsAnswered + 1,
      correctAnswers: currentSession.correctAnswers + (isCorrect ? 1 : 0),
      xpEarned: currentSession.xpEarned + (isCorrect ? xpGain : 0),
      topicsStudied: [...new Set([...currentSession.topicsStudied, currentQuestion.topic])],
      difficultyProgression: [...currentSession.difficultyProgression, currentQuestion.difficulty],
    }
    setCurrentSession(newSession)

    // Update question attempt data (in real app, this would go to backend)
    currentQuestion.lastAttempted = new Date()
    currentQuestion.timesAttempted += 1
    currentQuestion.lastCorrect = isCorrect
  }

  const nextQuestion = () => {
    if (!currentQuestion) return

    if (currentSession.questionsAnswered >= 20) {
      // Complete session after 20 questions
      const timeSpent = sessionStartTime ? (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60 : 0
      setCurrentSession((prev) => ({ ...prev, timeSpent }))
      setSessionComplete(true)
      return
    }

    // Generate next question based on performance
    const wasCorrect = selectedAnswer === currentQuestion.correctAnswer
    const nextQ = adjustDifficulty(wasCorrect, currentQuestion.topic)

    setCurrentQuestion(nextQ)
    setSelectedAnswer(null)
    setShowResult(false)
    setShowHint(false)
  }

  const resetSession = () => {
    setSessionStarted(false)
    setSessionComplete(false)
    setCurrentQuestion(null)
    setSelectedAnswer(null)
    setShowResult(false)
    setShowHint(false)
    setSessionStartTime(null)
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative">
        <AnimatedBackground />
        <Navigation />

        <main className="lg:ml-72 min-h-screen relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-2xl">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold text-white mb-4">
                    Advanced Lex AI Session
                  </h1>
                  <p className="text-xl text-purple-100/80 mb-6">
                    Adaptive learning powered by intelligent question selection algorithms
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2 text-purple-100">
                      <Brain className="w-5 h-5" />
                      <span className="font-medium">AI Algorithms</span>
                    </div>
                    <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                    <div className="flex items-center space-x-2 text-purple-100">
                      <Flame className="w-5 h-5" />
                      <span className="font-medium">Advanced Analytics</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* How Lex AI Works */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-12">
                <div className="p-8 border-b border-white/10">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Brain className="h-8 w-8 text-purple-400" />
                    How Advanced Lex AI Works
                  </h2>
                  <p className="text-purple-100/70">Revolutionary algorithms that adapt to your learning patterns</p>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center backdrop-blur-sm bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-300/20 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
                      <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Target className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-white">Smart Selection</h3>
                      <p className="text-blue-100/80 leading-relaxed">
                        50% recent topics, 40% weak areas, 10% new challenges. 
                        Our AI carefully balances reinforcement with exploration.
                      </p>
                    </div>
                    
                    <div className="text-center backdrop-blur-sm bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-300/20 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
                      <div className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-white">Adaptive Difficulty</h3>
                      <p className="text-green-100/80 leading-relaxed">
                        Questions get harder when you're excelling, easier when you struggle. 
                        Dynamic adjustment ensures optimal challenge level.
                      </p>
                    </div>
                    
                    <div className="text-center backdrop-blur-sm bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-300/20 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
                      <div className="w-16 h-16 mx-auto mb-6 bg-orange-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <RotateCcw className="w-8 h-8 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-white">Spaced Repetition</h3>
                      <p className="text-orange-100/80 leading-relaxed">
                        Revisit incorrect answers after 4+ weeks for better retention. 
                        Science-backed timing for maximum learning efficiency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Session */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">20-Question Session</h3>
                  <p className="text-purple-100/70 mb-6">Experience the full power of our adaptive learning algorithms</p>
                  <Button
                    onClick={startSession}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg w-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Start Advanced Session
                  </Button>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    Session Features
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Real-time difficulty adjustment</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Detailed performance analytics</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Personalized topic recommendations</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>Spaced repetition optimization</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = (currentSession.correctAnswers / currentSession.questionsAnswered) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative">
        <AnimatedBackground />
        <Navigation />

        <main className="lg:ml-72 min-h-screen relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Session Complete! 🎉</h1>
                <p className="text-purple-100/80 mb-8">
                  Lex has analyzed your performance and updated your learning profile.
                </p>

                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div className="bg-green-500/20 rounded-2xl p-8 border border-green-300/20">
                    <div className="text-4xl font-bold text-green-300 mb-3">
                      {currentSession.correctAnswers}/{currentSession.questionsAnswered}
                    </div>
                    <p className="text-green-100/70">Questions Correct</p>
                  </div>
                  <div className="bg-blue-500/20 rounded-2xl p-8 border border-blue-300/20">
                    <div className="text-4xl font-bold text-blue-300 mb-3">+{currentSession.xpEarned}</div>
                    <p className="text-blue-100/70">XP Earned</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-purple-500/10 rounded-2xl p-6 border border-purple-300/20">
                    <div className="flex justify-between text-sm text-purple-100 mb-2">
                      <span>Accuracy:</span>
                      <span className="font-bold">{accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{width: `${accuracy}%`}} />
                    </div>
                  </div>
                  <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-300/20">
                    <div className="flex justify-between text-sm text-blue-100 mb-2">
                      <span>Time Spent:</span>
                      <span className="font-bold">{currentSession.timeSpent.toFixed(1)} min</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Timer className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-orange-500/10 rounded-2xl p-6 border border-orange-300/20">
                    <div className="flex justify-between text-sm text-orange-100 mb-2">
                      <span>Topics Covered:</span>
                      <span className="font-bold">{currentSession.topicsStudied.length}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Target className="w-8 h-8 text-orange-400" />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Topics Studied</h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {currentSession.topicsStudied.map((topic) => (
                      <Badge key={topic} className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6 justify-center">
                  <Button onClick={resetSession} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg px-8">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg px-8">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative">
        <AnimatedBackground />
        <Navigation />
        <main className="lg:ml-72 min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-6"></div>
            <p className="text-purple-100/80 text-lg">Lex is selecting your next question...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative">
      <AnimatedBackground />
      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Progress Header */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">Advanced Learning Session</h1>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-300/20 px-4 py-2">
                  Question {currentSession.questionsAnswered + 1} of 20
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-purple-100">
                  <span>Session Progress</span>
                  <span>{Math.round(((currentSession.questionsAnswered + 1) / 20) * 100)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{width: `${((currentSession.questionsAnswered + 1) / 20) * 100}%`}}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Question Card */}
              <div className="lg:col-span-2">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <div className="p-8 border-b border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-300/20 px-3 py-1">
                        {currentQuestion.topic}
                      </Badge>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-gray-500/20 text-gray-300 border-gray-300/20">
                          {currentQuestion.subject}
                        </Badge>
                        <Badge
                          className={
                            currentQuestion.difficulty === "hard"
                              ? "bg-red-500/20 text-red-300 border-red-300/20"
                              : currentQuestion.difficulty === "medium"
                                ? "bg-yellow-500/20 text-yellow-300 border-yellow-300/20"
                                : "bg-green-500/20 text-green-300 border-green-300/20"
                          }
                        >
                          {currentQuestion.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{currentQuestion.text}</h2>
                  </div>
                  
                  <div className="p-8">
                    <div className="space-y-4">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={showResult}
                          className={`w-full p-6 text-left rounded-2xl border transition-all duration-300 ${
                            selectedAnswer === index
                              ? showResult
                                ? index === currentQuestion.correctAnswer
                                  ? "border-green-400 bg-green-500/20 text-green-300"
                                  : "border-red-400 bg-red-500/20 text-red-300"
                                : "border-blue-400 bg-blue-500/20 text-white"
                              : showResult && index === currentQuestion.correctAnswer
                                ? "border-green-400 bg-green-500/20 text-green-300"
                                : "border-white/20 bg-white/5 hover:bg-white/10 text-white hover:border-white/30"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center font-semibold">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {showResult &&
                              selectedAnswer === index &&
                              (index === currentQuestion.correctAnswer ? (
                                <CheckCircle className="w-6 h-6 text-green-400" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-400" />
                              ))}
                            {showResult && selectedAnswer !== index && index === currentQuestion.correctAnswer && (
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {showResult && (
                      <div className="mt-8 p-6 bg-blue-500/10 border border-blue-300/20 rounded-2xl">
                        <h4 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          Explanation:
                        </h4>
                        <p className="text-blue-100/80 leading-relaxed">{currentQuestion.explanation}</p>
                      </div>
                    )}

                    {showHint && !showResult && (
                      <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-300/20 rounded-2xl">
                        <h4 className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          Hint:
                        </h4>
                        <p className="text-yellow-100/80 leading-relaxed">{currentQuestion.hint}</p>
                      </div>
                    )}

                    <div className="flex gap-4 pt-8">
                      {!showResult && (
                        <>
                          <Button onClick={() => setShowHint(!showHint)} variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                            <Lightbulb className="w-4 h-4 mr-1" />
                            {showHint ? "Hide Hint" : "Show Hint"}
                          </Button>
                          <Button
                            onClick={submitAnswer}
                            disabled={selectedAnswer === null}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                          >
                            Submit Answer
                          </Button>
                        </>
                      )}

                      {showResult && (
                        <Button onClick={nextQuestion} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                          {currentSession.questionsAnswered >= 19 ? "Complete Session" : "Next Question"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Stats */}
              <div className="space-y-8">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Session Progress</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-100/70">Correct:</span>
                      <span className="font-bold text-green-400 text-xl">{currentSession.correctAnswers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-100/70">XP Earned:</span>
                      <span className="font-bold text-blue-400 text-xl">+{currentSession.xpEarned}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-100/70">Accuracy:</span>
                      <span className="font-bold text-white text-xl">
                        {currentSession.questionsAnswered > 0
                          ? Math.round((currentSession.correctAnswers / currentSession.questionsAnswered) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-100/70">Topics:</span>
                      <span className="font-bold text-purple-400 text-xl">{currentSession.topicsStudied.length}</span>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Lex's Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                      <p className="text-purple-100/80 text-sm leading-relaxed">
                        {currentSession.questionsAnswered === 0
                          ? "Starting with questions from your recent study topics."
                          : currentSession.correctAnswers / currentSession.questionsAnswered > 0.7
                            ? "Great performance! Increasing difficulty to challenge you."
                            : "Adjusting difficulty to help you build confidence."}
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Target className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      <p className="text-purple-100/80 text-sm leading-relaxed">
                        Focusing on {currentQuestion.topic} based on your learning profile.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                      <p className="text-purple-100/80 text-sm leading-relaxed">
                        {sessionStartTime &&
                          `Session time: ${Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60)} minutes`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
