import { type NextRequest, NextResponse } from "next/server"
import { studentService } from "@/lib/db/students"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const students = await studentService.getAllStudents()
    return NextResponse.json({ students })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role = "student" } = body

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const student = await studentService.createStudent({
      studentId: `STU${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role,
      lastLogin: new Date(),
    })

    // Remove password from response
    const { password: _, ...studentResponse } = student

    return NextResponse.json({ student: studentResponse }, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
