import { studentService } from "../db/students"
import { homeworkService } from "../db/homework"
import { leaderboardService } from "../db/leaderboard"
import { badgeService } from "../db/badges"
import { getDatabase } from "../mongodb"
import type { XPLog } from "../../models/schemas"

export class WeeklyTasks {
  async runWeeklyTasks(): Promise<void> {
    console.log("Starting weekly tasks...")

    try {
      await this.calculateWeeklyXP()
      await this.updateLeaderboards()
      await this.checkBadgeEligibility()
      await this.markOverdueHomework()
      await this.generateWeeklyReports()

      console.log("Weekly tasks completed successfully")
    } catch (error) {
      console.error("Error running weekly tasks:", error)
      throw error
    }
  }

  private async calculateWeeklyXP(): Promise<void> {
    console.log("Calculating weekly XP...")

    const db = await getDatabase()
    const xpCollection = db.collection<XPLog>("xpLogs")

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Aggregate XP by student for the past week
    const weeklyXP = await xpCollection
      .aggregate([
        {
          $match: {
            date: { $gte: oneWeekAgo },
          },
        },
        {
          $group: {
            _id: "$studentId",
            totalXP: { $sum: "$xpAmount" },
            activities: { $push: "$action" },
          },
        },
      ])
      .toArray()

    // Update student levels based on total XP
    for (const studentXP of weeklyXP) {
      const student = await studentService.getStudentById(studentXP._id.toString())
      if (student) {
        const newLevel = Math.floor(student.xpTotal / 200) + 1
        if (newLevel > student.currentLevel) {
          // Level up! Could trigger notifications here
          console.log(`Student ${student.name} leveled up to ${newLevel}`)
        }
      }
    }
  }

  private async updateLeaderboards(): Promise<void> {
    console.log("Updating weekly leaderboards...")

    const db = await getDatabase()
    const xpCollection = db.collection<XPLog>("xpLogs")

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Calculate weekly XP for leaderboard
    const weeklyLeaderboard = await xpCollection
      .aggregate([
        {
          $match: {
            date: { $gte: oneWeekAgo },
          },
        },
        {
          $group: {
            _id: "$studentId",
            weeklyXP: { $sum: "$xpAmount" },
          },
        },
        {
          $sort: { weeklyXP: -1 },
        },
        {
          $limit: 100,
        },
      ])
      .toArray()

    // Update leaderboard entries
    for (let i = 0; i < weeklyLeaderboard.length; i++) {
      await leaderboardService.updateLeaderboardEntry({
        studentId: weeklyLeaderboard[i]._id.toString(),
        period: "weekly",
        xpEarned: weeklyLeaderboard[i].weeklyXP,
        rank: i + 1,
        dateRange: `${oneWeekAgo.toISOString().split("T")[0]} to ${new Date().toISOString().split("T")[0]}`,
      })
    }
  }

  private async checkBadgeEligibility(): Promise<void> {
    console.log("Checking badge eligibility...")

    const students = await studentService.getAllStudents()

    for (const student of students) {
      await badgeService.checkAndAwardBadges(student._id!.toString())
    }
  }

  private async markOverdueHomework(): Promise<void> {
    console.log("Marking overdue homework...")
    await homeworkService.markOverdueHomework()
  }

  private async generateWeeklyReports(): Promise<void> {
    console.log("Generating weekly reports...")

    // This would integrate with the reports service
    // For now, just log that reports would be generated
    const students = await studentService.getAllStudents()

    for (const student of students) {
      if (student.parentId) {
        // Generate parent report
        console.log(`Generating weekly report for student ${student.name}`)
        // reportService.generateParentReport(student._id.toString())
      }
    }
  }
}

export const weeklyTasks = new WeeklyTasks()

// Function to be called by cron job or scheduler
export async function runWeeklyMaintenance(): Promise<void> {
  await weeklyTasks.runWeeklyTasks()
}
