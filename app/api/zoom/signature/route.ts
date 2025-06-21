import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// You'll need to add these to your environment variables
const ZOOM_API_KEY = process.env.ZOOM_API_KEY
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET

function generateZoomSignature(meetingNumber: string, role: number = 0): string {
  if (!ZOOM_API_KEY || !ZOOM_API_SECRET) {
    throw new Error('Zoom API credentials not configured')
  }

  const timestamp = new Date().getTime() - 30000
  const msg = Buffer.from(ZOOM_API_KEY + meetingNumber + timestamp + role).toString('base64')
  const hash = crypto.createHmac('sha256', ZOOM_API_SECRET).update(msg).digest('base64')
  const signature = Buffer.from(`${ZOOM_API_KEY}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64')
  
  return signature
}

function extractMeetingId(zoomUrl: string): string | null {
  // Handle various Zoom URL formats
  const patterns = [
    /\/j\/(\d+)/,  // https://zoom.us/j/123456789
    /\/webinar\/(\d+)/, // webinar format
    /meeting_id=(\d+)/, // query parameter format
    /\/(\d{9,11})(?:\?|$)/, // direct meeting ID in path
  ]
  
  for (const pattern of patterns) {
    const match = zoomUrl.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { zoomUrl, role = 0 } = await request.json()
    
    if (!zoomUrl) {
      return NextResponse.json(
        { error: 'Zoom URL is required' },
        { status: 400 }
      )
    }

    const meetingId = extractMeetingId(zoomUrl)
    
    if (!meetingId) {
      return NextResponse.json(
        { error: 'Invalid Zoom URL format' },
        { status: 400 }
      )
    }

    const signature = generateZoomSignature(meetingId, role)
    
    return NextResponse.json({
      signature,
      meetingNumber: meetingId,
      apiKey: ZOOM_API_KEY,
      role,
    })
  } catch (error: any) {
    console.error('Error generating Zoom signature:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    )
  }
} 