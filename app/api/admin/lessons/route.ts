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
    const teacher = url.searchParams.get('teacher') || 'all'
    const status = url.searchParams.get('status') || 'all'
    const scheduledDateFrom = url.searchParams.get('scheduledDateFrom') || ''
    const scheduledDateTo = url.searchParams.get('scheduledDateTo') || ''
    const createdDateFrom = url.searchParams.get('createdDateFrom') || ''
    const createdDateTo = url.searchParams.get('createdDateTo') || ''

    const result = await lessonService.getAllLessons({
      page,
      limit,
      search,
      subject,
      teacher,
      status,
      scheduledDateFrom,
      scheduledDateTo,
      createdDateFrom,
      createdDateTo
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
    const { title, subject, subtopic, teacher, program, duration, videoUrl, zoomLink, week, scheduledDate, grade, status } = body

    if (!title || !subject) {
      return NextResponse.json({ error: "Missing required fields: title, subject" }, { status: 400 })
    }

    // Generate unique lesson ID
    const lessonId = `lesson-${Date.now()}`

    const lesson: Lesson = {
      id: lessonId,
      title,
      subject,
      subtopic: subtopic || "",
      teacher: teacher || "",
      program: program || "",
      duration: duration || "",
      videoUrl: videoUrl || "",
      zoomLink: zoomLink || "",
      status: status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      // Optional fields from CSV import
      scheduledDate: scheduledDate || "",
      week: week || "",
      grade: grade || ""
    }

    const createdLesson = await lessonService.createLesson(lesson)

    return NextResponse.json({ lesson: createdLesson }, { status: 201 })
  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
  }
} 