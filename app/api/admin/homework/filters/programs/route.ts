import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { HomeworkAssignment } from "@/models/schemas"

export async function GET() {
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI not found in environment variables")
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    const programs = await collection.distinct("program")
    
    return NextResponse.json({
      success: true,
      data: programs.filter(Boolean).sort()
    })
  } catch (error) {
    console.error("Error fetching homework programs:", error)
    
    // If it's a database connection error, return empty data instead of 500
    if (error instanceof Error && (
      error.message.includes('MongoClient') || 
      error.message.includes('connection') ||
      error.message.includes('MONGODB_URI')
    )) {
      console.warn("Database connection failed, returning empty programs data")
      return NextResponse.json({
        success: true,
        data: []
      })
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch programs" },
      { status: 500 }
    )
  }
}
