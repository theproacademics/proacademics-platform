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

export interface TopicVault {
  _id?: ObjectId
  id: string
  videoName: string
  topic: string
  subject: string
  program: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description: string
  zoomLink?: string
  videoEmbedLink: string
  status: 'draft' | 'active'
  createdAt: Date
  updatedAt: Date
}

export interface TopicVaultQuery {
  page?: number
  limit?: number
  search?: string
  subject?: string
  teacher?: string
  status?: string
  type?: string
  program?: string
}

class TopicVaultService {
  private async getCollection(): Promise<Collection<TopicVault>> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "proacademics")
    return db.collection<TopicVault>("topicVault")
  }

  async createTopicVault(topicVaultData: Omit<TopicVault, "_id" | "createdAt" | "updatedAt">): Promise<TopicVault> {
    const collection = await this.getCollection()
    
    const now = new Date()
    const newTopicVault: TopicVault = {
      ...topicVaultData,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(newTopicVault)
    return { ...newTopicVault, _id: result.insertedId }
  }

  async createManyTopicVaults(topicVaultsData: Omit<TopicVault, "_id" | "createdAt" | "updatedAt">[]): Promise<TopicVault[]> {
    const collection = await this.getCollection()
    
    const now = new Date()
    const newTopicVaults: TopicVault[] = topicVaultsData.map(topicVault => ({
      ...topicVault,
      createdAt: now,
      updatedAt: now,
    }))

    const result = await collection.insertMany(newTopicVaults)
    return newTopicVaults.map((topicVault, index) => ({
      ...topicVault,
      _id: result.insertedIds[index]
    }))
  }

  async getAllTopicVaults(query: TopicVaultQuery = {}): Promise<{
    topicVaults: TopicVault[]
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
      type,
      program
    } = query

    // Build filter
    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { videoName: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { teacher: { $regex: search, $options: 'i' } },
        { program: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
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

    if (type && type !== 'all') {
      filter.type = type
    }

    if (program && program !== 'all') {
      filter.program = program
    }

    const total = await collection.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const topicVaults = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      topicVaults,
      total,
      page,
      limit,
      totalPages
    }
  }

  async getTopicVaultById(id: string): Promise<TopicVault | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ id })
  }

  async updateTopicVault(id: string, updateData: Partial<TopicVault>): Promise<TopicVault | null> {
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

  async deleteTopicVault(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ id })
    return result.deletedCount > 0
  }

  async deleteManyTopicVaults(ids: string[]): Promise<number> {
    const collection = await this.getCollection()
    const result = await collection.deleteMany({ id: { $in: ids } })
    return result.deletedCount
  }

  // Get unique subjects for filtering
  async getUniqueSubjects(): Promise<string[]> {
    const collection = await this.getCollection()
    const subjects = await collection.distinct('subject')
    return subjects.filter(subject => subject && subject.trim() !== '')
  }

  // Get unique teachers for filtering
  async getUniqueTeachers(): Promise<string[]> {
    const collection = await this.getCollection()
    const teachers = await collection.distinct('teacher')
    return teachers.filter(teacher => teacher && teacher.trim() !== '')
  }

  // Get unique programs for filtering
  async getUniquePrograms(): Promise<string[]> {
    const collection = await this.getCollection()
    const programs = await collection.distinct('program')
    return programs.filter(program => program && program.trim() !== '')
  }

  // Get topic vault statistics
  async getTopicVaultStats(): Promise<{
    totalTopicVaults: number
    activeTopicVaults: number
    draftTopicVaults: number
    totalTeachers: number
    subjectBreakdown: { subject: string; count: number }[]
    typeBreakdown: { type: string; count: number }[]
  }> {
    const collection = await this.getCollection()
    
    const totalTopicVaults = await collection.countDocuments()
    const activeTopicVaults = await collection.countDocuments({ status: 'active' })
    const draftTopicVaults = await collection.countDocuments({ status: 'draft' })
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

    const typeBreakdown = await collection.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray()

    return {
      totalTopicVaults,
      activeTopicVaults,
      draftTopicVaults,
      totalTeachers,
      subjectBreakdown: subjectBreakdown as { subject: string; count: number }[],
      typeBreakdown: typeBreakdown as { type: string; count: number }[]
    }
  }
}

export const topicVaultService = new TopicVaultService() 