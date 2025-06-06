import clientPromise from "../mongodb"
import type { ReflectionJournal } from "../../models/schemas"
import { ObjectId } from "mongodb"

// Get student's reflection journals
export async function getStudentReflections(studentId: string): Promise<ReflectionJournal[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("reflectionJournals")

  return collection.find({ studentId }).sort({ date: -1 }).toArray() as Promise<ReflectionJournal[]>
}

// Get reflection by ID
export async function getReflectionById(id: string): Promise<ReflectionJournal | null> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("reflectionJournals")

  return collection.findOne({ _id: new ObjectId(id) }) as Promise<ReflectionJournal | null>
}

// Create new reflection
export async function createReflection(studentId: string, content: string): Promise<ReflectionJournal> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("reflectionJournals")

  const now = new Date()
  const newReflection = {
    studentId,
    content,
    date: now,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newReflection)
  return { ...newReflection, _id: result.insertedId.toString() } as ReflectionJournal
}

// Update reflection
export async function updateReflection(id: string, content: string): Promise<ReflectionJournal | null> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("reflectionJournals")

  const now = new Date()

  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        content,
        updatedAt: now,
      },
    },
  )

  return getReflectionById(id)
}

// Delete reflection
export async function deleteReflection(id: string): Promise<boolean> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("reflectionJournals")

  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}
