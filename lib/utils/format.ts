// Utility functions for formatting
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export const formatXP = (xp: number): string => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`
  }
  return xp.toString()
}

export const formatGrade = (percentage: number): string => {
  if (percentage >= 90) return "A*"
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  return "F"
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 1000) + 1
}

export const calculateXPToNextLevel = (xp: number): number => {
  return 1000 - (xp % 1000)
}

export const calculateProgress = (current: number, total: number): number => {
  return Math.round((current / total) * 100)
}
