import { NextResponse } from "next/server"
import { subjectService } from "@/lib/db/subjects"

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
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
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject-programs mapping" },
      { status: 500 }
    )
  }
} 