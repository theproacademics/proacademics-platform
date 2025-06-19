import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// In-memory storage for demo (in production, use a database)
let viewingStats: {
  [lessonId: string]: {
    totalViews: number
    uniqueViewers: Set<string>
    viewHistory: Array<{
      userId?: string
      sessionId: string
      timestamp: string
      action: string
      userAgent?: string
      ip?: string
    }>
  }
} = {}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { lessonId, action, timestamp } = body

    if (!lessonId || !action || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId, action, timestamp' },
        { status: 400 }
      )
    }

    // Get user info
    const userId = session?.user?.email || 'anonymous'
    const sessionId = req.headers.get('x-session-id') || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const userAgent = req.headers.get('user-agent')
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Initialize lesson stats if not exists
    if (!viewingStats[lessonId]) {
      viewingStats[lessonId] = {
        totalViews: 0,
        uniqueViewers: new Set(),
        viewHistory: []
      }
    }

    const lessonStats = viewingStats[lessonId]

    // Record the view
    lessonStats.totalViews++
    lessonStats.uniqueViewers.add(userId)
    lessonStats.viewHistory.push({
      userId: session?.user?.email,
      sessionId,
      timestamp,
      action,
      userAgent,
      ip
    })

    // Keep only last 1000 entries to prevent memory overflow
    if (lessonStats.viewHistory.length > 1000) {
      lessonStats.viewHistory = lessonStats.viewHistory.slice(-1000)
    }

    console.log(`Lesson view tracked: ${lessonId} - ${action} by ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'View tracked successfully',
      stats: {
        totalViews: lessonStats.totalViews,
        uniqueViewers: lessonStats.uniqueViewers.size,
        timestamp
      }
    })

  } catch (error) {
    console.error('Error tracking lesson view:', error)
    return NextResponse.json(
      { error: 'Failed to track lesson view' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve lesson viewing stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated users to view stats
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('lessonId')

    if (lessonId) {
      // Get stats for specific lesson
      const stats = viewingStats[lessonId]
      if (!stats) {
        return NextResponse.json({
          lessonId,
          totalViews: 0,
          uniqueViewers: 0,
          viewHistory: []
        })
      }

      return NextResponse.json({
        lessonId,
        totalViews: stats.totalViews,
        uniqueViewers: stats.uniqueViewers.size,
        viewHistory: stats.viewHistory.slice(-50) // Return last 50 views
      })
    } else {
      // Get overall stats
      const overallStats = Object.entries(viewingStats).map(([lessonId, stats]) => ({
        lessonId,
        totalViews: stats.totalViews,
        uniqueViewers: stats.uniqueViewers.size,
        lastViewed: stats.viewHistory.length > 0 ? stats.viewHistory[stats.viewHistory.length - 1].timestamp : null
      }))

      return NextResponse.json({
        lessons: overallStats,
        totalLessonsViewed: overallStats.length,
        totalViewsAcrossAllLessons: overallStats.reduce((sum, lesson) => sum + lesson.totalViews, 0)
      })
    }

  } catch (error) {
    console.error('Error fetching lesson stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lesson stats' },
      { status: 500 }
    )
  }
} 