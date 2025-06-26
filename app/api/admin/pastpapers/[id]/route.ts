import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET: Fetch a single past paper by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const { id } = params
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid past paper ID' },
        { status: 400 }
      )
    }
    
    // Find past paper
    const pastPaper = await db.collection('pastpapers').findOne({ _id: new ObjectId(id) })
    
    if (!pastPaper) {
      return NextResponse.json(
        { success: false, error: 'Past paper not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      pastPaper: {
        ...pastPaper,
        id: pastPaper._id.toString(),
        _id: pastPaper._id.toString()
      }
    })
    
  } catch (error) {
    console.error('Error fetching past paper:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch past paper' },
      { status: 500 }
    )
  }
}

// PUT: Update a past paper
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const { id } = params
    const body = await request.json()
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid past paper ID' },
        { status: 400 }
      )
    }
    
    // Validate required fields
    const { paperName, board, year, subject, program, papers, status } = body
    
    if (!paperName || !board || !year || !subject || !program || !papers || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate papers array
    if (!Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one paper is required' },
        { status: 400 }
      )
    }
    
    // Validate each paper has required fields
    for (const paper of papers) {
      if (!paper.name || !paper.questionPaperUrl || !paper.markSchemeUrl) {
        return NextResponse.json(
          { success: false, error: 'Each paper must have name, question paper URL, and mark scheme URL' },
          { status: 400 }
        )
      }
    }
    
    // Update past paper
    const updateData = {
      paperName,
      board,
      year: parseInt(year),
      subject,
      program,
      papers,
      status,
      updatedAt: new Date().toISOString()
    }
    
    const result = await db.collection('pastpapers').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Past paper not found' },
        { status: 404 }
      )
    }
    
    // Fetch updated document
    const updatedPaper = await db.collection('pastpapers').findOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({
      success: true,
      pastPaper: {
        ...updatedPaper,
        id: updatedPaper._id.toString(),
        _id: updatedPaper._id.toString()
      }
    })
    
  } catch (error) {
    console.error('Error updating past paper:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update past paper' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a past paper
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const { id } = params
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid past paper ID' },
        { status: 400 }
      )
    }
    
    // Delete past paper
    const result = await db.collection('pastpapers').deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Past paper not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Past paper deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting past paper:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete past paper' },
      { status: 500 }
    )
  }
} 