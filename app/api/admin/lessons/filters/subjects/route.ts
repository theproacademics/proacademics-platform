import { NextResponse } from "next/server"
import { lessonService } from "@/lib/db/lessons"

// GET /api/admin/lessons/filters/subjects - Get unique subjects
export async function GET() {
  try {
    const subjects = await lessonService.getUniqueSubjects()
    return NextResponse.json({ subjects })
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }
} 