import { NextResponse } from "next/server"
import { topicVaultService } from "@/lib/db/topic-vault"

// POST /api/admin/topic-vault/import - Import topic vaults from CSV
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { topicVaults } = body

    if (!topicVaults || !Array.isArray(topicVaults) || topicVaults.length === 0) {
      return NextResponse.json({ error: "No topic vault data provided" }, { status: 400 })
    }

    // Process and clean the topic vault data
    const processedTopicVaults = topicVaults.map((topicVault) => ({
      id: `topic-vault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      videoName: topicVault.videoName || topicVault.video_name || '',
      topic: topicVault.topic || '',
      subject: topicVault.subject || '',
      program: topicVault.program || '',
      type: topicVault.type || 'Lesson',
      duration: topicVault.duration || '',
      teacher: topicVault.teacher || '',
      description: topicVault.description || '',
      zoomLink: topicVault.zoomLink || topicVault.zoom_link || '',
      videoEmbedLink: topicVault.videoEmbedLink || topicVault.video_embed_link || topicVault.videoUrl || topicVault.video_url || '',
      status: topicVault.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    // Validate each topic vault has required fields
    for (const topicVault of processedTopicVaults) {
      if (!topicVault.videoName || !topicVault.topic || !topicVault.subject || !topicVault.program || !topicVault.teacher || !topicVault.videoEmbedLink) {
        return NextResponse.json({ 
          error: `Missing required fields. Required: videoName, topic, subject, program, teacher, videoEmbedLink. Found: videoName="${topicVault.videoName}", topic="${topicVault.topic}", subject="${topicVault.subject}", program="${topicVault.program}", teacher="${topicVault.teacher}", videoEmbedLink="${topicVault.videoEmbedLink}"` 
        }, { status: 400 })
      }
    }

    console.log('Processing topic vaults for import:', processedTopicVaults)
    const importedTopicVaults = await topicVaultService.createManyTopicVaults(processedTopicVaults)

    return NextResponse.json({ 
      message: `Successfully imported ${importedTopicVaults.length} topic vaults`,
      topicVaults: importedTopicVaults,
      count: importedTopicVaults.length
    }, { status: 201 })
  } catch (error) {
    console.error("Error importing topic vaults:", error)
    return NextResponse.json({ error: "Failed to import topic vaults" }, { status: 500 })
  }
} 