import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock homework data - in a real app, this would come from database
const mockHomeworkData = [
  {
    id: "1",
    title: "Mathematics - Quadratic Equations",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "in_progress",
    score: null,
    subject: "Mathematics",
    progress: 65,
    description: "Complete exercises 1-20 on quadratic equations"
  },
  {
    id: "2", 
    title: "Physics - Wave Motion",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    score: 92,
    subject: "Physics",
    progress: 100,
    description: "Lab report on wave motion experiments"
  },
  {
    id: "3",
    title: "Chemistry - Organic Compounds", 
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "overdue",
    score: null,
    subject: "Chemistry",
    progress: 40,
    description: "Study organic compound structures and reactions"
  },
  {
    id: "4",
    title: "English Literature - Poetry Analysis",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "not_started",
    score: null,
    subject: "English",
    progress: 0,
    description: "Analyze themes in modern poetry collection"
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    let homework = mockHomeworkData

    // Filter by status if provided
    if (status && status !== 'all') {
      homework = homework.filter(hw => hw.status === status)
    }

    // Apply limit
    homework = homework.slice(0, limit)

    // In a real app, you would fetch from database:
    // const homework = await homeworkService.getStudentHomework(session.user.id, { limit, status })

    return NextResponse.json({ 
      homework,
      total: mockHomeworkData.length,
      user: {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role
      }
    })
  } catch (error) {
    console.error("Error fetching homework:", error)
    return NextResponse.json({ error: "Failed to fetch homework" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { homeworkId, progress, status } = body

    // In a real app, you would update the homework in database
    // await homeworkService.updateHomeworkProgress(session.user.id, homeworkId, progress, status)

    return NextResponse.json({ 
      success: true,
      message: "Homework updated successfully"
    })
  } catch (error) {
    console.error("Error updating homework:", error)
    return NextResponse.json({ error: "Failed to update homework" }, { status: 500 })
  }
}
