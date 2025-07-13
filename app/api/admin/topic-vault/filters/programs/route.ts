import { NextResponse } from "next/server"
import { topicVaultService } from "@/lib/db/topic-vault"

// GET /api/admin/topic-vault/filters/programs - Get unique programs
export async function GET() {
  try {
    const programs = await topicVaultService.getUniquePrograms()
    return NextResponse.json({ programs })
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 })
  }
} 