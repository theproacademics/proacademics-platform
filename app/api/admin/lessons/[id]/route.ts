import { NextResponse } from "next/server"
import { lessonService } from "@/lib/db/lessons"

// GET /api/admin/lessons/[id] - Get a single lesson
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const lesson = await lessonService.getLessonById(params.id)
    
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 })
  }
}

// PUT /api/admin/lessons/[id] - Update a lesson
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { 
      lessonName, 
      title, // Frontend sends "title" but we map it to "topic" in database
      subject, 
      type, 
      teacher, 
      program, 
      duration, 
      videoUrl, 
      zoomLink, 
      scheduledDate, 
      time, 
      status 
    } = body

    const updateData = {
      lessonName: lessonName || '',
      topic: title, // Map "title" from frontend to "topic" in database
      subject,
      type: type || 'Lesson',
      teacher: teacher || '',
      program: program || '',
      duration: duration || '',
      videoUrl: videoUrl || '',
      zoomLink: zoomLink || '',
      scheduledDate: scheduledDate || '',
      time: time || '',
      status: status || 'draft',
      updatedAt: new Date()
    }

    const updatedLesson = await lessonService.updateLesson(params.id, updateData)

    if (!updatedLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json({ lesson: updatedLesson })
  } catch (error) {
    console.error("Error updating lesson:", error)
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
  }
}

// DELETE /api/admin/lessons/[id] - Delete a lesson
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await lessonService.deleteLesson(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Lesson deleted successfully" })
  } catch (error) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
  }
} 