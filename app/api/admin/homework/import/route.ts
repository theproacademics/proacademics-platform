import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { HomeworkAssignment, HomeworkQuestion } from "@/models/schemas"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: "CSV file must contain at least a header row and one data row" },
        { status: 400 }
      )
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const dataRows = lines.slice(1)

    // Expected CSV structure:
    // Subject,Program,Homework Name,Date Assigned,Teacher,Date Due,Est.Time,XP Awarded,Question,Question ID,Topic,Subtopic,Level,Question,Mark Scheme,Image
    const requiredHeaders = [
      'Subject', 'Program', 'Homework Name', 'Date Assigned', 'Teacher', 
      'Date Due', 'Est.Time', 'XP Awarded', 'Question ID', 'Topic', 
      'Subtopic', 'Level', 'Question', 'Mark Scheme', 'Image'
    ]

    const missingHeaders = requiredHeaders.filter(header => 
      !headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
    )

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required columns: ${missingHeaders.join(', ')}`,
          expectedHeaders: requiredHeaders,
          foundHeaders: headers
        },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection<HomeworkAssignment>("homework")

    const homeworkMap = new Map<string, any>()
    let validRows = 0
    let invalidRows: string[] = []

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
      
      if (row.length !== headers.length) {
        invalidRows.push(`Row ${i + 2}: Column count mismatch`)
        continue
      }

      const rowData: any = {}
      headers.forEach((header, index) => {
        rowData[header.toLowerCase().replace(/[\s.]/g, '_')] = row[index]
      })

      try {
        const homeworkKey = `${rowData.subject}_${rowData.program}_${rowData.homework_name}`
        
        // Create question object
        const question: Omit<HomeworkQuestion, "_id" | "createdAt" | "updatedAt"> = {
          questionId: rowData.question_id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          topic: rowData.topic,
          subtopic: rowData.subtopic,
          level: rowData.level?.toLowerCase() === 'easy' ? 'easy' : 
                 rowData.level?.toLowerCase() === 'medium' ? 'medium' : 'hard',
          question: rowData.question,
          markScheme: rowData.mark_scheme,
          image: rowData.image === 'n' ? undefined : rowData.image
        }

        if (!homeworkMap.has(homeworkKey)) {
          homeworkMap.set(homeworkKey, {
            homeworkName: rowData.homework_name,
            subject: rowData.subject,
            program: rowData.program,
            topic: rowData.topic,
            subtopic: rowData.subtopic,
            level: question.level,
            teacher: rowData.teacher,
            dateAssigned: new Date(rowData.date_assigned),
            dueDate: new Date(rowData.date_due),
            estimatedTime: parseInt(rowData['est_time']) || 30,
            xpAwarded: parseInt(rowData.xp_awarded) || 100,
            questionSet: [],
            status: 'draft'
          })
        }

        homeworkMap.get(homeworkKey).questionSet.push(question)
        validRows++
      } catch (error) {
        invalidRows.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Invalid data format'}`)
      }
    }

    const homeworkToInsert = Array.from(homeworkMap.values()).map(homework => ({
      assignmentId: `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...homework,
      totalQuestions: homework.questionSet.length,
      completedQuestions: 0,
      completionStatus: "not_started",
      xpEarned: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    let insertedCount = 0
    if (homeworkToInsert.length > 0) {
      const result = await collection.insertMany(homeworkToInsert)
      insertedCount = result.insertedCount
    }

    return NextResponse.json({
      success: true,
      data: {
        insertedCount,
        validRows,
        invalidRows,
        totalHomework: homeworkToInsert.length,
        details: invalidRows.length > 0 ? { invalidRows } : undefined
      }
    })
  } catch (error) {
    console.error("Error importing homework:", error)
    return NextResponse.json(
      { success: false, error: "Failed to import homework" },
      { status: 500 }
    )
  }
}
