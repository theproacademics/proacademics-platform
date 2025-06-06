import { studentService } from "../db/students"
import { getDatabase } from "../mongodb"
import type { XPLog } from "../../models/schemas"

export class DailyTasks {
  async runDailyTasks(): Promise<void> {
    console.log("Starting daily tasks...")

    try {
      await this.updateStudyStreaks()
      await this.sendEngagementReminders()
      await this.updateDailyLeaderboard()

      console.log("Daily tasks completed successfully")
    } catch (error) {
      console.error("Error running daily tasks:", error)
      throw error
    }
  }

  private async updateStudyStreaks(): Promise<void> {
    console.log("Updating study streaks...")

    const students = await studentService.getAllStudents()

    for (const student of students) {
      await studentService.updateStudyStreak(student._id!.toString())
    }
  }

  private async sendEngagementReminders(): Promise<void> {
    console.log("Checking for inactive students...")

    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const students = await studentService.getAllStudents()
    const inactiveStudents = students.filter((student) => student.lastLogin < threeDaysAgo)

    for (const student of inactiveStudents) {
      const daysSinceLogin = Math.floor((Date.now() - student.lastLogin.getTime()) / (1000 * 60 * 60 * 24))

      console.log(`Student ${student.name} inactive for ${daysSinceLogin} days`)

      // Here you would send email notifications
      // emailService.sendEngagementReminder(student.email, daysSinceLogin)
    }
  }

  private async updateDailyLeaderboard(): Promise<void> {
    console.log("Updating daily leaderboard...")

    const db = await getDatabase()
    const xpCollection = db.collection<XPLog>("xpLogs")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate daily XP
    const dailyXP = await xpCollection
      .aggregate([
        {
          $match: {
            date: { $gte: today },
          },
        },
        {
          $group: {
            _id: "$studentId",
            dailyXP: { $sum: "$xpAmount" },
          },
        },
        {
          $sort: { dailyXP: -1 },
        },
        {
          $limit: 50,
        },
      ])
      .toArray()

    // Update daily leaderboard
    // leaderboardService.updateDailyLeaderboard(dailyXP)
    console.log(`Updated daily leaderboard with ${dailyXP.length} entries`)
  }
}

export const dailyTasks = new DailyTasks()

// Function to be called by cron job or scheduler
export async function runDailyMaintenance(): Promise<void> {
  await dailyTasks.runDailyTasks()
}
