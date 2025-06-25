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

export interface Subject {
  _id?: ObjectId
  id: string
  name: string
  color: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Program {
  _id?: ObjectId
  id: string
  name: string
  subjectId: string
  color: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SubjectWithPrograms extends Subject {
  programs: Program[]
}

class SubjectService {
  private async getSubjectsCollection(): Promise<Collection<Subject>> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "proacademics")
    return db.collection<Subject>("subjects")
  }

  private async getProgramsCollection(): Promise<Collection<Program>> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "proacademics")
    return db.collection<Program>("programs")
  }

  // Subject CRUD operations
  async createSubject(subjectData: Omit<Subject, "_id" | "createdAt" | "updatedAt">): Promise<Subject> {
    const collection = await this.getSubjectsCollection()
    
    const now = new Date()
    const newSubject: Subject = {
      ...subjectData,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(newSubject)
    return { ...newSubject, _id: result.insertedId }
  }

  async getAllSubjects(): Promise<Subject[]> {
    const collection = await this.getSubjectsCollection()
    return await collection.find({}).sort({ name: 1 }).toArray()
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    const collection = await this.getSubjectsCollection()
    return await collection.findOne({ id })
  }

  async updateSubject(id: string, updateData: Partial<Subject>): Promise<Subject | null> {
    const collection = await this.getSubjectsCollection()
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

  async deleteSubject(id: string): Promise<boolean> {
    const subjectsCollection = await this.getSubjectsCollection()
    const programsCollection = await this.getProgramsCollection()
    
    // Delete all programs associated with this subject
    await programsCollection.deleteMany({ subjectId: id })
    
    // Delete the subject
    const result = await subjectsCollection.deleteOne({ id })
    return result.deletedCount > 0
  }

  // Program CRUD operations
  async createProgram(programData: Omit<Program, "_id" | "createdAt" | "updatedAt">): Promise<Program> {
    const collection = await this.getProgramsCollection()
    
    const now = new Date()
    const newProgram: Program = {
      ...programData,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(newProgram)
    return { ...newProgram, _id: result.insertedId }
  }

  async getAllPrograms(): Promise<Program[]> {
    const collection = await this.getProgramsCollection()
    return await collection.find({}).sort({ name: 1 }).toArray()
  }

  async getProgramsBySubjectId(subjectId: string): Promise<Program[]> {
    const collection = await this.getProgramsCollection()
    return await collection.find({ subjectId }).sort({ name: 1 }).toArray()
  }

  async getProgramById(id: string): Promise<Program | null> {
    const collection = await this.getProgramsCollection()
    return await collection.findOne({ id })
  }

  async updateProgram(id: string, updateData: Partial<Program>): Promise<Program | null> {
    const collection = await this.getProgramsCollection()
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

  async deleteProgram(id: string): Promise<boolean> {
    const collection = await this.getProgramsCollection()
    const result = await collection.deleteOne({ id })
    return result.deletedCount > 0
  }

  // Combined operations
  async getAllSubjectsWithPrograms(): Promise<SubjectWithPrograms[]> {
    const subjects = await this.getAllSubjects()
    const programs = await this.getAllPrograms()
    
    return subjects.map(subject => ({
      ...subject,
      programs: programs.filter(program => program.subjectId === subject.id)
    }))
  }

  // Get formatted data for lesson creation (matching existing SUBJECT_PROGRAMS format)
  async getSubjectProgramsMap(): Promise<Record<string, string[]>> {
    const subjectsWithPrograms = await this.getAllSubjectsWithPrograms()
    const map: Record<string, string[]> = {}
    
    subjectsWithPrograms.forEach(subject => {
      if (subject.isActive) {
        map[subject.name] = subject.programs
          .filter(program => program.isActive)
          .map(program => program.name)
      }
    })
    
    return map
  }

  // Get subject colors map
  async getSubjectColorsMap(): Promise<Record<string, string>> {
    const subjects = await this.getAllSubjects()
    const map: Record<string, string> = {}
    
    subjects.forEach(subject => {
      if (subject.isActive) {
        map[subject.name] = subject.color
      }
    })
    
    return map
  }
}

export const subjectService = new SubjectService() 