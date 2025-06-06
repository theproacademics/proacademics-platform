"use client"

import { useState, useEffect } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { Brain, Clock, Zap, TrendingUp, Target, BookOpen } from "lucide-react"

interface LexRecommendation {
  id: string
  topicName: string
  subject: string
  reason: string
  description: string
  estimatedTime: string
  xpPotential: number
  difficulty: "easy" | "medium" | "hard"
  priority: "high" | "medium" | "low"
  suggestedLesson?: {
    title: string
    id: string
  }
}

// Mock recommendation algorithm based on student performance
const generateRecommendation = (): LexRecommendation => {
  const recommendations: LexRecommendation[] = [
    {
      id: "rec-1",
      topicName: "Quadratic Equations - Advanced Applications",
      subject: "Mathematics",
      reason: "Strong foundation, ready for advanced concepts",
      description: "You've mastered the basics! Time to tackle complex quadratic problems and real-world applications.",
      estimatedTime: "45 minutes",
      xpPotential: 75,
      difficulty: "medium",
      priority: "high",
      suggestedLesson: {
        title: "Quadratic Applications in Physics",
        id: "lesson-math-quad-adv",
      },
    },
    {
      id: "rec-2",
      topicName: "Wave Motion - Frequency & Amplitude",
      subject: "Physics",
      reason: "Recent struggles detected, needs reinforcement",
      description: "Let's strengthen your understanding of wave properties with focused practice and visual examples.",
      estimatedTime: "30 minutes",
      xpPotential: 50,
      difficulty: "easy",
      priority: "high",
      suggestedLesson: {
        title: "Understanding Wave Properties",
        id: "lesson-phys-waves-basic",
      },
    },
    {
      id: "rec-3",
      topicName: "Organic Chemistry - Functional Groups",
      subject: "Chemistry",
      reason: "Upcoming assessment preparation",
      description: "Review functional groups and their properties before your chemistry test next week.",
      estimatedTime: "35 minutes",
      xpPotential: 60,
      difficulty: "medium",
      priority: "medium",
      suggestedLesson: {
        title: "Functional Groups Masterclass",
        id: "lesson-chem-functional",
      },
    },
  ]

  return recommendations[Math.floor(Math.random() * recommendations.length)]
}

export function LexRecommends() {
  const [recommendation, setRecommendation] = useState<LexRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate AI recommendation generation
    const timer = setTimeout(() => {
      setRecommendation(generateRecommendation())
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const refreshRecommendation = () => {
    setIsLoading(true)
    setTimeout(() => {
      setRecommendation(generateRecommendation())
      setIsLoading(false)
    }, 800)
  }

  const priorityColors = {
    high: "border-red-500/30 bg-red-500/10",
    medium: "border-yellow-500/30 bg-yellow-500/10",
    low: "border-green-500/30 bg-green-500/10",
  }

  const difficultyColors = {
    easy: "border-green-500 text-green-400",
    medium: "border-yellow-500 text-yellow-400",
    hard: "border-red-500 text-red-400",
  }

  if (isLoading) {
    return (
      <AnimatedCard delay={150} className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Lex is analyzing...</h3>
              <p className="text-sm text-muted-foreground">Generating personalized recommendations</p>
            </div>
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-10 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </AnimatedCard>
    )
  }

  if (!recommendation) return null

  return (
    <AnimatedCard delay={150} className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Lex Recommends</h3>
              <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
              {recommendation.subject}
            </Badge>
            <Badge variant="outline" className={`${priorityColors[recommendation.priority]} text-xs`}>
              {recommendation.priority} priority
            </Badge>
          </div>
        </div>

        <div className={`rounded-lg p-4 mb-4 ${priorityColors[recommendation.priority]}`}>
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-medium text-white">{recommendation.topicName}</h4>
            <Badge variant="outline" className={`${difficultyColors[recommendation.difficulty]} text-xs`}>
              {recommendation.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{recommendation.estimatedTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>{recommendation.xpPotential} XP potential</span>
            </div>
            {recommendation.priority === "high" && (
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-red-400" />
                <span>Recommended today</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 button-hover flex-1">
            <Brain className="w-4 h-4 mr-2" />
            Work With Lex
          </Button>
          {recommendation.suggestedLesson && (
            <Button variant="outline" className="button-hover">
              <BookOpen className="w-4 h-4 mr-2" />
              View Lesson
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshRecommendation}
            className="hover:bg-white/10"
            title="Get new recommendation"
          >
            <TrendingUp className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}
