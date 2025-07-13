import { NextResponse } from "next/server"
import { topicVaultService } from "@/lib/db/topic-vault"

// GET /api/admin/topic-vault/filters/teachers - Get unique teachers
export async function GET() {
  try {
    const teachers = await topicVaultService.getUniqueTeachers()
    return NextResponse.json({ teachers })
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 })
  }
} 