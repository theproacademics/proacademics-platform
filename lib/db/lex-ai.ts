import clientPromise from "../mongodb"
import type { LexAILog, Question, QuestionAttempt } from "../../models/schemas"
import { ObjectId } from "mongodb"
import { LexAIAlgorithm } from "../lex-algorithm"

// Log a Lex AI session
export async function logLexAISession(
  studentId: string,
  questionsAnswered: number,
  accuracy: number,
  suggestedFocusTopics: string[],
  sessionDuration: number,
  levelStart: number,
  levelEnd: number,
): Promise<LexAILog> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("lexAILogs")

  const now = new Date()
  const newLog = {
    studentId,
    timestamp: now,
    questionsAnswered,
    accuracy,
    suggestedFocusTopics,
    sessionDuration,
    levelStart,
    levelEnd,
    cwaUpdateTrigger: true,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newLog)
  return { ...newLog, _id: result.insertedId.toString() } as LexAILog
}

// Get student's Lex AI session history
export async function getStudentLexAIHistory(studentId: string): Promise<LexAILog[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("lexAILogs")

  return collection.find({ studentId }).sort({ timestamp: -1 }).toArray() as Promise<LexAILog[]>
}

// Generate questions for a Lex AI session
export async function generateLexAISessionQuestions(studentId: string): Promise<Question[]> {
  const client = await clientPromise
  const questionsCollection = client.db("proacademics").collection("questions")
  const attemptsCollection = client.db("proacademics").collection("questionAttempts")
  const studentsCollection = client.db("proacademics").collection("students")

  // Get all questions
  const allQuestions = (await questionsCollection.find({}).toArray()) as Question[]

  // Get student's question attempts
  const attempts = (await attemptsCollection.find({ studentId }).toArray()) as QuestionAttempt[]

  // Get student profile
  const student = await studentsCollection.findOne({ _id: new ObjectId(studentId) })
  if (!student) throw new Error("Student not found")

  // Create a LexAIAlgorithm instance
  const lexAlgorithm = new LexAIAlgorithm(allQuestions, attempts)

  // Generate session questions
  return lexAlgorithm.generateSessionQuestions(studentId, {
    id: studentId,
    weakTopics: student.weakTopics || [],
    strongTopics: student.strongTopics || [],
    recentTopics: student.recentTopics || [],
    lastStudyDate: student.lastLoginDate || new Date(),
    currentLevel: student.currentLevel,
    xpTotal: student.xpTotal,
  })
}

// Update student profile based on Lex AI session
export async function updateStudentProfileFromLexSession(
  studentId: string,
  sessionQuestions: Question[],
  sessionAttempts: QuestionAttempt[],
): Promise<void> {
  const client = await clientPromise
  const questionsCollection = client.db("proacademics").collection("questions")
  const attemptsCollection = client.db("proacademics").collection("questionAttempts")
  const studentsCollection = client.db("proacademics").collection("students")

  // Get all questions
  const allQuestions = (await questionsCollection.find({}).toArray()) as Question[]

  // Get all student's question attempts
  const allAttempts = (await attemptsCollection.find({ studentId }).toArray()) as QuestionAttempt[]

  // Create a LexAIAlgorithm instance
  const lexAlgorithm = new LexAIAlgorithm(allQuestions, allAttempts)

  // Update student profile
  const profileUpdates = lexAlgorithm.updateStudentProfile(studentId, sessionQuestions, sessionAttempts)

  // Apply updates to student record
  await studentsCollection.updateOne(
    { _id: new ObjectId(studentId) },
    {
      $set: {
        ...profileUpdates,
        updatedAt: new Date(),
      },
    },
  )

  // Calculate and update CWA
  const cwa = lexAlgorithm.calculateTopicMastery(studentId, "all")
  await studentsCollection.updateOne(
    { _id: new ObjectId(studentId) },
    {
      $set: {
        currentWorkingAverage: cwa,
        updatedAt: new Date(),
      },
    },
  )
}
