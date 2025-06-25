import { NextResponse } from "next/server"
import { subjectService } from "@/lib/db/subjects"

export async function GET() {
  try {
    const subjectProgramsMap = await subjectService.getSubjectProgramsMap()
    const subjectColorsMap = await subjectService.getSubjectColorsMap()
    
    return NextResponse.json({
      success: true,
      subjectPrograms: subjectProgramsMap,
      subjectColors: subjectColorsMap
    })
  } catch (error) {
    console.error("Error fetching subject-programs mapping:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject-programs mapping" },
      { status: 500 }
    )
  }
} 