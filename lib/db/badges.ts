import clientPromise from "../mongodb"
import type { Badge, StudentBadge } from "../../models/schemas"
import { ObjectId } from "mongodb"

// Get all badges
export async function getAllBadges(): Promise<Badge[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("badges")
  return collection.find({}).toArray() as Promise<Badge[]>
}

// Get badge by ID
export async function getBadgeById(id: string): Promise<Badge | null> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("badges")
  return collection.findOne({ _id: new ObjectId(id) }) as Promise<Badge | null>
}

// Get student's earned badges
export async function getStudentBadges(studentId: string): Promise<StudentBadge[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("studentBadges")
  return collection.find({ studentId }).toArray() as Promise<StudentBadge[]>
}

// Award badge to student
export async function awardBadgeToStudent(studentId: string, badgeId: string): Promise<StudentBadge> {
  const client = await clientPromise
  const badgesCollection = client.db("proacademics").collection("badges")
  const studentBadgesCollection = client.db("proacademics").collection("studentBadges")
  const xpLogsCollection = client.db("proacademics").collection("xpLogs")
  const studentsCollection = client.db("proacademics").collection("students")

  // Check if student already has this badge
  const existingBadge = await studentBadgesCollection.findOne({ studentId, badgeId })
  if (existingBadge) throw new Error("Student already has this badge")

  // Get badge details
  const badge = await badgesCollection.findOne({ _id: new ObjectId(badgeId) })
  if (!badge) throw new Error("Badge not found")

  const now = new Date()

  // Create student badge record
  const newStudentBadge = {
    studentId,
    badgeId,
    dateEarned: now,
    createdAt: now,
    updatedAt: now,
  }

  const result = await studentBadgesCollection.insertOne(newStudentBadge)

  // Award XP for the badge
  const xpAmount = badge.xpReward

  // Log XP gain
  await xpLogsCollection.insertOne({
    studentId,
    action: "badge_earned",
    xpAmount,
    date: now,
    trigger: `badge_${badgeId}`,
    createdAt: now,
    updatedAt: now,
  })

  // Update student XP
  const student = await studentsCollection.findOne({ _id: new ObjectId(studentId) })
  if (student) {
    const newXpTotal = student.xpTotal + xpAmount
    const newLevel = Math.floor(newXpTotal / 200) + 1

    await studentsCollection.updateOne(
      { _id: new ObjectId(studentId) },
      {
        $set: {
          xpTotal: newXpTotal,
          currentLevel: newLevel,
          updatedAt: now,
        },
      },
    )
  }

  return { ...newStudentBadge, _id: result.insertedId.toString() } as StudentBadge
}

// Check for badge eligibility
export async function checkBadgeEligibility(studentId: string): Promise<string[]> {
  const client = await clientPromise
  const badgesCollection = client.db("proacademics").collection("badges")
  const studentBadgesCollection = client.db("proacademics").collection("studentBadges")
  const studentsCollection = client.db("proacademics").collection("students")
  const attemptsCollection = client.db("proacademics").collection("questionAttempts")
  const lessonsCollection = client.db("proacademics").collection("lessonCompletions")

  // Get all badges
  const allBadges = await badgesCollection.find({}).toArray()

  // Get student's current badges
  const studentBadges = await studentBadgesCollection.find({ studentId }).toArray()
  const earnedBadgeIds = studentBadges.map((sb) => sb.badgeId)

  // Get student data
  const student = await studentsCollection.findOne({ _id: new ObjectId(studentId) })
  if (!student) throw new Error("Student not found")

  // Get student's question attempts
  const attempts = await attemptsCollection.find({ studentId }).toArray()

  // Get student's completed lessons
  const completedLessons = await lessonsCollection.find({ studentId }).toArray()

  const eligibleBadgeIds: string[] = []

  // Check each badge criteria
  for (const badge of allBadges) {
    // Skip if already earned
    if (earnedBadgeIds.includes(badge._id.toString())) continue

    const badgeId = badge._id.toString()

    // Check different badge criteria
    switch (badge.title) {
      case "Math Master":
        // Example: Complete 15 math lessons with 90%+ accuracy
        const mathLessons = completedLessons.filter((l) => l.subject === "Mathematics")
        const mathAttempts = attempts.filter((a) => a.subject === "Mathematics")
        const mathAccuracy =
          mathAttempts.length > 0 ? (mathAttempts.filter((a) => a.correct).length / mathAttempts.length) * 100 : 0

        if (mathLessons.length >= 15 && mathAccuracy >= 90) {
          eligibleBadgeIds.push(badgeId)
        }
        break

      case "Speed Demon":
        // Example: Complete 10 questions in under 5 minutes
        const fastAttempts = attempts.filter((a) => a.timeTaken < 30) // 30 seconds per question
        if (fastAttempts.length >= 10) {
          eligibleBadgeIds.push(badgeId)
        }
        break

      case "Consistent Learner":
        // Example: 7-day study streak
        if (student.streak >= 7) {
          eligibleBadgeIds.push(badgeId)
        }
        break

      // Add more badge criteria checks here
    }
  }

  return eligibleBadgeIds
}

// Export service object
export const badgeService = {
  getAllBadges,
  getBadgeById,
  getStudentBadges,
  awardBadgeToStudent,
  checkBadgeEligibility,
}
