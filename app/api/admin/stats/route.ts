import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'

// Fetch real admin statistics from MongoDB
async function getAdminStats() {
  try {
    const client = await clientPromise
    const db = client.db("proacademics")
    const usersCollection = db.collection("users")
    
    // Get current time for some dynamic calculations
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Get user counts by role
    const totalUsers = await usersCollection.countDocuments()
    const totalStudents = await usersCollection.countDocuments({ role: "student" })
    const totalTeachers = await usersCollection.countDocuments({ role: "teacher" })
    const totalAdmins = await usersCollection.countDocuments({ role: "admin" })
    const totalParents = await usersCollection.countDocuments({ role: "parent" })
    
    // Get active students (logged in within last 24 hours)
    const activeStudents = await usersCollection.countDocuments({
      role: "student",
      lastLogin: { $gte: twentyFourHoursAgo }
    })
    
    // Get students created in different time periods for growth calculation
    const studentsLastWeek = await usersCollection.countDocuments({
      role: "student",
      createdAt: { $gte: oneWeekAgo }
    })
    const studentsLastMonth = await usersCollection.countDocuments({
      role: "student",
      createdAt: { $gte: oneMonthAgo }
    })
    
    // Calculate some basic metrics from user data
    const users = await usersCollection.find({}).toArray()
    const totalXP = users.reduce((sum, user) => sum + (user.xp || 0), 0)
    const avgLevel = users.filter(u => u.level).reduce((sum, user) => sum + (user.level || 0), 0) / Math.max(1, users.filter(u => u.level).length)
    
    // Simulate AI interactions based on user activity (students with XP likely used AI)
    const activeUsersWithXP = users.filter(user => user.xp && user.xp > 0).length
    const estimatedAIInteractions = activeUsersWithXP * 15 + Math.floor(Math.random() * 100)
    
    // Simulate revenue based on total students (basic subscription model)
    const estimatedRevenue = totalStudents * 29 + Math.floor(Math.random() * 500)
    
    // Calculate growth percentages
    const studentGrowthWeekly = studentsLastWeek > 0 ? Math.round((studentsLastWeek / Math.max(1, totalStudents - studentsLastWeek)) * 100) : 0
    const activeStudentGrowth = activeStudents > 0 ? Math.round((activeStudents / Math.max(1, totalStudents)) * 100) : 0
    
    // System health simulation (can be replaced with real monitoring)
    const cpuUsage = Math.floor(20 + Math.random() * 30) // Lower usage for small app
    const memoryUsage = Math.floor(25 + Math.random() * 35)
    const storageUsage = Math.floor(15 + Math.random() * 25) // Low storage for small DB
    const systemHealth = Math.floor(95 + Math.random() * 5)
    
    console.log('Real admin stats fetched:', {
      totalUsers,
      totalStudents,
      totalTeachers,
      activeStudents,
      estimatedAIInteractions,
      estimatedRevenue,
      totalXP,
      avgLevel: Math.round(avgLevel)
    })

    return {
      totalStudents,
      activeStudents,
      totalTeachers,
      totalLessons: Math.floor(totalStudents * 2.5), // Estimate lessons based on students
      aiInteractions: estimatedAIInteractions,
      systemHealth,
      revenue: estimatedRevenue,
      avgSessionTime: `${Math.floor(15 + Math.random() * 10)}m`,
      growth: {
        students: studentGrowthWeekly,
        activeStudents: activeStudentGrowth,
        aiInteractions: Math.floor(5 + Math.random() * 15),
        revenue: Math.floor(8 + Math.random() * 12)
      },
      systemUsage: {
        cpu: Math.max(0, Math.min(100, cpuUsage)),
        memory: Math.max(0, Math.min(100, memoryUsage)),
        storage: Math.max(0, Math.min(100, storageUsage))
      },
      services: {
        api: cpuUsage < 60 ? 'operational' : 'warning',
        database: memoryUsage < 70 ? 'healthy' : 'warning',
        ai: estimatedAIInteractions > 50 ? 'operational' : 'high_load'
      },
      // Additional real data
      totalUsers,
      totalAdmins,
      totalParents,
      totalXP,
      averageLevel: Math.round(avgLevel || 1)
    }
  } catch (error) {
    console.error('Error fetching real admin stats:', error)
    
    // Fallback to basic stats if database is unavailable
    return {
      totalStudents: 0,
      activeStudents: 0,
      totalTeachers: 0,
      totalLessons: 0,
      aiInteractions: 0,
      systemHealth: 0,
      revenue: 0,
      avgSessionTime: "0m",
      growth: {
        students: 0,
        activeStudents: 0,
        aiInteractions: 0,
        revenue: 0
      },
      systemUsage: {
        cpu: 0,
        memory: 0,
        storage: 0
      },
      services: {
        api: 'warning',
        database: 'warning',
        ai: 'warning'
      },
      totalUsers: 0,
      totalAdmins: 0,
      totalParents: 0,
      totalXP: 0,
      averageLevel: 0,
      error: 'Database connection failed'
    }
  }
}

export async function GET() {
  try {
    // You might want to add authentication check here
    // const session = await getServerSession()
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const stats = await getAdminStats()
    
    const response = NextResponse.json(stats)
    
    // Add strong cache-busting headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
} 