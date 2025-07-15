import { NextResponse } from "next/server"
import { topicVaultService } from "@/lib/db/topic-vault"

// GET /api/admin/topic-vault/[id] - Get topic by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const topic = await topicVaultService.getTopicById(params.id)
    
    if (!topic) {
      return NextResponse.json({ 
        success: false,
        error: "Topic not found" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      topic 
    })
  } catch (error) {
    console.error("Error fetching topic:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch topic" 
    }, { status: 500 })
  }
}

// PUT /api/admin/topic-vault/[id] - Update topic
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const updateData = {
      topicName,
      subject,
      program,
      description: description || "",
      status: status || 'draft',
      subtopics: subtopics || []
    }

    const updatedTopic = await topicVaultService.updateTopic(params.id, updateData)

    if (!updatedTopic) {
      return NextResponse.json({ 
        success: false,
        error: "Topic not found or failed to update" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      topic: updatedTopic 
    })
  } catch (error) {
    console.error("Error updating topic:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to update topic" 
    }, { status: 500 })
  }
}

// DELETE /api/admin/topic-vault/[id] - Delete topic
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await topicVaultService.deleteTopic(params.id)

    if (!deleted) {
      return NextResponse.json({ 
        success: false,
        error: "Topic not found or failed to delete" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Topic deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting topic:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to delete topic" 
    }, { status: 500 })
  }
} 