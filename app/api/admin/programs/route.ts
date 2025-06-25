import { NextRequest, NextResponse } from "next/server"
import { subjectService } from "@/lib/db/subjects"
import { v4 as uuidv4 } from "uuid"

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
    
    return NextResponse.json({
      success: true,
      programs
    })
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

    const programData = {
      id: uuidv4(),
      name,
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