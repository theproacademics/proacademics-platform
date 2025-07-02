import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET: Fetch all questions for a specific past paper
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const pastPaperId = params.id
    
    // Find the past paper with its questions
    const pastPaper = await db.collection('pastpapers').findOne({
      _id: new ObjectId(pastPaperId)
    })
    
    if (!pastPaper) {
      return NextResponse.json(
        { success: false, error: 'Past paper not found' },
        { status: 404 }
      )
    }
    
    // Return questions array (empty if no questions exist)
    const questions = pastPaper.questions || []
    
    return NextResponse.json({
      success: true,
      questions
    })
    
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST: Add a new question to a past paper
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const pastPaperId = params.id
    const body = await request.json()
    
    // Validate required fields
    const { questionNumber, topic, questionName, questionDescription, duration, teacher, videoEmbedLink } = body
    
    if (!questionNumber || !topic || !questionName || !questionDescription || !duration || !teacher || !videoEmbedLink) {
      return NextResponse.json(
        { success: false, error: 'All question fields are required' },
        { status: 400 }
      )
    }
    
    // Check if past paper exists
    const pastPaper = await db.collection('pastpapers').findOne({
      _id: new ObjectId(pastPaperId)
    })
    
    if (!pastPaper) {
      return NextResponse.json(
        { success: false, error: 'Past paper not found' },
        { status: 404 }
      )
    }
    
    // Create new question object
    const newQuestion = {
      id: new ObjectId().toString(),
      questionNumber: parseInt(questionNumber),
      topic,
      questionName,
      questionDescription,
      duration,
      teacher,
      videoEmbedLink,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Add question to the past paper
    const result = await db.collection('pastpapers').updateOne(
      { _id: new ObjectId(pastPaperId) },
      { 
        $push: { questions: newQuestion },
        $set: { updatedAt: new Date().toISOString() }
      }
    )
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to add question' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      question: newQuestion
    })
    
  } catch (error) {
    console.error('Error adding question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add question' },
      { status: 500 }
    )
  }
}

// PUT: Update a specific question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const pastPaperId = params.id
    const body = await request.json()
    
    const { questionId, questionNumber, topic, questionName, questionDescription, duration, teacher, videoEmbedLink } = body
    
    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      )
    }
    
    // Update the specific question in the array
    const result = await db.collection('pastpapers').updateOne(
      { 
        _id: new ObjectId(pastPaperId),
        'questions.id': questionId
      },
      {
        $set: {
          'questions.$.questionNumber': parseInt(questionNumber),
          'questions.$.topic': topic,
          'questions.$.questionName': questionName,
          'questions.$.questionDescription': questionDescription,
          'questions.$.duration': duration,
          'questions.$.teacher': teacher,
          'questions.$.videoEmbedLink': videoEmbedLink,
          'questions.$.updatedAt': new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    )
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Question not found or failed to update' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Question updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a specific question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const pastPaperId = params.id
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    
    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      )
    }
    
    // Remove the question from the array
    const result = await db.collection('pastpapers').updateOne(
      { _id: new ObjectId(pastPaperId) },
      {
        $pull: { questions: { id: questionId } },
        $set: { updatedAt: new Date().toISOString() }
      }
    )
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Question not found or failed to delete' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete question' },
      { status: 500 }
    )
  }
} 