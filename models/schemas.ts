import type { ObjectId } from "mongodb"

// Base interfaces
export interface BaseDocument {
  _id?: ObjectId
  createdAt: Date
  updatedAt: Date
}

// User types
export interface Student extends BaseDocument {
  studentId: string
  name: string
  email: string
  password: string
  role: "student"
  avatar?: string
  xpTotal: number
  currentLevel: number
  predictedGrade?: string
  currentWorkingAverage: number
  studyStreak: number
  lastLogin: Date
  enrolledPrograms: ObjectId[]
  parentId?: ObjectId
  weakTopics: string[]
  strongTopics: string[]
  recentTopics: string[]
}

export interface Teacher extends BaseDocument {
  teacherId: string
  name: string
  email: string
  password: string
  role: "teacher"
  avatar?: string
  subjects: string[]
  programs: ObjectId[]
}

export interface Parent extends BaseDocument {
  parentId: string
  name: string
  email: string
  password: string
  role: "parent"
  students: ObjectId[]
  viewAccessLevel: "full" | "summary" | "reports"
  reportFrequency: "weekly" | "biweekly" | "monthly"
  lastReportSent?: Date
}

export interface Admin extends BaseDocument {
  adminId: string
  name: string
  email: string
  password: string
  role: "admin"
  permissions: string[]
}

// Academic content
export interface Program extends BaseDocument {
  programName: string
  subject: string
  year: string
  students: ObjectId[]
  lessons: ObjectId[]
  description?: string
}

export interface Lesson extends BaseDocument {
  lessonId: string
  programId: ObjectId
  date: Date
  time: string
  topic: string
  videoLink?: string
  xpValue: number
  replayLink?: string
  zoomLink?: string
  homeworkAssignments: ObjectId[]
  materials: string[]
  duration: number
  difficulty: "easy" | "medium" | "hard"
}

export interface Topic extends BaseDocument {
  topicName: string
  subject: string
  module: string
  questions: ObjectId[]
  description?: string
}

export interface Question extends BaseDocument {
  questionId: string
  questionText: string
  questionImage?: string[]
  correctAnswer: string
  answerOptions?: string[]
  relatedTopicId: ObjectId
  gradeRating: number
  videoSolutionLink?: string
  explanation: string
  hint: string
  difficulty: "easy" | "medium" | "hard"
  subject: string
  xpReward: number
}

// Student activities
export interface QuestionAttempt extends BaseDocument {
  studentId: ObjectId
  questionId: ObjectId
  attemptDate: Date
  correct: boolean
  timeTaken: number
  watchedSolution: boolean
  studentAnswer: string
  sessionId?: ObjectId
}

export interface XPLog extends BaseDocument {
  studentId: ObjectId
  action: "lesson_completed" | "quiz_submitted" | "homework_completed" | "lex_session" | "badge_earned"
  xpAmount: number
  date: Date
  trigger: string
  relatedRecordId?: string
}

export interface HomeworkAssignment extends BaseDocument {
  assignmentId: string
  lessonId: ObjectId
  studentId: ObjectId
  questionSet: ObjectId[]
  score?: number
  completionStatus: "not_started" | "in_progress" | "completed" | "overdue"
  dateSubmitted?: Date
  dueDate: Date
  aiFeedback?: string
  xpEarned: number
  totalQuestions: number
  completedQuestions: number
}

export interface LeaderboardEntry extends BaseDocument {
  studentId: ObjectId
  period: "weekly" | "monthly" | "all_time"
  xpEarned: number
  rank: number
  badgeEarned?: string
  dateRange: string
  weekStart?: Date
  weekEnd?: Date
}

export interface LexAISession extends BaseDocument {
  studentId: ObjectId
  sessionStart: Date
  sessionEnd?: Date
  questionsAnswered: number
  accuracyPercentage: number
  topicsCovered: ObjectId[]
  suggestedFocusTopics: string[]
  levelStart: number
  levelEnd: number
  xpEarned: number
  cwaUpdateTrigger: boolean
  questionAttempts: ObjectId[]
}

export interface Badge extends BaseDocument {
  badgeId: string
  name: string
  description: string
  criteria: string
  icon: string
  xpReward: number
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface StudentBadge extends BaseDocument {
  studentId: ObjectId
  badgeId: ObjectId
  earnedDate: Date
  progress?: number
}

export interface Reflection extends BaseDocument {
  studentId: ObjectId
  date: Date
  mood: "great" | "good" | "okay" | "struggling"
  topicsStudied: string[]
  timeSpent: number
  challenges: string
  achievements: string
  goals: string
}

export interface Report extends BaseDocument {
  reportId: string
  type: "student_progress" | "parent_summary" | "class_overview" | "admin_analytics"
  generatedFor: ObjectId
  generatedBy: ObjectId
  generatedDate: Date
  period: string
  data: any
  format: "pdf" | "html" | "json"
  status: "generating" | "completed" | "failed"
}

// Past Paper interfaces
export interface PastPaper extends BaseDocument {
  paperName: string
  board: string
  year: number
  subject: string
  program: string
  papers: {
    name: string
    questionPaperUrl: string
    markSchemeUrl: string
    questions: QuestionVideo[]
  }[]
  status: 'draft' | 'active'
}

export interface QuestionVideo extends BaseDocument {
  questionId: string
  questionNumber: number
  topic: string
  questionName: string
  questionDescription: string
  duration: string
  teacher: string
  videoEmbedLink: string
}

// Topic Vault interface
export interface TopicVault extends BaseDocument {
  id: string
  videoName: string
  topic: string
  subject: string
  program: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description: string
  zoomLink?: string
  videoEmbedLink: string
  status: 'draft' | 'active'
}
