"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Target, Clock, CheckCircle, XCircle, Lightbulb, TrendingUp, Zap, Star } from "lucide-react"

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Brain className="h-10 w-10 text-blue-600" />
                Lex AI Learning Assistant
              </h1>
              <p className="text-lg text-gray-600">Personalized AI-powered learning sessions tailored to your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Adaptive Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100">
                    Questions adapt to your skill level and focus on areas that need improvement
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Real-time Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-100">Track your progress and get instant feedback on your performance</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Recommended Focus Areas
                </CardTitle>
                <CardDescription>
                  Based on your recent performance, Lex AI suggests focusing on these topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <h4 className="font-medium text-orange-900">Calculus</h4>
                    <p className="text-sm text-orange-700 mt-1">65% accuracy - Needs improvement</p>
                    <Progress value={65} className="mt-2 h-2" />
                  </div>
                  <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <h4 className="font-medium text-yellow-900">Probability</h4>
                    <p className="text-sm text-yellow-700 mt-1">72% accuracy - Good progress</p>
                    <Progress value={72} className="mt-2 h-2" />
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <h4 className="font-medium text-green-900">Algebra</h4>
                    <p className="text-sm text-green-700 mt-1">89% accuracy - Well mastered</p>
                    <Progress value={89} className="mt-2 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={startSession}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Start Lex AI Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentQuestion >= mockQuestions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  Session Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{sessionStats.questionsAnswered}</div>
                    <div className="text-sm text-blue-800">Questions Answered</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{sessionStats.correctAnswers}</div>
                    <div className="text-sm text-green-800">Correct Answers</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{sessionStats.xpEarned}</div>
                    <div className="text-sm text-purple-800">XP Earned</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100)}%
                    </div>
                    <div className="text-sm text-orange-800">Accuracy</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Topics Studied</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from(sessionStats.topicsStudied).map((topic, index) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={startSession} className="w-full">
                  Start Another Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lex AI Session</h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {mockQuestions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{timeLeft}s</span>
              </div>
              <Badge variant="outline">
                <Zap className="h-3 w-3 mr-1" />
                {sessionStats.xpEarned} XP
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <Progress value={((currentQuestion + 1) / mockQuestions.length) * 100} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="mb-2">
                  {question.topic}
                </Badge>
                <Badge
                  variant={
                    question.difficulty === "easy"
                      ? "default"
                      : question.difficulty === "medium"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {question.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-xl">{question.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      selectedAnswer === index
                        ? showResult
                          ? index === question.correctAnswer
                            ? "border-green-500 bg-green-50 text-green-900"
                            : "border-red-500 bg-red-50 text-red-900"
                          : "border-blue-500 bg-blue-50 text-blue-900"
                        : showResult && index === question.correctAnswer
                          ? "border-green-500 bg-green-50 text-green-900"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index
                            ? showResult
                              ? index === question.correctAnswer
                                ? "border-green-500 bg-green-500"
                                : "border-red-500 bg-red-500"
                              : "border-blue-500 bg-blue-500"
                            : showResult && index === question.correctAnswer
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300"
                        }`}
                      >
                        {showResult &&
                          (selectedAnswer === index ? (
                            index === question.correctAnswer ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <XCircle className="h-4 w-4 text-white" />
                            )
                          ) : index === question.correctAnswer ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : null)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {showResult && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Explanation:</h4>
                  <p className="text-gray-700">{question.explanation}</p>
                </div>
              )}

              {showHint && !showResult && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Hint:</h4>
                      <p className="text-yellow-800 text-sm">{question.hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowHint(!showHint)}
              disabled={showResult}
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              {showHint ? "Hide Hint" : "Show Hint"}
            </Button>

            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || showResult}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Answer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
