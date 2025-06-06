// Application constants
export const APP_CONFIG = {
  name: "ProAcademics",
  description: "AI-Powered Learning Platform",
  version: "1.0.0",
  author: "ProAcademics Team",
} as const

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/",
  LEX_AI: "/lex",
  LESSONS: "/lessons",
  HOMEWORK: "/homework",
  PROGRESS: "/progress",
  LEADERBOARD: "/leaderboard",
  CHAT: "/chat",
  TIMETABLE: "/timetable",
  ADMIN: "/admin",
  ADMIN_STUDENTS: "/admin/students",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_CONTENT: "/admin/content",
  ADMIN_SYSTEM: "/admin/system",
  AUTH_SIGNIN: "/auth/signin",
  AUTH_SIGNUP: "/auth/signup",
  UNAUTHORIZED: "/unauthorized",
} as const

export const XP_REWARDS = {
  EASY_QUESTION: 10,
  MEDIUM_QUESTION: 20,
  HARD_QUESTION: 30,
  LESSON_COMPLETION: 50,
  ASSIGNMENT_COMPLETION: 100,
  DAILY_LOGIN: 5,
} as const

export const DIFFICULTY_COLORS = {
  easy: "text-green-400 border-green-500",
  medium: "text-yellow-400 border-yellow-500",
  hard: "text-red-400 border-red-500",
} as const

export const STATUS_COLORS = {
  completed: "text-green-400 bg-green-500/20",
  pending: "text-blue-400 bg-blue-500/20",
  overdue: "text-red-400 bg-red-500/20",
} as const
