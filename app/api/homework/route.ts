import { type NextRequest, NextResponse } from "next/server"
import { homeworkService } from "@/lib/db/homework"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const homework = await homeworkService.getStudentHomework(session.user.id)
    return NextResponse.json({ homework })
  } catch (error) {
    console.error("Error fetching homework:", error)
    return NextResponse.json({ error: "Failed to fetch homework" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, questionSet, dueDate, totalQuestions } = body

    const homework = await homeworkService.createHomework({
      assignmentId: `HW${Date.now()}`,
      lessonId,
      studentId: session.user.id,
      questionSet,
      dueDate: new Date(dueDate),
      totalQuestions,
    })

    return NextResponse.json({ homework }, { status: 201 })
  } catch (error) {
    console.error("Error creating homework:", error)
    return NextResponse.json({ error: "Failed to create homework" }, { status: 500 })
  }
}
