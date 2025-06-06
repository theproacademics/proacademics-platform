import clientPromise from "../mongodb"
import type { LeaderboardLog } from "../../models/schemas"

// Get current leaderboard
export async function getCurrentLeaderboard(limit = 10): Promise<LeaderboardLog[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("leaderboardLogs")

  // Get the most recent week's data
  const latestWeek = await collection.find({}).sort({ "dateRange.end": -1 }).limit(1).toArray()

  if (latestWeek.length === 0) return []

  const latestDateRange = latestWeek[0].dateRange

  return collection
    .find({ "dateRange.start": latestDateRange.start, "dateRange.end": latestDateRange.end })
    .sort({ weeklyXP: -1 })
    .limit(limit)
    .toArray() as Promise<LeaderboardLog[]>
}

// Get leaderboard by date range
export async function getLeaderboardByDateRange(startDate: Date, endDate: Date, limit = 10): Promise<LeaderboardLog[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("leaderboardLogs")

  return collection
    .find({
      "dateRange.start": startDate,
      "dateRange.end": endDate,
    })
    .sort({ weeklyXP: -1 })
    .limit(limit)
    .toArray() as Promise<LeaderboardLog[]>
}

// Get student's leaderboard history
export async function getStudentLeaderboardHistory(studentId: string): Promise<LeaderboardLog[]> {
  const client = await clientPromise
  const collection = client.db("proacademics").collection("leaderboardLogs")

  return collection.find({ studentId }).sort({ "dateRange.end": -1 }).toArray() as Promise<LeaderboardLog[]>
}

// Update weekly leaderboard
export async function updateWeeklyLeaderboard(): Promise<void> {
  const client = await clientPromise
  const studentsCollection = client.db("proacademics").collection("students")
  const xpLogsCollection = client.db("proacademics").collection("xpLogs")
  const leaderboardCollection = client.db("proacademics").collection("leaderboardLogs")

  // Calculate date range for the past week
  const now = new Date()
  const endDate = new Date(now)
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 7)

  // Get all students
  const students = await studentsCollection.find({}).toArray()

  // For each student, calculate their XP for the week
  for (const student of students) {
    const studentId = student._id.toString()

    // Get XP logs for the past week
    const xpLogs = await xpLogsCollection
      .find({
        studentId,
        date: { $gte: startDate, $lte: endDate },
      })
      .toArray()

    // Calculate total XP
    const weeklyXP = xpLogs.reduce((sum, log) => sum + log.xpAmount, 0)

    // Get previous week's rank
    const previousWeekEnd = new Date(startDate)
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 1)
    const previousWeekStart = new Date(previousWeekEnd)
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)

    const previousRankEntry = await leaderboardCollection.findOne({
      studentId,
      "dateRange.start": previousWeekStart,
      "dateRange.end": previousWeekEnd,
    })

    const previousRank = previousRankEntry?.rank || 0

    // Create a placeholder entry (rank will be updated later)
    await leaderboardCollection.insertOne({
      studentId,
      weeklyXP,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      rank: 0, // Placeholder
      previousRank,
      createdAt: now,
      updatedAt: now,
    })
  }

  // Now sort all entries and update ranks
  const entries = await leaderboardCollection
    .find({
      "dateRange.start": startDate,
      "dateRange.end": endDate,
    })
    .sort({ weeklyXP: -1 })
    .toArray()

  // Update ranks
  for (let i = 0; i < entries.length; i++) {
    const rank = i + 1
    await leaderboardCollection.updateOne({ _id: entries[i]._id }, { $set: { rank } })
  }
}
