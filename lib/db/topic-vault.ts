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

// Legacy TopicVault interface for individual videos
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

// New Topic interface for topic containers with subtopics
export interface SubtopicVault {
  id: string
  videoName: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description: string
  zoomLink?: string
  videoEmbedLink: string
  status: 'draft' | 'active'
}

export interface Topic {
  _id?: ObjectId
  id: string
  topicName: string
  subject: string
  program: string
  description?: string
  status: 'draft' | 'active'
  subtopics: SubtopicVault[]
  createdAt: string
  updatedAt: string
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

  private async getTopicsCollection(): Promise<Collection<Topic>> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "proacademics")
    return db.collection<Topic>("topics")
  }

  // New Topic methods
  async createTopic(topicData: Omit<Topic, "_id">): Promise<Topic> {
    const collection = await this.getTopicsCollection()
    
    const newTopic: Topic = {
      ...topicData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await collection.insertOne(newTopic)
    return { ...newTopic, _id: result.insertedId }
  }

  async getAllTopics(query: TopicVaultQuery = {}): Promise<{
    topics: Topic[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const collection = await this.getTopicsCollection()
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
        { topicName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { program: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'subtopics.videoName': { $regex: search, $options: 'i' } },
        { 'subtopics.teacher': { $regex: search, $options: 'i' } }
      ]
    }
    
    if (subject && subject !== 'all') {
      filter.subject = subject
    }
    
    if (teacher && teacher !== 'all') {
      filter['subtopics.teacher'] = teacher
    }
    
    if (status && status !== 'all') {
      filter.status = status
    }

    if (type && type !== 'all') {
      filter['subtopics.type'] = type
    }

    if (program && program !== 'all') {
      filter.program = program
    }

    const total = await collection.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const topics = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      topics,
      total,
      page,
      limit,
      totalPages
    }
  }

  async getTopicById(id: string): Promise<Topic | null> {
    const collection = await this.getTopicsCollection()
    return await collection.findOne({ id })
  }

  async updateTopic(id: string, updateData: Partial<Topic>): Promise<Topic | null> {
    const collection = await this.getTopicsCollection()
    const result = await collection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date().toISOString() 
        } 
      },
      { returnDocument: "after" }
    )
    return result
  }

  async deleteTopic(id: string): Promise<boolean> {
    const collection = await this.getTopicsCollection()
    const result = await collection.deleteOne({ id })
    return result.deletedCount > 0
  }

  async deleteManyTopics(ids: string[]): Promise<number> {
    const collection = await this.getTopicsCollection()
    const result = await collection.deleteMany({ id: { $in: ids } })
    return result.deletedCount
  }

  // Legacy TopicVault methods (for backward compatibility)
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
    topics: Topic[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    // For now, redirect to the new topics method
    return await this.getAllTopics(query)
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

  // Get unique subjects for filtering (updated for topics)
  async getUniqueSubjects(): Promise<string[]> {
    const collection = await this.getTopicsCollection()
    const subjects = await collection.distinct('subject')
    return subjects.filter(subject => subject && subject.trim() !== '')
  }

  // Get unique teachers for filtering (updated for topics)
  async getUniqueTeachers(): Promise<string[]> {
    const collection = await this.getTopicsCollection()
    const teachers = await collection.distinct('subtopics.teacher')
    return teachers.filter(teacher => teacher && teacher.trim() !== '')
  }

  // Get unique programs for filtering (updated for topics)
  async getUniquePrograms(): Promise<string[]> {
    const collection = await this.getTopicsCollection()
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
    const collection = await this.getTopicsCollection()
    
    const totalTopicVaults = await collection.countDocuments()
    const activeTopicVaults = await collection.countDocuments({ status: 'active' })
    const draftTopicVaults = await collection.countDocuments({ status: 'draft' })
    
    // Get unique teachers from subtopics
    const allTopics = await collection.find().toArray()
    const uniqueTeachers = new Set<string>()
    allTopics.forEach(topic => {
      topic.subtopics?.forEach(subtopic => {
        if (subtopic.teacher && subtopic.teacher.trim() !== '') {
          uniqueTeachers.add(subtopic.teacher)
        }
      })
    })
    const totalTeachers = uniqueTeachers.size

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

    // Type breakdown from subtopics
    const typeBreakdown = await collection.aggregate([
      { $unwind: '$subtopics' },
      {
        $group: {
          _id: '$subtopics.type',
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