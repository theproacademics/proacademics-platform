// Lex AI Algorithm Implementation
// Based on the project scope specifications

export interface QuestionAttempt {
  questionId: string
  studentId: string
  attemptDate: Date
  correct: boolean
  timeTaken: number
  watchedSolution: boolean
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  topic: string
  subject: string
  gradeRating: number // 10-99 scale
  difficulty: "easy" | "medium" | "hard"
  explanation: string
  hint: string
  videoSolutionLink?: string
}

export interface StudentProfile {
  id: string
  weakTopics: string[]
  strongTopics: string[]
  recentTopics: string[]
  lastStudyDate: Date
  currentLevel: number
  xpTotal: number
}

export class LexAIAlgorithm {
  private questionBank: Question[]
  private attempts: QuestionAttempt[]

  constructor(questionBank: Question[], attempts: QuestionAttempt[]) {
    this.questionBank = questionBank
    this.attempts = attempts
  }

  /**
   * Generate 20 questions for a Lex session based on the algorithm:
   * - 50% from topics studied in the last 2 weeks
   * - 40% from weakly-performing topics
   * - 10% from well-performing but unseen topics
   * - Reattempt questions if they were incorrect & it's been 4+ weeks
   */
  generateSessionQuestions(studentId: string, profile: StudentProfile): Question[] {
    const now = new Date()
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)

    const studentAttempts = this.attempts.filter((a) => a.studentId === studentId)

    // 50% from topics studied in the last 2 weeks
    const recentTopicQuestions = this.getRecentTopicQuestions(studentAttempts, twoWeeksAgo)

    // 40% from weakly-performing topics
    const weakTopicQuestions = this.getWeakTopicQuestions(studentAttempts, profile.weakTopics)

    // 10% from well-performing but unseen topics
    const unseenQuestions = this.getUnseenQuestions(studentAttempts, fourWeeksAgo)

    // Reattempt incorrect questions from 4+ weeks ago
    const reattemptQuestions = this.getReattemptQuestions(studentAttempts, fourWeeksAgo)

    const sessionQuestions: Question[] = []

    // Add questions based on percentages
    sessionQuestions.push(...this.selectRandomQuestions(recentTopicQuestions, 10)) // 50% of 20
    sessionQuestions.push(...this.selectRandomQuestions(weakTopicQuestions, 8)) // 40% of 20
    sessionQuestions.push(...this.selectRandomQuestions(unseenQuestions, 2)) // 10% of 20

    // Fill remaining slots with reattempt questions if available
    const remaining = 20 - sessionQuestions.length
    if (remaining > 0 && reattemptQuestions.length > 0) {
      sessionQuestions.push(...this.selectRandomQuestions(reattemptQuestions, remaining))
    }

    // If still not enough questions, fill with random questions
    if (sessionQuestions.length < 20) {
      const allQuestions = this.questionBank.filter((q) => !sessionQuestions.some((sq) => sq.id === q.id))
      sessionQuestions.push(...this.selectRandomQuestions(allQuestions, 20 - sessionQuestions.length))
    }

