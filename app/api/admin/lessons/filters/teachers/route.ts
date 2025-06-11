import { NextResponse } from "next/server"
import { lessonService } from "@/lib/db/lessons"

// GET /api/admin/lessons/filters/teachers - Get unique teachers
export async function GET() {
  try {
    const teachers = await lessonService.getUniqueTeachers()
    return NextResponse.json({ teachers })
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 })
  }
} 