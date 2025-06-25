import { NextRequest, NextResponse } from "next/server"
import { subjectService } from "@/lib/db/subjects"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subject = await subjectService.getSubjectById(params.id)
    
    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      subject
    })
  } catch (error) {
    console.error("Error fetching subject:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject" },
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
    const { name, color, isActive } = body

    if (!name || !color) {
      return NextResponse.json(
        { success: false, error: "Name and color are required" },
        { status: 400 }
      )
    }

    const updateData = { name, color, isActive }
    const updatedSubject = await subjectService.updateSubject(params.id, updateData)
    
    if (!updatedSubject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      subject: updatedSubject
    })
  } catch (error) {
    console.error("Error updating subject:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update subject" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await subjectService.deleteSubject(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Subject and associated programs deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting subject:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete subject" },
      { status: 500 }
    )
  }
} 