import { NextRequest, NextResponse } from "next/server"
import { subjectService } from "@/lib/db/subjects"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const program = await subjectService.getProgramById(params.id)
    
    if (!program) {
      return NextResponse.json(
        { success: false, error: "Program not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      program
    })
  } catch (error) {
    console.error("Error fetching program:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch program" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, subjectId, color, isActive } = body

    if (!name || !subjectId || !color) {
      return NextResponse.json(
        { success: false, error: "Name, subjectId, and color are required" },
        { status: 400 }
      )
    }

    const updateData = { name, subjectId, color, isActive }
    const updatedProgram = await subjectService.updateProgram(params.id, updateData)
    
    if (!updatedProgram) {
      return NextResponse.json(
        { success: false, error: "Program not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      program: updatedProgram
    })
  } catch (error) {
    console.error("Error updating program:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update program" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await subjectService.deleteProgram(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Program not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Program deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting program:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete program" },
      { status: 500 }
    )
  }
} 