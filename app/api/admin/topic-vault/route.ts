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

// POST /api/admin/topic-vault - Create a new topic container
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      topicName,
      subject,
      program,
      description,
      status,
      subtopics
    } = body

    if (!topicName || !subject || !program) {
      return NextResponse.json({ 
        success: false,
        error: "Missing required fields: topicName, subject, program" 
      }, { status: 400 })
    }

    // Generate unique topic ID
    const topicId = `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const topic = {
      id: topicId,
      topicName,
      subject,
      program,
      description: description || "",
      status: status || 'draft',
      subtopics: subtopics || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const createdTopic = await topicVaultService.createTopic(topic)

    return NextResponse.json({ 
      success: true,
      topic: createdTopic 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating topic:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to create topic" 
    }, { status: 500 })
  }
} 