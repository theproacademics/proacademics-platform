import { NextResponse } from "next/server"
import { topicVaultService } from "@/lib/db/topic-vault"

// DELETE /api/admin/topic-vault/delete-all - Delete all topic vaults
export async function DELETE() {
  try {
    // Get all topic vaults first to count them
    const allTopicVaults = await topicVaultService.getAllTopicVaults({ limit: 10000 })
    const topicVaultIds = allTopicVaults.topicVaults.map(topicVault => topicVault.id)
    
    if (topicVaultIds.length === 0) {
      return NextResponse.json({ message: "No topic vaults to delete", deletedCount: 0 })
    }
    
    // Delete all topic vaults
    const deletedCount = await topicVaultService.deleteManyTopicVaults(topicVaultIds)
    
    return NextResponse.json({ 
      message: `Successfully deleted ${deletedCount} topic vaults`, 
      deletedCount 
    })
  } catch (error) {
    console.error("Error deleting all topic vaults:", error)
    return NextResponse.json({ error: "Failed to delete all topic vaults" }, { status: 500 })
  }
} 