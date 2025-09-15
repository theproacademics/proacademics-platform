import { NextRequest, NextResponse } from 'next/server'

interface SubmitAnswerRequest {
  questionIndex: number
  answer: string
  timeSpent: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const homeworkId = params.id
    const body: SubmitAnswerRequest = await request.json()
    
    console.log('=== Homework Submit API ===')
    console.log('Homework ID:', homeworkId)
    console.log('Question Index:', body.questionIndex)
    console.log('Answer:', body.answer)
    console.log('Time Spent:', body.timeSpent)

    // Validate required fields
    if (typeof body.questionIndex !== 'number' || 
        typeof body.answer !== 'string' || 
        typeof body.timeSpent !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data'
      }, { status: 400 })
    }

    // For now, we'll just simulate a successful submission
    // In a real app, you would save this to a database
    const submissionData = {
      homeworkId,
      questionIndex: body.questionIndex,
      answer: body.answer,
      timeSpent: body.timeSpent,
      submittedAt: new Date().toISOString()
    }

    console.log('=== Submission Data ===')
    console.log('Submission:', submissionData)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        submissionId: `sub_${Date.now()}`,
        questionIndex: body.questionIndex,
        submittedAt: submissionData.submittedAt
      }
    })

  } catch (error) {
    console.error('Error submitting homework answer:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to submit answer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}