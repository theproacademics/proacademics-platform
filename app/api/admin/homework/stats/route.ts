import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { HomeworkAssignment } from "@/models/schemas"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    const [
      total,
      active,
      draft,
      bySubject,
      byLevel,
      recentActivity
    ] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ status: "active" }),
      collection.countDocuments({ status: "draft" }),
      collection.aggregate([
        { $group: { _id: "$subject", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      collection.aggregate([
        { $group: { _id: "$level", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      collection.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .project({ homeworkName: 1, subject: 1, createdAt: 1, status: 1 })
        .toArray()
    ])

    return NextResponse.json({
      success: true,
      data: {
        total,
        active,
        draft,
        bySubject,
        byLevel,
        recentActivity
      }
    })
  } catch (error) {
    console.error("Error fetching homework stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch homework stats" },
      { status: 500 }
    )
  }
}
