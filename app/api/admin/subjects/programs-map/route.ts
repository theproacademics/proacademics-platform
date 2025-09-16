import { NextResponse } from "next/server"
import { subjectService } from "@/lib/db/subjects"

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI not found in environment variables")
      return NextResponse.json({
        success: true,
        subjectPrograms: {},
        subjectColors: {}
      })
    }

    const subjectProgramsMap = await subjectService.getSubjectProgramsMap()
    const subjectColorsMap = await subjectService.getSubjectColorsMap()
    
    const response = NextResponse.json({
      success: true,
      subjectPrograms: subjectProgramsMap,
      subjectColors: subjectColorsMap
    })

    // Add cache-busting headers for production
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')

    return response
  } catch (error) {
    console.error("Error fetching subject-programs mapping:", error)
    
    // If it's a database connection error, return empty data instead of 500
    if (error instanceof Error && (
      error.message.includes('MongoClient') || 
      error.message.includes('connection') ||
      error.message.includes('MONGODB_URI')
    )) {
      console.warn("Database connection failed, returning empty subject-programs mapping")
      return NextResponse.json({
        success: true,
        subjectPrograms: {},
        subjectColors: {}
      })
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject-programs mapping" },
      { status: 500 }
    )
  }
} 