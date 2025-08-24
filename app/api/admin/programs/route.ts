import { NextRequest, NextResponse } from "next/server"
import { subjectService } from "@/lib/db/subjects"
import { v4 as uuidv4 } from "uuid"

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    
    let programs
    if (subjectId) {
      programs = await subjectService.getProgramsBySubjectId(subjectId)
    } else {
      programs = await subjectService.getAllPrograms()
    }
    
    const response = NextResponse.json({
      success: true,
      programs
    })

    // Add cache-busting headers for production
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')

    return response
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch programs" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subjectId, color, isActive = true } = body

    if (!name || !subjectId || !color) {
      return NextResponse.json(
        { success: false, error: "Name, subjectId, and color are required" },
        { status: 400 }
      )
    }

    // Check if program name already exists
    const nameExists = await subjectService.checkProgramNameExists(name.trim())
    if (nameExists) {
      console.log(`Duplicate program name detected: "${name.trim()}"`)
      return NextResponse.json(
        { success: false, error: "A program with this name already exists. Please choose a different name." },
        { status: 409 }
      )
    }

    const programData = {
      id: uuidv4(),
      name: name.trim(),
      subjectId,
      color,
      isActive
    }

    const newProgram = await subjectService.createProgram(programData)
    
    return NextResponse.json({
      success: true,
      program: newProgram
    })
  } catch (error) {
    console.error("Error creating program:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create program" },
      { status: 500 }
    )
  }
} 