import clientPromise from "../mongodb"
import type { Parent } from "../../models/schemas"
import { ObjectId } from "mongodb"
import { hashPassword } from "../auth"

// Get all parents
export async function getAllParents(): Promise<Parent[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("parents")
  return collection.find({}).toArray() as Promise<Parent[]>
}

// Get parent by ID
export async function getParentById(id: string): Promise<Parent | null> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("parents")
  return collection.findOne({ _id: new ObjectId(id) }) as Promise<Parent | null>
}

// Get parent by email
export async function getParentByEmail(email: string): Promise<Parent | null> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("parents")
  return collection.findOne({ email }) as Promise<Parent | null>
}

// Create new parent
export async function createParent(parentData: Omit<Parent, "_id" | "createdAt" | "updatedAt">): Promise<Parent> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("parents")

  const now = new Date()
  const hashedPassword = await hashPassword(parentData.password)

  const newParent = {
    ...parentData,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newParent)
  return { ...newParent, _id: result.insertedId.toString() } as Parent
}

// Update parent
export async function updateParent(id: string, updateData: Partial<Parent>): Promise<Parent | null> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("parents")

  const now = new Date()
  const update = {
    ...updateData,
    updatedAt: now,
  }

  // If password is being updated, hash it
  if (update.password) {
    update.password = await hashPassword(update.password)
  }

  await collection.updateOne({ _id: new ObjectId(id) }, { $set: update })

  return getParentById(id)
}

// Link parent to student
export async function linkParentToStudent(parentId: string, studentId: string): Promise<Parent | null> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("parents")

  await collection.updateOne(
    { _id: new ObjectId(parentId) },
    {
      $addToSet: { students: studentId },
      $set: { updatedAt: new Date() },
    },
  )

  return getParentById(parentId)
}

// Get students linked to parent
export async function getParentStudents(parentId: string): Promise<any[]> {
  const client = await clientPromise
  const parentsCollection = client.db("proacademics").collection("parents")
  const studentsCollection = client.db("proacademics").collection("students")

  const parent = await getParentById(parentId)
  if (!parent || !parent.students || parent.students.length === 0) return []

  const studentIds = parent.students.map((id) => new ObjectId(id))

  return studentsCollection.find({ _id: { $in: studentIds } }).toArray()
}

// Generate parent report
export async function generateParentReport(parentId: string, studentId: string): Promise<string> {
  // In a real implementation, this would generate a comprehensive report
  // For now, we'll return a placeholder
  return `
    # Student Progress Report
    
    ## Performance Overview
    - Predicted Grade: A*
    - Current Working Average: 87.5%
    - Weekly Progress: +2.3%
    
    ## Learning Activity
    - Lessons completed: 8
    - Homework submissions: 6
    - Lex AI sessions: 12
    - Study time: 16.5 hours
    
    ## Strengths & Areas for Improvement
    - Strong subjects: Mathematics, Physics
    - Areas needing attention: Chemistry (Organic Chemistry)
    - Recommended focus: Wave motion concepts in Physics
    
    ## Achievements
    - Badges earned: Math Master
    - XP gained: 450
    - Study streak: 7 days
  `
}
