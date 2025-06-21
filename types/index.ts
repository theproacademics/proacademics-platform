// Centralized type definitions
export interface User {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin" | "parent"
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Student extends User {
  role: "student"
  xp: number
  level: number
  predictedGrade: string
  currentWorkingAverage: number
  streak: number
  totalStudyTime: number
  subjects: string[]
}

export interface Teacher extends User {
  role: "teacher"
  subjects: string[]
  students: string[]
}

export interface Admin extends User {
  role: "admin"
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  description: string
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  difficulty: "easy" | "medium" | "hard"
  topic: string
  subject: string
  explanation: string
  hint: string
  xpReward: number
}

export interface Lesson {
  _id?: string
  id: string
  lessonName?: string
  topic: string // Actual topic field
  subject: string
  program?: string
  type?: 'Lesson' | 'Tutorial' | 'Workshop'
  scheduledDate?: string
  time?: string
  duration?: string
  teacher?: string
  status: 'draft' | 'active'
  videoUrl?: string
  zoomLink?: string
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: Date
  status: "pending" | "completed" | "overdue"
  score?: number
  totalQuestions: number
  completedQuestions: number
  xpEarned: number
  xpPossible: number
  difficulty: "easy" | "medium" | "hard"
  estimatedTime: string
}

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "suggestion" | "explanation"
}

export interface SystemStats {
  totalStudents: number
  activeStudents: number
  totalTeachers: number
  totalLessons: number
  aiInteractions: number
  systemHealth: number
  revenue: number
  avgSessionTime: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}
