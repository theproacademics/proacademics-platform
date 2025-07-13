import { NextResponse } from "next/server"
import { topicVaultService } from "@/lib/db/topic-vault"

// GET /api/admin/topic-vault/stats - Get topic vault statistics
export async function GET() {
  try {
    const stats = await topicVaultService.getTopicVaultStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching topic vault stats:", error)
    return NextResponse.json({ error: "Failed to fetch topic vault stats" }, { status: 500 })
  }
} 