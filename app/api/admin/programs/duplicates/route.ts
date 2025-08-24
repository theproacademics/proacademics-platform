import { NextRequest, NextResponse } from "next/server"
import { subjectService } from "@/lib/db/subjects"

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const programs = await subjectService.getAllPrograms()
    
    // Find duplicates by grouping programs by name (case-insensitive)
    const programsByName: Record<string, any[]> = {}
    
    programs.forEach(program => {
      const lowerName = program.name.toLowerCase()
      if (!programsByName[lowerName]) {
        programsByName[lowerName] = []
      }
      programsByName[lowerName].push(program)
    })
    
    // Filter to only include groups with more than one program
    const duplicates: Record<string, any[]> = {}
    Object.keys(programsByName).forEach(name => {
      if (programsByName[name].length > 1) {
        duplicates[name] = programsByName[name]
      }
    })
    
    const duplicateCount = Object.keys(duplicates).length
    const totalDuplicatePrograms = Object.values(duplicates).reduce((acc, group) => acc + group.length, 0)
    
    return NextResponse.json({
      success: true,
      duplicates,
      duplicateCount,
      totalDuplicatePrograms,
      message: duplicateCount > 0 
        ? `Found ${duplicateCount} duplicate program names affecting ${totalDuplicatePrograms} programs`
        : "No duplicate program names found"
    })
  } catch (error) {
    console.error("Error checking for duplicate programs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to check for duplicate programs" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const programs = await subjectService.getAllPrograms()
    
    // Find duplicates by grouping programs by name (case-insensitive)
    const programsByName: Record<string, any[]> = {}
    
    programs.forEach(program => {
      const lowerName = program.name.toLowerCase()
      if (!programsByName[lowerName]) {
        programsByName[lowerName] = []
      }
      programsByName[lowerName].push(program)
    })
    
    // For each duplicate group, keep the oldest one and delete the rest
    const toDelete: any[] = []
    const toKeep: any[] = []
    
    Object.values(programsByName).forEach(group => {
      if (group.length > 1) {
        // Sort by creation date (oldest first)
        group.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        
        // Keep the first (oldest) program
        toKeep.push(group[0])
        
        // Mark the rest for deletion
        toDelete.push(...group.slice(1))
      }
    })
    
    // Delete the duplicate programs
    let deletedCount = 0
    for (const program of toDelete) {
      const deleted = await subjectService.deleteProgram(program.id)
      if (deleted) {
        deletedCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      deletedCount,
      keptCount: toKeep.length,
      message: `Removed ${deletedCount} duplicate programs, kept ${toKeep.length} original programs`
    })
  } catch (error) {
    console.error("Error cleaning up duplicate programs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to clean up duplicate programs" },
      { status: 500 }
    )
  }
}

