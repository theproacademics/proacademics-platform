import { MongoClient, Db, Collection, ObjectId } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export interface Lesson {
  _id?: ObjectId
  id: string
  lessonName?: string
  topic: string // Actual topic field
  description?: string // Add description field
  subject: string
  program?: string
  type?: 'Lesson' | 'Tutorial' | 'Workshop'
  scheduledDate?: string
  time?: string
  duration?: string
  teacher?: string
  status: 'draft' | 'active'
  videoUrl?: string
  zoomLink?: string
  createdAt: Date
  updatedAt: Date
}

export interface LessonQuery {
  page?: number
  limit?: number
  search?: string
  subject?: string
  teacher?: string
  status?: string
  scheduledDateFrom?: string
  scheduledDateTo?: string
  createdDateFrom?: string
  createdDateTo?: string
}

class LessonService {
  private async getCollection(): Promise<Collection<Lesson>> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "proacademics")
    return db.collection<Lesson>("lessons")
  }

  async createLesson(lessonData: Omit<Lesson, "_id" | "createdAt" | "updatedAt">): Promise<Lesson> {
    const collection = await this.getCollection()
    
    const now = new Date()
    const newLesson: Lesson = {
      ...lessonData,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(newLesson)
    return { ...newLesson, _id: result.insertedId }
  }

  async createManyLessons(lessonsData: Omit<Lesson, "_id" | "createdAt" | "updatedAt">[]): Promise<Lesson[]> {
    const collection = await this.getCollection()
    
    const now = new Date()
    const newLessons: Lesson[] = lessonsData.map(lesson => ({
      ...lesson,
      createdAt: now,
      updatedAt: now,
    }))

    const result = await collection.insertMany(newLessons)
    return newLessons.map((lesson, index) => ({
      ...lesson,
      _id: result.insertedIds[index]
    }))
  }

  async getAllLessons(query: LessonQuery = {}): Promise<{
    lessons: Lesson[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const collection = await this.getCollection()
    const { 
      page = 1, 
      limit = 10, 
      search, 
      subject, 
      teacher, 
      status,
      scheduledDateFrom,
      scheduledDateTo,
      createdDateFrom,
      createdDateTo
    } = query

    // Build filter
    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { lessonName: { $regex: search, $options: 'i', $exists: true } },
        { topic: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i', $exists: true } },
        { teacher: { $regex: search, $options: 'i', $exists: true } },
        { program: { $regex: search, $options: 'i', $exists: true } }
      ]
    }
    
    if (subject && subject !== 'all') {
      filter.subject = subject
    }
    
    if (teacher && teacher !== 'all') {
      filter.teacher = teacher
    }
    
    if (status && status !== 'all') {
      filter.status = status
    }

    // Date filtering for scheduledDate
    if (scheduledDateFrom || scheduledDateTo) {
      filter.scheduledDate = {}
      if (scheduledDateFrom) {
        filter.scheduledDate.$gte = scheduledDateFrom
      }
      if (scheduledDateTo) {
        filter.scheduledDate.$lte = scheduledDateTo
      }
    }

    // Date filtering for createdAt
    if (createdDateFrom || createdDateTo) {
      filter.createdAt = {}
      if (createdDateFrom) {
        filter.createdAt.$gte = new Date(createdDateFrom)
      }
      if (createdDateTo) {
        // Add 23:59:59 to include the entire day
        const endDate = new Date(createdDateTo)
        endDate.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = endDate
      }
    }

    const total = await collection.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const lessons = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      lessons,
      total,
      page,
      limit,
      totalPages
    }
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ id })
  }

  async updateLesson(id: string, updateData: Partial<Lesson>): Promise<Lesson | null> {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: "after" }
    )
    return result
  }

  async deleteLesson(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ id })
    return result.deletedCount > 0
  }

  async deleteManyLessons(ids: string[]): Promise<number> {
    const collection = await this.getCollection()
    const result = await collection.deleteMany({ id: { $in: ids } })
    return result.deletedCount
  }

  // Get unique subjects for filtering
  async getUniqueSubjects(): Promise<string[]> {
    const collection = await this.getCollection()
    const subjects = await collection.distinct('subject')
    return subjects.filter(subject => 
      subject && 
      subject.trim() !== '' && 
      subject.trim() !== '-' &&
      subject.toLowerCase() !== 'undefined' &&
      subject.toLowerCase() !== 'null'
    )
  }

  // Get unique teachers for filtering
  async getUniqueTeachers(): Promise<string[]> {
    const collection = await this.getCollection()
    const teachers = await collection.distinct('teacher')
    return teachers.filter((teacher): teacher is string => 
      typeof teacher === 'string' && 
      teacher.trim() !== '' && 
      teacher.trim() !== '-' &&
      teacher.toLowerCase() !== 'undefined' &&
      teacher.toLowerCase() !== 'null'
    )
  }

  // Get unique instructors for filtering (alias for teachers)
  async getUniqueInstructors(): Promise<string[]> {
    return this.getUniqueTeachers()
  }

  // Get lesson statistics
  async getLessonStats(): Promise<{
    totalLessons: number
    activeLessons: number
    draftLessons: number
    totalTeachers: number
    subjectBreakdown: { subject: string; count: number }[]
  }> {
    const collection = await this.getCollection()
    
    const totalLessons = await collection.countDocuments()
    const activeLessons = await collection.countDocuments({ status: 'active' })
    const draftLessons = await collection.countDocuments({ status: 'draft' })
    const teachers = await collection.distinct('teacher')
    const totalTeachers = teachers.filter(teacher => 
      teacher && 
      teacher.trim() !== '' && 
      teacher.trim() !== '-' &&
      teacher.toLowerCase() !== 'undefined' &&
      teacher.toLowerCase() !== 'null'
    ).length

    const subjectBreakdown = await collection.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          subject: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray()

    return {
      totalLessons,
      activeLessons,
      draftLessons,
      totalTeachers,
      subjectBreakdown: subjectBreakdown as { subject: string; count: number }[]
    }
  }
}

export const lessonService = new LessonService()
