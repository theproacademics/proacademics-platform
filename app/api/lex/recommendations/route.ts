import { type NextRequest, NextResponse } from "next/server"

interface StudentPerformance {
  studentId: string
  recentTopics: string[]
  weakAreas: string[]
  strongAreas: string[]
  lastStudyDate: Date
  currentCWA: number
  studyStreak: number
}

interface LexRecommendation {
  topicName: string
  subject: string
  reason: string
  description: string
  estimatedTime: string
  xpPotential: number
  difficulty: "easy" | "medium" | "hard"
  priority: "high" | "medium" | "low"
  suggestedActions: string[]
}

// Mock student performance data
const mockStudentPerformance: StudentPerformance = {
  studentId: "student-1",
  recentTopics: ["Quadratic Equations", "Wave Motion", "Organic Chemistry"],
  weakAreas: ["Inequalities", "Sound Waves", "Energetics"],
  strongAreas: ["Linear Equations", "Forces", "Atomic Structure"],
  lastStudyDate: new Date(),
  currentCWA: 87.5,
  studyStreak: 7,
}

// Lex AI recommendation algorithm
const generateRecommendations = (performance: StudentPerformance): LexRecommendation[] => {
  const recommendations: LexRecommendation[] = []

  // Priority 1: Address weak areas
  if (performance.weakAreas.length > 0) {
    const weakTopic = performance.weakAreas[0]
    recommendations.push({
      topicName: `${weakTopic} - Foundation Review`,
      subject: getSubjectFromTopic(weakTopic),
      reason: "Identified as a weak area needing attention",
      description: `Your performance in ${weakTopic} suggests you need to strengthen the fundamentals. Let's build a solid foundation.`,
      estimatedTime: "30-40 minutes",
      xpPotential: 60,
      difficulty: "easy",
      priority: "high",
      suggestedActions: ["Review basic concepts", "Practice simple problems", "Watch explanation videos"],
    })
  }

  // Priority 2: Build on strong areas
  if (performance.strongAreas.length > 0) {
    const strongTopic = performance.strongAreas[0]
    recommendations.push({
      topicName: `${strongTopic} - Advanced Applications`,
      subject: getSubjectFromTopic(strongTopic),
      reason: "Strong foundation detected, ready for advanced concepts",
      description: `You've mastered the basics of ${strongTopic}! Time to tackle more challenging problems and real-world applications.`,
      estimatedTime: "45-60 minutes",
      xpPotential: 100,
      difficulty: "hard",
      priority: "medium",
      suggestedActions: ["Solve complex problems", "Explore applications", "Challenge yourself"],
    })
  }

  // Priority 3: Recent topic reinforcement
  if (performance.recentTopics.length > 0) {
    const recentTopic = performance.recentTopics[Math.floor(Math.random() * performance.recentTopics.length)]
    recommendations.push({
      topicName: `${recentTopic} - Practice & Review`,
      subject: getSubjectFromTopic(recentTopic),
      reason: "Recently studied, perfect for reinforcement",
      description: `You've been working on ${recentTopic} recently. Let's reinforce your learning with targeted practice.`,
      estimatedTime: "25-35 minutes",
      xpPotential: 75,
      difficulty: "medium",
      priority: "medium",
      suggestedActions: ["Practice problems", "Review mistakes", "Test understanding"],
    })
  }

  return recommendations
}

const getSubjectFromTopic = (topic: string): string => {
  const topicMap: Record<string, string> = {
    "Quadratic Equations": "Mathematics",
    "Linear Equations": "Mathematics",
    Inequalities: "Mathematics",
    "Wave Motion": "Physics",
    Forces: "Physics",
    "Sound Waves": "Physics",
    "Organic Chemistry": "Chemistry",
    "Atomic Structure": "Chemistry",
    Energetics: "Chemistry",
  }

  return topicMap[topic] || "General"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId") || "student-1"

    // In a real implementation, this would:
    // 1. Fetch student performance from Airtable
    // 2. Analyze recent Question Attempts
    // 3. Calculate topic mastery levels
    // 4. Use ML/AI to generate personalized recommendations

    const recommendations = generateRecommendations(mockStudentPerformance)

    // Select the best recommendation based on priority and student needs
    const primaryRecommendation = recommendations.find((r) => r.priority === "high") || recommendations[0]

    return NextResponse.json({
      success: true,
      recommendation: primaryRecommendation,
      alternativeRecommendations: recommendations.slice(1),
      studentPerformance: {
        currentCWA: mockStudentPerformance.currentCWA,
        studyStreak: mockStudentPerformance.studyStreak,
        weakAreasCount: mockStudentPerformance.weakAreas.length,
        strongAreasCount: mockStudentPerformance.strongAreas.length,
      },
    })
  } catch (error) {
    console.error("Recommendation generation error:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, topicName, studentId } = await request.json()

    if (action === "accept_recommendation") {
      // Log that student accepted the recommendation
      // In real implementation: update Lex AI Log table

      return NextResponse.json({
        success: true,
        message: "Recommendation accepted",
        nextAction: "redirect_to_lex_session",
      })
    }

    if (action === "refresh_recommendation") {
      // Generate a new recommendation
      const recommendations = generateRecommendations(mockStudentPerformance)
      const newRecommendation = recommendations[Math.floor(Math.random() * recommendations.length)]

      return NextResponse.json({
        success: true,
        recommendation: newRecommendation,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Recommendation action error:", error)
    return NextResponse.json({ error: "Failed to process recommendation action" }, { status: 500 })
  }
}