    return sessionQuestions.slice(0, 20)
  }

  /**
   * Adjust difficulty based on performance
   * If correct → harder question in same topic
   * If incorrect → easier or similar level question
   */
  getNextQuestion(currentQuestion: Question, wasCorrect: boolean, studentId: string): Question | null {
    const sameTopicQuestions = this.questionBank.filter(
      (q) => q.topic === currentQuestion.topic && q.id !== currentQuestion.id,
    )

    if (wasCorrect) {
      // Find harder question in same topic
      const harderQuestions = sameTopicQuestions.filter((q) => q.gradeRating > currentQuestion.gradeRating)
      if (harderQuestions.length > 0) {
        return this.selectRandomQuestions(harderQuestions, 1)[0]
      }
    } else {
      // Find easier or similar level question
      const easierQuestions = sameTopicQuestions.filter((q) => q.gradeRating <= currentQuestion.gradeRating)
      if (easierQuestions.length > 0) {
        return this.selectRandomQuestions(easierQuestions, 1)[0]
      }
    }

    // Fallback to any question from the same topic
    return sameTopicQuestions.length > 0 ? this.selectRandomQuestions(sameTopicQuestions, 1)[0] : null
  }

  /**
   * Calculate topic mastery and update CWA
   */
  calculateTopicMastery(studentId: string, topic: string): number {
    const topicAttempts = this.attempts.filter(
      (a) => a.studentId === studentId && this.questionBank.find((q) => q.id === a.questionId)?.topic === topic,
    )

    if (topicAttempts.length === 0) return 0

    const correctAttempts = topicAttempts.filter((a) => a.correct).length
    return (correctAttempts / topicAttempts.length) * 100
  }

  /**
   * Update student profile based on session performance
   */
  updateStudentProfile(
    studentId: string,
    sessionQuestions: Question[],
    sessionAttempts: QuestionAttempt[],
  ): Partial<StudentProfile> {
    const topicPerformance = new Map<string, { correct: number; total: number }>()

    sessionAttempts.forEach((attempt) => {
      const question = sessionQuestions.find((q) => q.id === attempt.questionId)
      if (question) {
        const current = topicPerformance.get(question.topic) || { correct: 0, total: 0 }
        topicPerformance.set(question.topic, {
          correct: current.correct + (attempt.correct ? 1 : 0),
          total: current.total + 1,
        })
      }
    })

    const weakTopics: string[] = []
    const strongTopics: string[] = []
    const recentTopics: string[] = []

    topicPerformance.forEach((performance, topic) => {
      const accuracy = performance.correct / performance.total
      recentTopics.push(topic)

      if (accuracy < 0.7) {
        weakTopics.push(topic)
      } else if (accuracy > 0.85) {
        strongTopics.push(topic)
      }
    })

    return {
      weakTopics,
      strongTopics,
      recentTopics,
      lastStudyDate: new Date(),
    }
  }

  private getRecentTopicQuestions(attempts: QuestionAttempt[], twoWeeksAgo: Date): Question[] {
    const recentAttempts = attempts.filter((a) => a.attemptDate >= twoWeeksAgo)
    const recentQuestionIds = new Set(recentAttempts.map((a) => a.questionId))
    const recentTopics = new Set(
      recentAttempts.map((a) => this.questionBank.find((q) => q.id === a.questionId)?.topic).filter(Boolean),
    )

    return this.questionBank.filter((q) => recentTopics.has(q.topic) && !recentQuestionIds.has(q.id))
  }

  private getWeakTopicQuestions(attempts: QuestionAttempt[], weakTopics: string[]): Question[] {
    const weakAttempts = attempts.filter((a) => {
      const question = this.questionBank.find((q) => q.id === a.questionId)
      return question && weakTopics.includes(question.topic)
    })

    const incorrectQuestionIds = new Set(weakAttempts.filter((a) => !a.correct).map((a) => a.questionId))

    return this.questionBank.filter((q) => weakTopics.includes(q.topic) && !incorrectQuestionIds.has(q.id))
  }

  private getUnseenQuestions(attempts: QuestionAttempt[], fourWeeksAgo: Date): Question[] {
    const attemptedQuestionIds = new Set(attempts.filter((a) => a.attemptDate >= fourWeeksAgo).map((a) => a.questionId))

    return this.questionBank.filter((q) => !attemptedQuestionIds.has(q.id))
  }

  private getReattemptQuestions(attempts: QuestionAttempt[], fourWeeksAgo: Date): Question[] {
    const oldIncorrectAttempts = attempts.filter((a) => !a.correct && a.attemptDate < fourWeeksAgo)

    const questionIds = new Set(oldIncorrectAttempts.map((a) => a.questionId))
    return this.questionBank.filter((q) => questionIds.has(q.id))
  }

  private selectRandomQuestions(questions: Question[], count: number): Question[] {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
}

// XP Calculation utilities
export const calculateXP = (difficulty: string, correct: boolean, timeBonus = false): number => {
  if (!correct) return 0

  let baseXP = 0
  switch (difficulty) {
    case "easy":
      baseXP = 10
      break
    case "medium":
      baseXP = 20
      break
    case "hard":
      baseXP = 30
      break
    default:
      baseXP = 15
  }

  return timeBonus ? Math.floor(baseXP * 1.2) : baseXP
}

// Level calculation
export const calculateLevel = (totalXP: number): number => {
  return Math.floor(totalXP / 200) + 1
}

// CWA (Current Working Average) calculation
export const calculateCWA = (attempts: QuestionAttempt[]): number => {
  if (attempts.length === 0) return 0

  const recentAttempts = attempts.sort((a, b) => b.attemptDate.getTime() - a.attemptDate.getTime()).slice(0, 50) // Last 50 attempts

  const correctCount = recentAttempts.filter((a) => a.correct).length
  return (correctCount / recentAttempts.length) * 100
}
