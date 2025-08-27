import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { HomeworkAssignment } from "@/models/schemas"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    const subjects = await collection.distinct("subject")
    
    return NextResponse.json({
      success: true,
      data: subjects.filter(Boolean).sort()
    })
  } catch (error) {
    console.error("Error fetching homework subjects:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}
