import { getDatabase } from "../mongodb"
import type { HomeworkAssignment } from "../../models/schemas"
import { ObjectId } from "mongodb"

export class HomeworkService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<HomeworkAssignment>("homeworkAssignments")
  }

  async createHomework(
    homeworkData: Omit<HomeworkAssignment, "_id" | "createdAt" | "updatedAt">,
  ): Promise<HomeworkAssignment> {
    const collection = await this.getCollection()
    const now = new Date()

    const homework: HomeworkAssignment = {
      ...homeworkData,
      createdAt: now,
      updatedAt: now,
      completionStatus: "not_started",
      completedQuestions: 0,
      xpEarned: 0,
    }

    const result = await collection.insertOne(homework)
    return { ...homework, _id: result.insertedId }
  }

  async getHomeworkById(id: string): Promise<HomeworkAssignment | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  async getStudentHomework(studentId: string): Promise<HomeworkAssignment[]> {
    const collection = await this.getCollection()
    return await collection
      .find({ studentId: new ObjectId(studentId) })
      .sort({ dueDate: 1 })
      .toArray()
  }

  async updateHomeworkProgress(
    homeworkId: string,
    progress: {
      completedQuestions?: number
      score?: number
      completionStatus?: "not_started" | "in_progress" | "completed" | "overdue"
      aiFeedback?: string
      xpEarned?: number
    },
  ): Promise<void> {
    const collection = await this.getCollection()

    await collection.updateOne(
      { _id: new ObjectId(homeworkId) },
      {
        $set: {
          ...progress,
          updatedAt: new Date(),
          ...(progress.completionStatus === "completed" && { dateSubmitted: new Date() }),
        },
      },
    )
  }

  async getOverdueHomework(): Promise<HomeworkAssignment[]> {
    const collection = await this.getCollection()
    const now = new Date()

    return await collection
      .find({
        dueDate: { $lt: now },
        completionStatus: { $ne: "completed" },
      })
      .toArray()
  }

  async markOverdueHomework(): Promise<void> {
    const collection = await this.getCollection()
    const now = new Date()

    await collection.updateMany(
      {
        dueDate: { $lt: now },
        completionStatus: { $in: ["not_started", "in_progress"] },
      },
      {
        $set: {
          completionStatus: "overdue",
          updatedAt: now,
        },
      },
    )
  }

  async getHomeworkByLesson(lessonId: string): Promise<HomeworkAssignment[]> {
    const collection = await this.getCollection()
    return await collection.find({ lessonId: new ObjectId(lessonId) }).toArray()
  }
}

export const homeworkService = new HomeworkService()
