import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET: Fetch all past papers with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const subject = searchParams.get('subject') || 'all'
    const board = searchParams.get('board') || 'all'
    const year = searchParams.get('year') || 'all'
    const status = searchParams.get('status') || 'all'
    
    // Build filter query
    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { paperName: { $regex: search, $options: 'i' } },
        { board: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (subject !== 'all') filter.subject = subject
    if (board !== 'all') filter.board = board
    if (year !== 'all') filter.year = parseInt(year)
    if (status !== 'all') filter.status = status
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Fetch past papers
    const pastPapers = await db.collection('pastpapers')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    // Get total count
    const total = await db.collection('pastpapers').countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    
    // Transform data for frontend
    const transformedPapers = pastPapers.map(paper => ({
      ...paper,
      id: paper._id.toString(),
      _id: paper._id.toString()
    }))
    
    return NextResponse.json({
      success: true,
      pastPapers: transformedPapers,
      total,
      totalPages,
      currentPage: page
    })
    
  } catch (error) {
    console.error('Error fetching past papers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch past papers' },
      { status: 500 }
    )
  }
}

// POST: Create a new past paper
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const body = await request.json()
    
    // Validate required fields
    const { paperName, board, year, subject, program, status } = body
    
    if (!paperName || !board || !year || !subject || !program || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Papers array is optional - can be empty for new containers
    const papers = body.papers || []
    
    // If papers are provided, validate each paper has required fields and initialize questions array
    if (Array.isArray(papers) && papers.length > 0) {
      for (const paper of papers) {
        if (!paper.name || !paper.questionPaperUrl || !paper.markSchemeUrl) {
          return NextResponse.json(
            { success: false, error: 'Each paper must have name, question paper URL, and mark scheme URL' },
            { status: 400 }
          )
        }
        // Initialize questions array for each paper
        paper.questions = paper.questions || []
      }
    }
    
    // Create new past paper document
    const newPastPaper = {
      paperName,
      board,
      year: parseInt(year),
      subject,
      program,
      papers,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Insert into database
    const result = await db.collection('pastpapers').insertOne(newPastPaper)
    
    // Return created document
    const createdPaper = await db.collection('pastpapers').findOne({ _id: result.insertedId })
    
    if (!createdPaper) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch created past paper' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      pastPaper: {
        ...createdPaper,
        id: createdPaper._id.toString(),
        _id: createdPaper._id.toString()
      }
    })
    
  } catch (error) {
    console.error('Error creating past paper:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create past paper' },
      { status: 500 }
    )
  }
}

// DELETE: Delete all past papers (for testing/admin purposes)
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Delete all past papers
    const result = await db.collection('pastpapers').deleteMany({})
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} past papers`
    })
    
  } catch (error) {
    console.error('Error deleting past papers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete past papers' },
      { status: 500 }
    )
  }
} 