import type { Student, Admin, Question, Lesson, Assignment, SystemStats } from "@/types"

// Mock student data removed - using real data from database

export const MOCK_ADMIN: Admin = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@proacademics.com",
  role: "admin",
  avatar: "/placeholder.svg?height=40&width=40",
  permissions: [
    { id: "1", name: "manage_users", description: "Manage users and roles" },
    { id: "2", name: "manage_content", description: "Manage lessons and content" },
    { id: "3", name: "view_analytics", description: "View system analytics" },
    { id: "4", name: "manage_system", description: "Manage system settings" },
  ],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date(),
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    text: "Solve for x: 2x² - 8x + 6 = 0",
    options: ["x = 1, x = 3", "x = 2, x = 4", "x = 1, x = 6", "x = 3, x = 2"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Quadratic Equations",
    subject: "Mathematics",
    explanation: "Using the quadratic formula or factoring: 2x² - 8x + 6 = 2(x² - 4x + 3) = 2(x-1)(x-3) = 0",
    hint: "Try factoring out the common factor first, then use factoring or the quadratic formula.",
    xpReward: 20,
  },
  {
    id: "2",
    text: "What is the derivative of f(x) = 3x² + 2x - 1?",
    options: ["6x + 2", "3x + 2", "6x² + 2x", "6x - 1"],
    correctAnswer: 0,
    difficulty: "easy",
    topic: "Differentiation",
    subject: "Mathematics",
    explanation: "Using the power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-1) = 0",
    hint: "Remember the power rule: d/dx(xⁿ) = nxⁿ⁻¹",
    xpReward: 10,
  },
]

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    title: "Quadratic Equations Practice Set",
    subject: "Mathematics",
    dueDate: new Date("2024-01-15"),
    status: "completed",
    score: 85,
    totalQuestions: 20,
    completedQuestions: 20,
    xpEarned: 75,
    xpPossible: 100,
    difficulty: "medium",
    estimatedTime: "45 min",
  },
  {
    id: "2",
    title: "Wave Motion Problems",
    subject: "Physics",
    dueDate: new Date("2024-01-18"),
    status: "pending",
    totalQuestions: 15,
    completedQuestions: 8,
    xpEarned: 0,
    xpPossible: 80,
    difficulty: "hard",
    estimatedTime: "60 min",
  },
]

export const MOCK_LESSONS: Lesson[] = [
  {
    id: "1",
    lessonName: "Introduction to Quadratic Equations",
    topic: "Quadratic Equations",
    subject: "Mathematics",
    type: "Lesson",
    duration: "45 min",
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    lessonName: "Wave Properties and Motion",
    topic: "Wave Motion",
    subject: "Physics",
    type: "Lesson",
    duration: "60 min",
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
]

export const MOCK_SYSTEM_STATS: SystemStats = {
  totalStudents: 1247,
  activeStudents: 892,
  totalTeachers: 45,
  totalLessons: 324,
  aiInteractions: 15678,
  systemHealth: 98.5,
  revenue: 45670,
  avgSessionTime: "24m",
}
