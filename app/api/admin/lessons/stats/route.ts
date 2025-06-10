import { NextResponse } from "next/server"
import { lessonService } from "@/lib/db/lessons"

// GET /api/admin/lessons/stats - Get lesson statistics
export async function GET() {
  try {
    const stats = await lessonService.getLessonStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching lesson stats:", error)
    return NextResponse.json({ error: "Failed to fetch lesson stats" }, { status: 500 })
  }
} 