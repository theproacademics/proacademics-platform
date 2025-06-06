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
} from "lucide-react"

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />

        <main className="lg:ml-72 min-h-screen">
          <ResponsiveContainer padding="lg" animated>
            <PageHeader
              title="Advanced Lex AI Session"
              description="Adaptive learning powered by intelligent question selection"
            />

            <div className="max-w-4xl mx-auto">
              <AnimatedCard delay={200}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="w-6 h-6 mr-2 text-purple-400" />
                    How Lex AI Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 rounded-lg bg-white/5">
                      <Target className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                      <h3 className="font-semibold mb-2 text-white">Smart Selection</h3>
                      <p className="text-sm text-muted-foreground">
                        50% recent topics, 40% weak areas, 10% new challenges
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/5">
                      <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-400" />
                      <h3 className="font-semibold mb-2 text-white">Adaptive Difficulty</h3>
                      <p className="text-sm text-muted-foreground">
                        Questions get harder when you're doing well, easier when you struggle
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/5">
                      <RotateCcw className="w-8 h-8 mx-auto mb-3 text-orange-400" />
                      <h3 className="font-semibold mb-2 text-white">Spaced Repetition</h3>
                      <p className="text-sm text-muted-foreground">
                        Revisit incorrect answers after 4+ weeks for better retention
                      </p>
                    </div>
                  </div>

                  <div className="text-center pt-6">
                    <Button
                      onClick={startSession}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 button-hover"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Start Adaptive Session
                    </Button>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </ResponsiveContainer>
        </main>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = (currentSession.correctAnswers / currentSession.questionsAnswered) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />

        <main className="lg:ml-72 min-h-screen">
          <ResponsiveContainer padding="lg" animated>
            <div className="max-w-2xl mx-auto text-center">
              <AnimatedCard delay={200}>
                <CardContent className="p-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold gradient-text mb-4">Session Complete! 🎉</h1>
                  <p className="text-muted-foreground mb-8">
                    Lex has analyzed your performance and updated your learning profile.
                  </p>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {currentSession.correctAnswers}/{currentSession.questionsAnswered}
                      </div>
                      <p className="text-sm text-muted-foreground">Questions Correct</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">+{currentSession.xpEarned}</div>
                      <p className="text-sm text-muted-foreground">XP Earned</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy:</span>
                      <span className="font-semibold">{accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Spent:</span>
                      <span className="font-semibold">{currentSession.timeSpent.toFixed(1)} minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Topics Covered:</span>
                      <span className="font-semibold">{currentSession.topicsStudied.length}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <h3 className="font-semibold text-white">Topics Studied:</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentSession.topicsStudied.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button onClick={resetSession} variant="outline" className="button-hover">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Session
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 button-hover">View Progress</Button>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </ResponsiveContainer>
        </main>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="lg:ml-72 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Lex is selecting your next question...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />

      <main className="lg:ml-72 min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold gradient-text">Adaptive Learning Session</h1>
              <Badge variant="outline" className="px-3 py-1">
                Question {currentSession.questionsAnswered + 1} of 20
              </Badge>
            </div>
            <Progress value={((currentSession.questionsAnswered + 1) / 20) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Question Card */}
            <div className="lg:col-span-2">
              <AnimatedCard delay={200}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{currentQuestion.topic}</Badge>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{currentQuestion.subject}</Badge>
                      <Badge
                        variant="outline"
                        className={
                          currentQuestion.difficulty === "hard"
                            ? "border-red-500 text-red-400"
                            : currentQuestion.difficulty === "medium"
                              ? "border-yellow-500 text-yellow-400"
                              : "border-green-500 text-green-400"
                        }
                      >
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-white">{currentQuestion.text}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        selectedAnswer === index
                          ? showResult
                            ? index === currentQuestion.correctAnswer
                              ? "border-green-500 bg-green-500/20 text-green-400"
                              : "border-red-500 bg-red-500/20 text-red-400"
                            : "border-blue-500 bg-blue-500/20"
                          : showResult && index === currentQuestion.correctAnswer
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : "border-white/20 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-3 text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                        {showResult &&
                          selectedAnswer === index &&
                          (index === currentQuestion.correctAnswer ? (
                            <CheckCircle className="w-5 h-5 ml-auto text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 ml-auto text-red-400" />
                          ))}
                        {showResult && selectedAnswer !== index && index === currentQuestion.correctAnswer && (
                          <CheckCircle className="w-5 h-5 ml-auto text-green-400" />
                        )}
                      </div>
                    </button>
                  ))}

                  {showResult && (
                    <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-semibold text-blue-400 mb-2">Explanation:</h4>
                      <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {showHint && !showResult && (
                    <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Hint:</h4>
                      <p className="text-sm text-muted-foreground">{currentQuestion.hint}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    {!showResult && (
                      <>
                        <Button onClick={() => setShowHint(!showHint)} variant="outline" size="sm">
                          <Lightbulb className="w-4 h-4 mr-1" />
                          {showHint ? "Hide Hint" : "Show Hint"}
                        </Button>
                        <Button
                          onClick={submitAnswer}
                          disabled={selectedAnswer === null}
                          className="bg-gradient-to-r from-blue-500 to-purple-600"
                        >
                          Submit Answer
                        </Button>
                      </>
                    )}

                    {showResult && (
                      <Button onClick={nextQuestion} className="bg-gradient-to-r from-blue-500 to-purple-600">
                        {currentSession.questionsAnswered >= 19 ? "Complete Session" : "Next Question"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>

            {/* Session Stats */}
            <div className="space-y-6">
              <AnimatedCard delay={300}>
                <CardHeader>
                  <CardTitle className="text-lg text-white">Session Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Correct:</span>
                    <span className="font-semibold text-green-400">{currentSession.correctAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP Earned:</span>
                    <span className="font-semibold text-blue-400">+{currentSession.xpEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="font-semibold">
                      {currentSession.questionsAnswered > 0
                        ? Math.round((currentSession.correctAnswers / currentSession.questionsAnswered) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Topics:</span>
                    <span className="font-semibold">{currentSession.topicsStudied.length}</span>
                  </div>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard delay={400}>
                <CardHeader>
                  <CardTitle className="text-lg text-white">Lex's Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        {currentSession.questionsAnswered === 0
                          ? "Starting with questions from your recent study topics."
                          : currentSession.correctAnswers / currentSession.questionsAnswered > 0.7
                            ? "Great performance! Increasing difficulty to challenge you."
                            : "Adjusting difficulty to help you build confidence."}
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        Focusing on {currentQuestion.topic} based on your learning profile.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        {sessionStartTime &&
                          `Session time: ${Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60)} minutes`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  )
}
