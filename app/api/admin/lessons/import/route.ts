import { NextResponse } from "next/server"
import { lessonService } from "@/lib/db/lessons"

// POST /api/admin/lessons/import - Import lessons from CSV
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { lessons } = body

    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json({ error: "No lessons data provided" }, { status: 400 })
    }

    // Process and clean the lesson data
    const processedLessons = lessons.map((lesson) => ({
      id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: lesson.title || '',
      subject: lesson.subject || '',
      subtopic: lesson.subtopic || '',
      instructor: lesson.instructor || '',
      duration: lesson.duration || '',
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      status: lesson.status || 'draft', // ✅ Add status field with fallback to 'draft'
      scheduledDate: lesson.scheduledDate || '',
      week: lesson.week || '',
      grade: lesson.grade || ''
    }))

    // Validate each lesson has required fields
    for (const lesson of processedLessons) {
      if (!lesson.title || !lesson.subject) {
        return NextResponse.json({ 
          error: `Missing required fields: title, subject. Found: title="${lesson.title}", subject="${lesson.subject}"` 
        }, { status: 400 })
      }
    }

    console.log('Processing lessons for import:', processedLessons)
    const importedLessons = await lessonService.createManyLessons(processedLessons)

    return NextResponse.json({ 
      message: `Successfully imported ${importedLessons.length} lessons`,
      lessons: importedLessons,
      count: importedLessons.length
    }, { status: 201 })
  } catch (error) {
    console.error("Error importing lessons:", error)
    return NextResponse.json({ error: "Failed to import lessons" }, { status: 500 })
  }
} 