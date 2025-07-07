import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET: Fetch all questions for a specific paper within a past paper
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const pastPaperId = params.id
    const { searchParams } = new URL(request.url)
    const paperIndex = searchParams.get('paper') ? parseInt(searchParams.get('paper')!) : 0
    
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
    
    // Check if the paper exists at the specified index
    if (!pastPaper.papers || !pastPaper.papers[paperIndex]) {
      return NextResponse.json(
        { success: false, error: 'Paper not found at specified index' },
        { status: 404 }
      )
    }
    
    // Get questions for the specific paper
    const paperQuestions = pastPaper.papers[paperIndex].questions || []
    
    return NextResponse.json({
      success: true,
      questions: paperQuestions
    })
    
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST: Add a new question to a specific paper within a past paper
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const pastPaperId = params.id
    const body = await request.json()
    
    // Validate required fields
    const { questionNumber, topic, questionName, questionDescription, duration, teacher, videoEmbedLink, paperIndex } = body
    
    if (!questionNumber || !topic || !questionName || !questionDescription || !duration || !teacher || !videoEmbedLink || paperIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'All question fields and paper index are required' },
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
    
    // Check if the paper exists at the specified index
    if (!pastPaper.papers || !pastPaper.papers[paperIndex]) {
      return NextResponse.json(
        { success: false, error: 'Paper not found at specified index' },
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
    
    // Add question to the specific paper
    const pushUpdate = { $push: {} as any, $set: { updatedAt: new Date().toISOString() } }
    pushUpdate.$push[`papers.${paperIndex}.questions`] = newQuestion
    
    const result = await db.collection('pastpapers').updateOne(
      { _id: new ObjectId(pastPaperId) },
      pushUpdate
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

// PUT: Update a specific question within a paper
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const pastPaperId = params.id
    const body = await request.json()
    
    const { questionId, questionNumber, topic, questionName, questionDescription, duration, teacher, videoEmbedLink, paperIndex } = body
    
    if (!questionId || paperIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'Question ID and paper index are required' },
        { status: 400 }
      )
    }
    
    // Update the specific question in the specific paper
    const result = await db.collection('pastpapers').updateOne(
      { 
        _id: new ObjectId(pastPaperId),
        [`papers.${paperIndex}.questions.id`]: questionId
      },
      {
        $set: {
          [`papers.${paperIndex}.questions.$.questionNumber`]: parseInt(questionNumber),
          [`papers.${paperIndex}.questions.$.topic`]: topic,
          [`papers.${paperIndex}.questions.$.questionName`]: questionName,
          [`papers.${paperIndex}.questions.$.questionDescription`]: questionDescription,
          [`papers.${paperIndex}.questions.$.duration`]: duration,
          [`papers.${paperIndex}.questions.$.teacher`]: teacher,
          [`papers.${paperIndex}.questions.$.videoEmbedLink`]: videoEmbedLink,
          [`papers.${paperIndex}.questions.$.updatedAt`]: new Date().toISOString(),
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

// DELETE: Remove a specific question from a paper
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const pastPaperId = params.id
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    const paperIndex = searchParams.get('paper') ? parseInt(searchParams.get('paper')!) : 0
    
    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      )
    }
    
    // Remove the question from the specific paper
    const pullUpdate = { $pull: {} as any, $set: { updatedAt: new Date().toISOString() } }
    pullUpdate.$pull[`papers.${paperIndex}.questions`] = { id: questionId }
    
    const result = await db.collection('pastpapers').updateOne(
      { _id: new ObjectId(pastPaperId) },
      pullUpdate
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