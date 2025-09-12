import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { HomeworkAssignment } from '@/models/schemas'
import { ObjectId } from 'mongodb'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add proper authentication
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    // }

    const { questionIndex, answer, timeSpent } = await request.json()
    const homeworkId = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(homeworkId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid homework ID' },
        { status: 400 }
      )
    }

    if (!questionIndex && questionIndex !== 0) {
      return NextResponse.json(
        { success: false, message: 'Question index is required' },
        { status: 400 }
      )
    }

    if (!answer?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Answer is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const homeworkCollection = db.collection<HomeworkAssignment>('homeworkassignments')

    // Find the homework assignment
    const homework = await homeworkCollection.findOne({ _id: new ObjectId(homeworkId) })
    
    if (!homework) {
      return NextResponse.json(
        { success: false, message: 'Homework assignment not found' },
        { status: 404 }
      )
    }

    // Check if question index is valid
    if (questionIndex < 0 || questionIndex >= homework.questionSet.length) {
      return NextResponse.json(
        { success: false, message: 'Invalid question index' },
        { status: 400 }
      )
    }

    // Update homework progress
    const newCompletedQuestions = Math.max(homework.completedQuestions || 0, questionIndex + 1)
    const isCompleted = newCompletedQuestions >= homework.totalQuestions
    
    const updateData: any = {
      completedQuestions: newCompletedQuestions,
      completionStatus: isCompleted ? 'completed' : 'in_progress',
      updatedAt: new Date()
    }

    // Add completion data if homework is finished
    if (isCompleted) {
      updateData.dateSubmitted = new Date()
      updateData.xpEarned = homework.xpAwarded
      updateData.timeTaken = timeSpent
    }

    await homeworkCollection.updateOne(
      { _id: new ObjectId(homeworkId) },
      { $set: updateData }
    )

    // Log the question attempt (you might want to store this separately)
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        completedQuestions: newCompletedQuestions,
        totalQuestions: homework.totalQuestions,
        isCompleted,
        progress: Math.round((newCompletedQuestions / homework.totalQuestions) * 100)
      }
    })

  } catch (error) {
    console.error('Error submitting homework answer:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
