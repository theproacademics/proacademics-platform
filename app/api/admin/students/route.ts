import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { userService } from "@/lib/db/users"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    console.log("🔍 Admin Students API called")
    console.log("Session:", session ? { email: session.user?.email, role: session.user?.role } : "No session")
    
    if (!session || session.user?.role !== 'admin') {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log("Environment:", process.env.NODE_ENV)
    console.log("MongoDB URI exists:", !!process.env.MONGODB_URI)
    
    const students = await userService.getAllStudents()
    console.log("✅ Students fetched successfully:", students.length)
    
    // Transform the data to match the frontend interface
    const transformedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      nickname: student.nickname || "",
      email: student.email,
      phone: student.phone || "",
      dateOfBirth: student.dateOfBirth || "",
      schoolName: student.schoolName || "",
      uniqueToken: student.uniqueToken || "",
      avatar: student.avatar || "/placeholder.svg?height=40&width=40",
      level: student.level || 1,
      xp: student.xp || 0,
      joinDate: student.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      lastActive: student.lastLogin?.toISOString().split('T')[0] || student.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      status: student.lastLogin && new Date().getTime() - new Date(student.lastLogin).getTime() < 7 * 24 * 60 * 60 * 1000 ? "active" : "inactive",
      grade: student.predictedGrade || "B",
      subjects: student.subjects || ["Mathematics"],
      totalLessons: Math.floor(Math.random() * 50) + 10, // Random for now, you can implement lesson counting
      completionRate: student.currentWorkingAverage || Math.floor(Math.random() * 30) + 70,
      role: student.role,
      timezone: student.timezone || "",
      userAgent: student.userAgent || "",
      deviceFingerprint: student.deviceFingerprint || ""
    }))

    console.log("✅ Students transformed successfully:", transformedStudents.length)
    return NextResponse.json({ 
      students: transformedStudents,
      meta: {
        count: transformedStudents.length,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error("❌ Error fetching students:", error)
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    return NextResponse.json({ 
      error: "Failed to fetch students",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 