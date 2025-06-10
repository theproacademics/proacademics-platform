import { NextResponse } from "next/server"
import { lessonService } from "@/lib/db/lessons"

// DELETE /api/admin/lessons/delete-all - Delete all lessons
export async function DELETE() {
  try {
    // Get all lessons first to count them
    const allLessons = await lessonService.getAllLessons({ limit: 10000 })
    const lessonIds = allLessons.lessons.map(lesson => lesson.id)
    
    if (lessonIds.length === 0) {
      return NextResponse.json({ message: "No lessons to delete", deletedCount: 0 })
    }
    
    // Delete all lessons
    const deletedCount = await lessonService.deleteManyLessons(lessonIds)
    
    return NextResponse.json({ 
      message: `Successfully deleted ${deletedCount} lessons`, 
      deletedCount 
    })
  } catch (error) {
    console.error("Error deleting all lessons:", error)
    return NextResponse.json({ error: "Failed to delete all lessons" }, { status: 500 })
  }
} 