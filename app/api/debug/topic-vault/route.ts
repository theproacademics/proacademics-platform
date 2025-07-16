import { NextRequest, NextResponse } from 'next/server'
import { getAllTopics } from '@/lib/db/topic-vault'

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Fetching all topics...')
    
    // Get all topics regardless of authentication for debugging
    const allTopics = await getAllTopics()
    console.log('Debug: Found topics:', allTopics.length)
    
    // Create a summary of what we have
    const summary = {
      totalTopics: allTopics.length,
      topics: allTopics.map(topic => ({
        id: topic.id,
        topicName: topic.topicName,
        subject: topic.subject,
        program: topic.program,
        status: topic.status,
        subtopicsCount: topic.subtopics?.length || 0,
        subtopics: topic.subtopics?.map(subtopic => ({
          id: subtopic.id,
          videoName: subtopic.videoName,
          status: subtopic.status,
          teacher: subtopic.teacher,
          videoEmbedLink: subtopic.videoEmbedLink ? 'YES' : 'NO'
        })) || []
      }))
    }
    
    console.log('Debug: Summary:', summary)
    
    return NextResponse.json({
      success: true,
      message: 'Debug data retrieved successfully',
      data: summary
    })
  } catch (error) {
    console.error('Debug API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 