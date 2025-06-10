import { NextResponse } from "next/server"
import { lessonService } from "@/lib/db/lessons"

// GET /api/admin/lessons/filters/instructors - Get unique instructors
export async function GET() {
  try {
    const instructors = await lessonService.getUniqueInstructors()
    return NextResponse.json({ instructors })
  } catch (error) {
    console.error("Error fetching instructors:", error)
    return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 })
  }
} 