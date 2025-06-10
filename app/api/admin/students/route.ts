import { NextResponse } from "next/server"
import { userService } from "@/lib/db/users"

export async function GET() {
  try {
    const students = await userService.getAllStudents()
    
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

    return NextResponse.json({ students: transformedStudents })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
} 