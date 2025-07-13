import { NextResponse } from "next/server"
import { topicVaultService } from "@/lib/db/topic-vault"

// GET /api/admin/topic-vault/[id] - Get a single topic vault
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const topicVault = await topicVaultService.getTopicVaultById(params.id)
    
    if (!topicVault) {
      return NextResponse.json({ error: "Topic vault not found" }, { status: 404 })
    }

    return NextResponse.json({ topicVault })
  } catch (error) {
    console.error("Error fetching topic vault:", error)
    return NextResponse.json({ error: "Failed to fetch topic vault" }, { status: 500 })
  }
}

// PUT /api/admin/topic-vault/[id] - Update a topic vault
export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    const updateData = {
      videoName,
      topic,
      subject,
      program,
      type: type || 'Lesson',
      duration: duration || '',
      teacher,
      description: description || '',
      zoomLink: zoomLink || '',
      videoEmbedLink,
      status: status || 'draft',
      updatedAt: new Date()
    }

    const updatedTopicVault = await topicVaultService.updateTopicVault(params.id, updateData)

    if (!updatedTopicVault) {
      return NextResponse.json({ error: "Topic vault not found" }, { status: 404 })
    }

    return NextResponse.json({ topicVault: updatedTopicVault })
  } catch (error) {
    console.error("Error updating topic vault:", error)
    return NextResponse.json({ error: "Failed to update topic vault" }, { status: 500 })
  }
}

// DELETE /api/admin/topic-vault/[id] - Delete a topic vault
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await topicVaultService.deleteTopicVault(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: "Topic vault not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Topic vault deleted successfully" })
  } catch (error) {
    console.error("Error deleting topic vault:", error)
    return NextResponse.json({ error: "Failed to delete topic vault" }, { status: 500 })
  }
} 