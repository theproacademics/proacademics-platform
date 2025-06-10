import { NextResponse } from "next/server"
import { lessonService } from "@/lib/db/lessons"

// GET /api/admin/lessons - Get all lessons with pagination and filtering
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const subject = url.searchParams.get('subject') || 'all'
    const instructor = url.searchParams.get('instructor') || 'all'

    const result = await lessonService.getAllLessons({
      page,
      limit,
      search,
      subject,
      instructor
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}

// POST /api/admin/lessons - Create a new lesson
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, subject, module, instructor, duration, description, videoUrl } = body

    if (!title || !subject || !module) {
      return NextResponse.json({ error: "Missing required fields: title, subject, module" }, { status: 400 })
    }

    const lesson = await lessonService.createLesson({
      id: `lesson-${Date.now()}`,
      title,
      subject,
      module,
      instructor: instructor || "",
      duration: duration || "",
      description: description || "",
      videoUrl: videoUrl || ""
    })

    return NextResponse.json({ lesson }, { status: 201 })
  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
  }
} 