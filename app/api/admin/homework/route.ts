import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { HomeworkAssignment } from "@/models/schemas"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const subject = searchParams.get("subject") || "all"
    const program = searchParams.get("program") || "all"
    const status = searchParams.get("status") || "all"
    const level = searchParams.get("level") || "all"
    const teacher = searchParams.get("teacher") || "all"

    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    // Build filter query
    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { homeworkName: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { subtopic: { $regex: search, $options: "i" } },
        { teacher: { $regex: search, $options: "i" } }
      ]
    }

    if (subject !== "all") filter.subject = subject
    if (program !== "all") filter.program = program
    if (status !== "all") filter.status = status
    if (level !== "all") filter.level = level
    if (teacher !== "all") filter.teacher = teacher

    const skip = (page - 1) * limit

    const [homework, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter)
    ])

    return NextResponse.json({
      success: true,
      data: {
        homework,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching homework:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch homework" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      status = "draft"
    } = body

    // Validate required fields
    if (!homeworkName || !subject || !program || !topic || !subtopic || !level || !teacher || !dateAssigned || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    const homework: Omit<HomeworkAssignment, "_id"> = {
      assignmentId: new ObjectId().toString(),
      homeworkName,
      subject,
      program,
      topic,
      subtopic,
      level,
      teacher,
      dateAssigned: new Date(dateAssigned),
      dueDate: new Date(dueDate),
      estimatedTime: parseInt(estimatedTime) || 30,
      xpAwarded: parseInt(xpAwarded) || 100,
      questionSet: questionSet || [],
      totalQuestions: questionSet?.length || 0,
      completedQuestions: 0,
      completionStatus: "not_started",
      xpEarned: 0,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(homework)

    return NextResponse.json({
      success: true,
      data: { ...homework, _id: result.insertedId }
    })
  } catch (error) {
    console.error("Error creating homework:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create homework" },
      { status: 500 }
    )
  }
}
