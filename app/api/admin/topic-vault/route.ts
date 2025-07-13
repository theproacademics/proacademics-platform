import { NextResponse } from "next/server"
import { topicVaultService, type TopicVault } from "@/lib/db/topic-vault"

// GET /api/admin/topic-vault - Get all topic vaults with pagination and filtering
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const subject = url.searchParams.get('subject') || 'all'
    const teacher = url.searchParams.get('teacher') || 'all'
    const status = url.searchParams.get('status') || 'all'
    const type = url.searchParams.get('type') || 'all'
    const program = url.searchParams.get('program') || 'all'

    const result = await topicVaultService.getAllTopicVaults({
      page,
      limit,
      search,
      subject,
      teacher,
      status,
      type,
      program
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching topic vaults:", error)
    return NextResponse.json({ error: "Failed to fetch topic vaults" }, { status: 500 })
  }
}

// POST /api/admin/topic-vault - Create a new topic vault
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      videoName,
      topic,
      subject,
      program,
      type,
      duration,
      teacher,
      description,
      zoomLink,
      videoEmbedLink,
      status 
    } = body

    if (!videoName || !topic || !subject || !program || !teacher || !videoEmbedLink) {
      return NextResponse.json({ error: "Missing required fields: videoName, topic, subject, program, teacher, videoEmbedLink" }, { status: 400 })
    }

    // Generate unique topic vault ID
    const topicVaultId = `topic-vault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const topicVault: TopicVault = {
      id: topicVaultId,
      videoName,
      topic,
      subject,
      program,
      type: type || 'Lesson',
      duration: duration || "",
      teacher,
      description: description || "",
      zoomLink: zoomLink || "",
      videoEmbedLink,
      status: status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const createdTopicVault = await topicVaultService.createTopicVault(topicVault)

    return NextResponse.json({ topicVault: createdTopicVault }, { status: 201 })
  } catch (error) {
    console.error("Error creating topic vault:", error)
    return NextResponse.json({ error: "Failed to create topic vault" }, { status: 500 })
  }
} 