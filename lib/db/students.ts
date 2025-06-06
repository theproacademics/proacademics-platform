import { getDatabase } from "../mongodb"
import type { Student, XPLog, QuestionAttempt } from "../../models/schemas"
import { ObjectId } from "mongodb"

export class StudentService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<Student>("students")
  }

  async createStudent(studentData: Omit<Student, "_id" | "createdAt" | "updatedAt">): Promise<Student> {
    const collection = await this.getCollection()
    const now = new Date()

    const student: Student = {
      ...studentData,
      createdAt: now,
      updatedAt: now,
      xpTotal: 0,
      currentLevel: 1,
      currentWorkingAverage: 0,
      studyStreak: 0,
      weakTopics: [],
      strongTopics: [],
      recentTopics: [],
      enrolledPrograms: [],
    }

    const result = await collection.insertOne(student)
    return { ...student, _id: result.insertedId }
  }

  async getStudentById(id: string): Promise<Student | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  async getStudentByEmail(email: string): Promise<Student | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ email })
  }

  async updateStudentXP(studentId: string, xpAmount: number): Promise<void> {
    const collection = await this.getCollection()
    const student = await this.getStudentById(studentId)

    if (!student) throw new Error("Student not found")

    const newXPTotal = student.xpTotal + xpAmount
    const newLevel = Math.floor(newXPTotal / 200) + 1

    await collection.updateOne(
      { _id: new ObjectId(studentId) },
      {
        $set: {
          xpTotal: newXPTotal,
          currentLevel: newLevel,
          updatedAt: new Date(),
        },
      },
    )
  }

  async updateStudentCWA(studentId: string): Promise<void> {
    const db = await getDatabase()
    const attemptsCollection = db.collection<QuestionAttempt>("questionAttempts")

    // Get last 50 attempts for CWA calculation
    const recentAttempts = await attemptsCollection
      .find({ studentId: new ObjectId(studentId) })
      .sort({ attemptDate: -1 })
      .limit(50)
      .toArray()

    if (recentAttempts.length === 0) return

    const correctCount = recentAttempts.filter((attempt) => attempt.correct).length
    const cwa = (correctCount / recentAttempts.length) * 100

    const collection = await this.getCollection()
    await collection.updateOne(
      { _id: new ObjectId(studentId) },
      {
        $set: {
          currentWorkingAverage: cwa,
          updatedAt: new Date(),
        },
      },
    )
  }

  async updateStudyStreak(studentId: string): Promise<void> {
    const db = await getDatabase()
    const xpCollection = db.collection<XPLog>("xpLogs")

    // Check if student has activity today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayActivity = await xpCollection.findOne({
      studentId: new ObjectId(studentId),
      date: { $gte: today },
    })

    const collection = await this.getCollection()
    const student = await this.getStudentById(studentId)

    if (!student) return

    if (todayActivity) {
      // Continue or start streak
      await collection.updateOne(
        { _id: new ObjectId(studentId) },
        {
          $set: {
            studyStreak: student.studyStreak + 1,
            lastLogin: new Date(),
            updatedAt: new Date(),
          },
        },
      )
    } else {
      // Check if streak should be broken
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const yesterdayActivity = await xpCollection.findOne({
        studentId: new ObjectId(studentId),
        date: { $gte: yesterday, $lt: today },
      })

      if (!yesterdayActivity && student.studyStreak > 0) {
        // Break streak
        await collection.updateOne(
          { _id: new ObjectId(studentId) },
          {
            $set: {
              studyStreak: 0,
              updatedAt: new Date(),
            },
          },
        )
      }
    }
  }

  async getAllStudents(): Promise<Student[]> {
    const collection = await this.getCollection()
    return await collection.find({}).toArray()
  }

  async getStudentsByProgram(programId: string): Promise<Student[]> {
    const collection = await this.getCollection()
    return await collection
      .find({
        enrolledPrograms: new ObjectId(programId),
      })
      .toArray()
  }
}

export const studentService = new StudentService()
