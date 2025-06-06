import clientPromise from "../mongodb"
import type { Lesson } from "../../models/schemas"
import { ObjectId } from "mongodb"

// Get all lessons
export async function getAllLessons(): Promise<Lesson[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("lessons")
  return collection.find({}).toArray() as Promise<Lesson[]>
}

// Get lesson by ID
export async function getLessonById(id: string): Promise<Lesson | null> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("lessons")
  return collection.findOne({ _id: new ObjectId(id) }) as Promise<Lesson | null>
}

// Get lessons by program
export async function getLessonsByProgram(programId: string): Promise<Lesson[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("lessons")
  return collection.find({ programId }).toArray() as Promise<Lesson[]>
}

// Get upcoming lessons
export async function getUpcomingLessons(limit = 5): Promise<Lesson[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("lessons")

  const now = new Date()

  return collection
    .find({ date: { $gte: now } })
    .sort({ date: 1 })
    .limit(limit)
    .toArray() as Promise<Lesson[]>
}

// Create new lesson
export async function createLesson(lessonData: Omit<Lesson, "_id" | "createdAt" | "updatedAt">): Promise<Lesson> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("lessons")

  const now = new Date()
  const newLesson = {
    ...lessonData,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newLesson)
  return { ...newLesson, _id: result.insertedId.toString() } as Lesson
}

// Update lesson
export async function updateLesson(id: string, updateData: Partial<Lesson>): Promise<Lesson | null> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("lessons")

  const now = new Date()
  const update = {
    ...updateData,
    updatedAt: now,
  }

  await collection.updateOne({ _id: new ObjectId(id) }, { $set: update })

  return getLessonById(id)
}

// Delete lesson
export async function deleteLesson(id: string): Promise<boolean> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("lessons")

  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}

// Mark lesson as completed for a student
export async function markLessonCompleted(lessonId: string, studentId: string): Promise<void> {
  const client = await clientPromise
  const lessonsCollection = client.db("proacademics").collection("lessons")
  const xpLogsCollection = client.db("proacademics").collection("xpLogs")
  const studentsCollection = client.db("proacademics").collection("students")

  // Get the lesson to determine XP value
  const lesson = await getLessonById(lessonId)
  if (!lesson) throw new Error("Lesson not found")

  const xpAmount = lesson.xpValue

  // Create completion record
  const completionsCollection = client.db("proacademics").collection("lessonCompletions")
  await completionsCollection.insertOne({
    lessonId,
    studentId,
    completionDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // Log XP gain
  await xpLogsCollection.insertOne({
    studentId,
    action: "lesson_completed",
    xpAmount,
    date: new Date(),
    trigger: `lesson_${lessonId}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // Update student XP
  const student = await studentsCollection.findOne({ _id: new ObjectId(studentId) })
  if (student) {
    const newXpTotal = student.xpTotal + xpAmount
    const newLevel = Math.floor(newXpTotal / 200) + 1

    await studentsCollection.updateOne(
      { _id: new ObjectId(studentId) },
      {
        $set: {
          xpTotal: newXpTotal,
          currentLevel: newLevel,
          updatedAt: new Date(),
        },
      },
    )
  }
}

// Check if a lesson is completed by a student
export async function isLessonCompletedByStudent(lessonId: string, studentId: string): Promise<boolean> {
  const client = await clientPromise
  const completionsCollection = client.db("proacademics").collection("lessonCompletions")

  const completion = await completionsCollection.findOne({ lessonId, studentId })
  return !!completion
}
