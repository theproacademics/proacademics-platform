import { getDatabase } from "../mongodb"
import type { Question, QuestionAttempt } from "../../models/schemas"
import { ObjectId } from "mongodb"

export class QuestionService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<Question>("questions")
  }

  async createQuestion(questionData: Omit<Question, "_id" | "createdAt" | "updatedAt">): Promise<Question> {
    const collection = await this.getCollection()
    const now = new Date()

    const question: Question = {
      ...questionData,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(question)
    return { ...question, _id: result.insertedId }
  }

  async getQuestionById(id: string): Promise<Question | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  async getQuestionsByTopic(topicId: string): Promise<Question[]> {
    const collection = await this.getCollection()
    return await collection.find({ relatedTopicId: new ObjectId(topicId) }).toArray()
  }

  async getQuestionsBySubject(subject: string): Promise<Question[]> {
    const collection = await this.getCollection()
    return await collection.find({ subject }).toArray()
  }

  async getQuestionsByDifficulty(difficulty: "easy" | "medium" | "hard"): Promise<Question[]> {
    const collection = await this.getCollection()
    return await collection.find({ difficulty }).toArray()
  }

  async recordQuestionAttempt(
    attemptData: Omit<QuestionAttempt, "_id" | "createdAt" | "updatedAt">,
  ): Promise<QuestionAttempt> {
    const db = await getDatabase()
    const collection = db.collection<QuestionAttempt>("questionAttempts")
    const now = new Date()

    const attempt: QuestionAttempt = {
      ...attemptData,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(attempt)
    return { ...attempt, _id: result.insertedId }
  }

  async getStudentAttempts(studentId: string, limit?: number): Promise<QuestionAttempt[]> {
    const db = await getDatabase()
    const collection = db.collection<QuestionAttempt>("questionAttempts")

    const query = collection.find({ studentId: new ObjectId(studentId) }).sort({ attemptDate: -1 })

    if (limit) {
      query.limit(limit)
    }

    return await query.toArray()
  }

  async getQuestionAttempts(questionId: string): Promise<QuestionAttempt[]> {
    const db = await getDatabase()
    const collection = db.collection<QuestionAttempt>("questionAttempts")
    return await collection.find({ questionId: new ObjectId(questionId) }).toArray()
  }

  async getRandomQuestions(
    count: number,
    filters?: {
      subject?: string
      difficulty?: string
      excludeIds?: string[]
    },
  ): Promise<Question[]> {
    const collection = await this.getCollection()

    const matchStage: any = {}
    if (filters?.subject) matchStage.subject = filters.subject
    if (filters?.difficulty) matchStage.difficulty = filters.difficulty
    if (filters?.excludeIds?.length) {
      matchStage._id = { $nin: filters.excludeIds.map((id) => new ObjectId(id)) }
    }

    const pipeline = [{ $match: matchStage }, { $sample: { size: count } }]

    return await collection.aggregate(pipeline).toArray()
  }
}

export const questionService = new QuestionService()
