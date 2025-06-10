import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Fetch real top performers from MongoDB
async function getTopPerformers() {
  try {
    const client = await clientPromise
    const db = client.db("proacademics")
    const usersCollection = db.collection("users")
    
    // Get all students, sorted by XP, then level, then study streak
    const students = await usersCollection
      .find({ role: "student" })
      .sort({ xp: -1, level: -1, studyStreak: -1 })
      .toArray()
    
    console.log('Found', students.length, 'students in database')
    
    // If no students found, return empty array
    if (students.length === 0) {
      return [{
        name: "No students found",
        xp: 0,
        level: 1,
        streak: 0,
        weeklyGrowth: 0,
        completedLessons: 0,
        currentWorkingAverage: 0,
        predictedGrade: "N/A"
      }]
    }
    
    const topPerformers = students.slice(0, 5).map((student, index) => {
      // Calculate weekly growth simulation based on their current stats
      const baseGrowth = student.xp > 1000 ? 150 : 50
      const weeklyGrowth = Math.floor(baseGrowth + Math.random() * 100)
      
      // Estimate completed lessons based on XP (assuming 50 XP per lesson)
      const estimatedLessons = Math.floor((student.xp || 0) / 50) + ((student.level || 1) - 1) * 3
      
      return {
        name: student.name,
        xp: student.xp || 0,
        level: student.level || 1,
        streak: student.studyStreak || 0,
        weeklyGrowth,
        completedLessons: Math.max(0, estimatedLessons),
        currentWorkingAverage: student.currentWorkingAverage || 0,
        predictedGrade: student.predictedGrade || "N/A"
      }
    })
    
    console.log('Real top performers data:', topPerformers.map(p => ({
      name: p.name,
      xp: p.xp,
      level: p.level,
      streak: p.streak
    })))
    
    return topPerformers
    
  } catch (error) {
    console.error('Error fetching real top performers:', error)
    
    // Fallback data
    return [{
      name: "Database Error",
      xp: 0,
      level: 0,
      streak: 0,
      weeklyGrowth: 0,
      completedLessons: 0,
      currentWorkingAverage: 0,
      predictedGrade: "N/A",
      error: "Unable to connect to database"
    }]
  }
}

export async function GET() {
  try {
    const topPerformers = await getTopPerformers()
    const response = NextResponse.json(topPerformers)
    
    // Add strong cache-busting headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
  } catch (error) {
    console.error('Failed to fetch top performers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top performers' },
      { status: 500 }
    )
  }
} 