import { NextResponse } from "next/server"
import { lessonService, type Lesson } from "@/lib/db/lessons"

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
    const { 
      lessonName, 
      title, // Frontend sends "title" but we map it to "topic" in database
      description, // Add description field
      subject, 
      type, 
      teacher, 
      program, 
      duration, 
      videoUrl, 
      zoomLink, 
      scheduledDate, // Now expects ISO string from timezone conversion
      time,          // Keep for backward compatibility
      status 
    } = body

    if (!title || !subject) {
      return NextResponse.json({ error: "Missing required fields: title, subject" }, { status: 400 })
    }

    // Generate unique lesson ID
    const lessonId = `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Parse the scheduled date if provided
    let parsedScheduledDate = ""
    if (scheduledDate) {
      try {
        const date = new Date(scheduledDate)
        if (!isNaN(date.getTime())) {
          parsedScheduledDate = date.toISOString()
        } else {
          console.warn('Invalid scheduled date format:', scheduledDate)
        }
      } catch (e) {
        console.warn('Could not parse scheduledDate:', scheduledDate)
      }
    }

    const lesson: Lesson = {
      id: lessonId,
      lessonName: lessonName, // Use lessonName from form
      topic: title, // Map "title" from frontend to "topic" in database
      description: description || "", // Include description field
      subject,
      type: type || 'Lesson',
      teacher: teacher || "",
      program: program || "",
      duration: duration || "",
      videoUrl: videoUrl || "",
      zoomLink: zoomLink || "",
      status: status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledDate: parsedScheduledDate,
      time: time || "" // Keep for backward compatibility
    }

    const createdLesson = await lessonService.createLesson(lesson)

    return NextResponse.json({ lesson: createdLesson }, { status: 201 })
  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
  }
} 