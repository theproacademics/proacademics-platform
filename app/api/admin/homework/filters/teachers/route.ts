import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { HomeworkAssignment } from "@/models/schemas"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    const teachers = await collection.distinct("teacher")
    
    return NextResponse.json({
      success: true,
      data: teachers.filter(Boolean).sort()
    })
  } catch (error) {
    console.error("Error fetching homework teachers:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch teachers" },
      { status: 500 }
    )
  }
}
