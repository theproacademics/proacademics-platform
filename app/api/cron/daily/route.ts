import { NextResponse } from "next/server"
import { runDailyMaintenance } from "@/lib/automations/daily-tasks"

export async function POST() {
  try {
    await runDailyMaintenance()
    return NextResponse.json({ success: true, message: "Daily tasks completed" })
  } catch (error) {
    console.error("Daily cron job failed:", error)
    return NextResponse.json({ success: false, error: "Daily tasks failed" }, { status: 500 })
  }
}
