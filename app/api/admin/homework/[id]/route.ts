import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { HomeworkAssignment } from "@/models/schemas"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    const homework = await collection.findOne({ _id: new ObjectId(params.id) })

    if (!homework) {
      return NextResponse.json(
        { success: false, error: "Homework not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: homework
    })
  } catch (error) {
    console.error("Error fetching homework:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch homework" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      homeworkName,
      subject,
      program,
      topic,
      subtopic,
      level,
      teacher,
      dateAssigned,
      dueDate,
      estimatedTime,
      xpAwarded,
      questionSet,
      status
    } = body

    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    const updateData: any = {
      updatedAt: new Date()
    }

    if (homeworkName !== undefined) updateData.homeworkName = homeworkName
    if (subject !== undefined) updateData.subject = subject
    if (program !== undefined) updateData.program = program
    if (topic !== undefined) updateData.topic = topic
    if (subtopic !== undefined) updateData.subtopic = subtopic
    if (level !== undefined) updateData.level = level
    if (teacher !== undefined) updateData.teacher = teacher
    if (dateAssigned !== undefined) updateData.dateAssigned = new Date(dateAssigned)
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate)
    if (estimatedTime !== undefined) updateData.estimatedTime = parseInt(estimatedTime)
    if (xpAwarded !== undefined) updateData.xpAwarded = parseInt(xpAwarded)
    if (questionSet !== undefined) {
      updateData.questionSet = questionSet
      updateData.totalQuestions = questionSet.length
    }
    if (status !== undefined) updateData.status = status

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Homework not found" },
        { status: 404 }
      )
    }

    const updatedHomework = await collection.findOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({
      success: true,
      data: updatedHomework
    })
  } catch (error) {
    console.error("Error updating homework:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update homework" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    const result = await collection.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Homework not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Homework deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting homework:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete homework" },
      { status: 500 }
    )
  }
}
