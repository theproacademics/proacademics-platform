"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/layout/navigation"
import { Brain, Target, Clock, CheckCircle, XCircle, Lightbulb, TrendingUp, Zap, Star, ArrowRight, Sparkles, Trophy, PlayCircle, RotateCcw, Settings, Rocket } from "lucide-react"
import Link from "next/link"

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-purple-900/40"></div>
      
      {/* Large floating orbs with movement */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float-slow opacity-60"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-bl from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-slow-reverse opacity-60" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-40 left-1/4 w-72 h-72 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-float-slow opacity-60" style={{ animationDelay: '4s' }}></div>
      
      {/* Moving particles */}
      {[...Array(80)].map((_, i) => {
        const size = Math.random() * 4 + 2;
        const colors = [
          'from-blue-400/60 to-cyan-400/60',
          'from-purple-400/60 to-pink-400/60',
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
      {[...Array(6)].map((_, i) => (
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
      
      {/* Floating geometric shapes */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`shape-${i}`}
          className="absolute animate-shape-float opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 20 + 15}s`
          }}
        >
          {i % 3 === 0 && (
            <div className="w-2 h-2 border border-cyan-400/40 rotate-45 transform"></div>
          )}
          {i % 3 === 1 && (
            <div className="w-1.5 h-1.5 bg-purple-400/40 rounded-full"></div>
          )}
          {i % 3 === 2 && (
            <div className="w-2 h-2 border border-pink-400/40 rounded-full"></div>
          )}
        </div>
      ))}
    </div>
  )
}

// Mock question data
const mockQuestions = [
  {
    id: 1,
    text: "Solve for x: 2x² + 5x - 3 = 0",
    options: ["x = 1/2, x = -3", "x = -1/2, x = 3", "x = 1, x = -3/2", "x = -1, x = 3/2"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Quadratic Equations",
    hint: "Use the quadratic formula: x = (-b ± √(b²-4ac)) / 2a",
    explanation: "Using the quadratic formula with a=2, b=5, c=-3: x = (-5 ± √(25+24))/4 = (-5 ± 7)/4",
  },
  {
    id: 2,
    text: "What is the derivative of f(x) = 3x³ - 2x² + x - 5?",
    options: ["9x² - 4x + 1", "9x² - 4x - 5", "6x² - 4x + 1", "3x² - 2x + 1"],
    correctAnswer: 0,
    difficulty: "hard",
    topic: "Calculus",
    hint: "Apply the power rule: d/dx(xⁿ) = nxⁿ⁻¹",
    explanation: "Using the power rule: f'(x) = 9x² - 4x + 1",
  },
]

export default function LexAIPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    xpEarned: 0,
    topicsStudied: new Set<string>(),
  })

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (sessionStarted && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [timeLeft, sessionStarted, showResult])

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === mockQuestions[currentQuestion].correctAnswer
    const newStats = {
      ...sessionStats,
      questionsAnswered: sessionStats.questionsAnswered + 1,
      correctAnswers: sessionStats.correctAnswers + (isCorrect ? 1 : 0),
      xpEarned: sessionStats.xpEarned + (isCorrect ? 25 : 10),
      topicsStudied: new Set([...sessionStats.topicsStudied, mockQuestions[currentQuestion].topic]),
    }
    setSessionStats(newStats)

    if (isCorrect) {
      setScore(score + 1)
    }

    setShowResult(true)

    // Auto-advance after 3 seconds
    setTimeout(() => {
      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setShowHint(false)
        setTimeLeft(60)
      } else {
        // Session complete
        setSessionStarted(false)
      }
    }, 3000)
  }

  const startSession = () => {
    setSessionStarted(true)
    setCurrentQuestion(0)
    setScore(0)
    setTimeLeft(60)
    setSessionStats({
      questionsAnswered: 0,
      correctAnswers: 0,
      xpEarned: 0,
      topicsStudied: new Set(),
    })
  }

  const question = mockQuestions[currentQuestion]

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
        <AnimatedBackground />
        <Navigation />
        
        <div className="lg:ml-80 relative z-10">
          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-2xl">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold text-white mb-4">
                    Lex AI Learning Assistant
                  </h1>
                  <p className="text-xl text-blue-100/80 mb-6">
                    Personalized AI-powered learning sessions tailored to your needs
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2 text-blue-100">
                      <Target className="w-5 h-5" />
                      <span className="font-medium">Adaptive Learning</span>
                    </div>
                    <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                    <div className="flex items-center space-x-2 text-blue-100">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-medium">AI-Powered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-300/20 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Adaptive Learning</h3>
                  <p className="text-blue-100/70 leading-relaxed">
                    Questions adapt to your skill level and focus on areas that need improvement. 
                    Our AI analyzes your performance in real-time.
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-300/20 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Brain className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Real-time Analytics</h3>
                  <p className="text-purple-100/70 leading-relaxed">
                    Track your progress and get instant feedback on your performance. 
                    Detailed analytics help you understand your strengths and weaknesses.
                  </p>
                </div>
              </div>

              {/* Recommended Focus Areas */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-12">
                <div className="p-8 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Star className="h-8 w-8 text-yellow-400" />
                        Recommended Focus Areas
                      </h2>
                      <p className="text-blue-100/70">Based on your recent performance, Lex AI suggests focusing on these topics</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                      <Settings className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="backdrop-blur-sm bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-300/20 rounded-2xl p-6 hover:bg-orange-500/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white">Calculus</h4>
                        <div className="p-2 bg-orange-500/30 rounded-lg">
                          <Target className="w-5 h-5 text-orange-300" />
                        </div>
                      </div>
                      <p className="text-orange-100/80 text-sm mb-4">65% accuracy - Needs improvement</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-orange-100">
                          <span>Progress</span>
                          <span>65%</span>
                        </div>
                        <div className="h-2 bg-orange-900/30 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full" style={{width: '65%'}} />
                        </div>
                      </div>
                    </div>

                    <div className="backdrop-blur-sm bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-300/20 rounded-2xl p-6 hover:bg-yellow-500/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white">Probability</h4>
                        <div className="p-2 bg-yellow-500/30 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-yellow-300" />
                        </div>
                      </div>
                      <p className="text-yellow-100/80 text-sm mb-4">72% accuracy - Good progress</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-yellow-100">
                          <span>Progress</span>
                          <span>72%</span>
                        </div>
                        <div className="h-2 bg-yellow-900/30 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" style={{width: '72%'}} />
                        </div>
                      </div>
                    </div>

                    <div className="backdrop-blur-sm bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-300/20 rounded-2xl p-6 hover:bg-green-500/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white">Algebra</h4>
                        <div className="p-2 bg-green-500/30 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-300" />
                        </div>
                      </div>
                      <p className="text-green-100/80 text-sm mb-4">89% accuracy - Well mastered</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-green-100">
                          <span>Progress</span>
                          <span>89%</span>
                        </div>
                        <div className="h-2 bg-green-900/30 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" style={{width: '89%'}} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Quick Session</h3>
                  <p className="text-blue-100/70 mb-6">Start a standard Lex AI learning session with adaptive questions</p>
                  <Button
                    onClick={startSession}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg w-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Start Quick Session
                  </Button>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Advanced Mode</h3>
                  <p className="text-purple-100/70 mb-6">Experience our most sophisticated AI algorithms and detailed analytics</p>
                  <Link href="/lex/advanced">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg w-full shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Try Advanced Mode
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentQuestion >= mockQuestions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
        <AnimatedBackground />
        <Navigation />
        
        <div className="lg:ml-80 relative z-10">
          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Session Complete! 🎉</h1>
                <p className="text-blue-100/80 mb-8">
                  Great job! Your learning session has been completed and your progress has been saved.
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-500/20 rounded-2xl p-6 border border-blue-300/20">
                    <div className="text-3xl font-bold text-blue-300 mb-2">{sessionStats.questionsAnswered}</div>
                    <div className="text-blue-100/70 text-sm">Questions Answered</div>
                  </div>
                  <div className="bg-green-500/20 rounded-2xl p-6 border border-green-300/20">
                    <div className="text-3xl font-bold text-green-300 mb-2">{sessionStats.correctAnswers}</div>
                    <div className="text-green-100/70 text-sm">Correct Answers</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-2xl p-6 border border-purple-300/20">
                    <div className="text-3xl font-bold text-purple-300 mb-2">{sessionStats.xpEarned}</div>
                    <div className="text-purple-100/70 text-sm">XP Earned</div>
                  </div>
                  <div className="bg-orange-500/20 rounded-2xl p-6 border border-orange-300/20">
                    <div className="text-3xl font-bold text-orange-300 mb-2">
                      {Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100)}%
                    </div>
                    <div className="text-orange-100/70 text-sm">Accuracy</div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xl font-bold text-white mb-4">Topics Studied</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from(sessionStats.topicsStudied).map((topic, index) => (
                      <Badge key={index} className="bg-white/10 text-white border-white/20 px-3 py-1">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={startSession} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                  <Link href="/lex/advanced">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                      <Rocket className="w-4 h-4 mr-2" />
                      Try Advanced Mode
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
      <AnimatedBackground />
      <Navigation />
      
      <div className="lg:ml-80 relative z-10">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Lex AI Session</h1>
                  <p className="text-blue-100/70">
                    Question {currentQuestion + 1} of {mockQuestions.length}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-blue-500/20 rounded-xl px-4 py-2 border border-blue-300/20">
                    <Clock className="h-5 w-5 text-blue-300" />
                    <span className="font-mono text-xl text-white">{timeLeft}s</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-500/20 rounded-xl px-4 py-2 border border-purple-300/20">
                    <Zap className="h-5 w-5 text-purple-300" />
                    <span className="font-semibold text-white">{sessionStats.xpEarned} XP</span>
                  </div>
                </div>
              </div>
              
              {/* Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-blue-100 mb-2">
                  <span>Session Progress</span>
                  <span>{Math.round(((currentQuestion + 1) / mockQuestions.length) * 100)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%`}}
                  />
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-8">
              <div className="p-8 border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-300/20 px-3 py-1">
                    {question.topic}
                  </Badge>
                  <Badge
                    className={
                      question.difficulty === "easy"
                        ? "bg-green-500/20 text-green-300 border-green-300/20"
                        : question.difficulty === "medium"
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-300/20"
                          : "bg-red-500/20 text-red-300 border-red-300/20"
                    }
                  >
                    {question.difficulty}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-white">{question.text}</h2>
              </div>
              
              <div className="p-8">
                <div className="space-y-4">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-6 text-left rounded-2xl border transition-all duration-300 ${
                        selectedAnswer === index
                          ? showResult
                            ? index === question.correctAnswer
                              ? "border-green-400 bg-green-500/20 text-green-300"
                              : "border-red-400 bg-red-500/20 text-red-300"
                            : "border-blue-400 bg-blue-500/20 text-white"
                          : showResult && index === question.correctAnswer
                            ? "border-green-400 bg-green-500/20 text-green-300"
                            : "border-white/20 bg-white/5 hover:bg-white/10 text-white hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                            selectedAnswer === index
                              ? showResult
                                ? index === question.correctAnswer
                                  ? "border-green-400 bg-green-500 text-white"
                                  : "border-red-400 bg-red-500 text-white"
                                : "border-blue-400 bg-blue-500 text-white"
                              : showResult && index === question.correctAnswer
                                ? "border-green-400 bg-green-500 text-white"
                                : "border-white/30 text-white"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option}</span>
                        {showResult &&
                          (selectedAnswer === index ? (
                            index === question.correctAnswer ? (
                              <CheckCircle className="h-6 w-6 text-green-400" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-400" />
                            )
                          ) : index === question.correctAnswer ? (
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          ) : null)}
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
                    <p className="text-blue-100/80 leading-relaxed">{question.explanation}</p>
                  </div>
                )}

                {showHint && !showResult && (
                  <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-300/20 rounded-2xl">
                    <h4 className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Hint:
                    </h4>
                    <p className="text-yellow-100/80 leading-relaxed">{question.hint}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowHint(!showHint)}
                disabled={showResult}
                className="flex items-center gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Lightbulb className="h-4 w-4" />
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>

              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || showResult}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-8"
              >
                Submit Answer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
