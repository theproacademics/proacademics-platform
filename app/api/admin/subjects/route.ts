import { NextRequest, NextResponse } from "next/server"
import { subjectService } from "@/lib/db/subjects"
import { v4 as uuidv4 } from "uuid"

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const subjectsWithPrograms = await subjectService.getAllSubjectsWithPrograms()
    
    const response = NextResponse.json({
      success: true,
      subjects: subjectsWithPrograms
    })

    // Add cache-busting headers for production
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')

    return response
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, color, isActive = true } = body

    if (!name || !color) {
      return NextResponse.json(
        { success: false, error: "Name and color are required" },
        { status: 400 }
      )
    }

    const subjectData = {
      id: uuidv4(),
      name,
      color,
      isActive
    }

    const newSubject = await subjectService.createSubject(subjectData)
    
    return NextResponse.json({
      success: true,
      subject: newSubject
    })
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create subject" },
      { status: 500 }
    )
  }
} 