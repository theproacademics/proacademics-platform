import { NextResponse } from "next/server"
import { runWeeklyMaintenance } from "@/lib/automations/weekly-tasks"

export async function POST() {
  try {
    await runWeeklyMaintenance()
    return NextResponse.json({ success: true, message: "Weekly tasks completed" })
  } catch (error) {
    console.error("Weekly cron job failed:", error)
    return NextResponse.json({ success: false, error: "Weekly tasks failed" }, { status: 500 })
  }
}
