"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from './button'
import { Loader2, Video, AlertCircle, ExternalLink } from 'lucide-react'

declare global {
  interface Window {
    ZoomMtg: any
  }
}

interface ZoomMeetingProps {
  zoomLink: string
  userName?: string
  onJoinSuccess?: () => void
  onJoinError?: (error: string) => void
  className?: string
}

export function ZoomMeeting({ 
  zoomLink, 
  userName = 'Student', 
  onJoinSuccess, 
  onJoinError,
  className = ''
}: ZoomMeetingProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isJoined, setIsJoined] = useState(false)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load Zoom SDK
  useEffect(() => {
    const loadZoomSDK = async () => {
      try {
        // Load Zoom SDK script
        if (!document.getElementById('zoom-sdk')) {
          const script = document.createElement('script')
          script.id = 'zoom-sdk'
          script.src = 'https://source.zoom.us/3.13.2/lib/vendor/react.min.js'
          document.head.appendChild(script)
          
          const script2 = document.createElement('script')
          script2.src = 'https://source.zoom.us/3.13.2/lib/vendor/react-dom.min.js'
          document.head.appendChild(script2)
          
          const script3 = document.createElement('script')
          script3.src = 'https://source.zoom.us/3.13.2/lib/vendor/redux.min.js'
          document.head.appendChild(script3)
          
          const script4 = document.createElement('script')
          script4.src = 'https://source.zoom.us/3.13.2/lib/vendor/lodash.min.js'
          document.head.appendChild(script4)
          
          const mainScript = document.createElement('script')
          mainScript.src = 'https://source.zoom.us/3.13.2/lib/ZoomMtg-3.13.2.min.js'
          mainScript.onload = () => {
            if (window.ZoomMtg) {
              window.ZoomMtg.preLoadWasm()
              window.ZoomMtg.prepareWebSDK()
              setSdkLoaded(true)
            }
          }
          document.head.appendChild(mainScript)
        } else if (window.ZoomMtg) {
          setSdkLoaded(true)
        }
      } catch (error) {
        console.error('Failed to load Zoom SDK:', error)
        setError('Failed to load Zoom SDK')
      }
    }

    loadZoomSDK()
  }, [])

  const extractMeetingInfo = (zoomUrl: string) => {
    // Extract meeting ID and password from various Zoom URL formats
    const meetingIdPatterns = [
      /\/j\/(\d+)/,  // https://zoom.us/j/123456789
      /\/webinar\/(\d+)/, // webinar format
      /meeting_id=(\d+)/, // query parameter format
      /\/(\d{9,11})(?:\?|$)/, // direct meeting ID in path
    ]
    
    let meetingId = ''
    for (const pattern of meetingIdPatterns) {
      const match = zoomUrl.match(pattern)
      if (match) {
        meetingId = match[1]
        break
      }
    }
    
    // Extract password if present
    const passwordMatch = zoomUrl.match(/[?&]pwd=([^&]+)/)
    const password = passwordMatch ? passwordMatch[1] : ''
    
    return { meetingId, password }
  }

  const joinMeeting = async () => {
    if (!sdkLoaded || !window.ZoomMtg) {
      setError('Zoom SDK not loaded')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { meetingId, password } = extractMeetingInfo(zoomLink)
      
      if (!meetingId) {
        throw new Error('Invalid Zoom meeting URL')
      }

      // Get JWT signature from our API
      const response = await fetch('/api/zoom/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoomUrl: zoomLink, role: 0 })
      })

      if (!response.ok) {
        throw new Error('Failed to get meeting signature')
      }

      const { signature, apiKey } = await response.json()

      // Initialize Zoom Meeting SDK
      window.ZoomMtg.init({
        leaveUrl: window.location.origin + window.location.pathname,
        success: (success: any) => {
          console.log('Zoom init success:', success)
          
          // Join the meeting
          window.ZoomMtg.join({
            signature: signature,
            apiKey: apiKey,
            meetingNumber: meetingId,
            passWord: password,
            userName: userName,
            userEmail: '',
            success: (result: any) => {
              console.log('Zoom join success:', result)
              setIsJoined(true)
              setIsLoading(false)
              onJoinSuccess?.()
            },
            error: (error: any) => {
              console.error('Zoom join error:', error)
              setError('Failed to join meeting: ' + error.errorMessage)
              setIsLoading(false)
              onJoinError?.(error.errorMessage)
            }
          })
        },
        error: (error: any) => {
          console.error('Zoom init error:', error)
          setError('Failed to initialize Zoom: ' + error.errorMessage)
          setIsLoading(false)
          onJoinError?.(error.errorMessage)
        }
      })
    } catch (error: any) {
      console.error('Error joining meeting:', error)
      setError(error.message)
      setIsLoading(false)
      onJoinError?.(error.message)
    }
  }

  const fallbackToExternal = () => {
    window.open(zoomLink, '_blank')
  }

  if (isJoined) {
    return (
      <div className={`w-full h-full ${className}`}>
        <div id="zmmtg-root" className="w-full h-full min-h-[600px]"></div>
      </div>
    )
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-200 text-sm font-medium">Meeting Error</p>
            <p className="text-red-300 text-xs mt-1">{error}</p>
          </div>
          <Button
            onClick={fallbackToExternal}
            variant="outline"
            size="sm"
            className="border-red-400/30 text-red-200 hover:bg-red-500/10"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open in Zoom
          </Button>
        </div>
      )}

      <div className="text-center space-y-4">
        <div className="w-full aspect-video bg-gradient-to-br from-slate-900/70 via-purple-900/30 to-slate-900/70 rounded-xl flex items-center justify-center relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(139,92,246,0.4) 2px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative z-10 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
              <Video className="w-16 h-16 text-blue-300 mx-auto relative" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Ready to Join Live Session</h3>
              <p className="text-gray-300 text-sm">Click below to join the Zoom meeting directly in your browser</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={joinMeeting}
                disabled={isLoading || !sdkLoaded}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining Meeting...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting Here
                  </>
                )}
              </Button>
              
              <Button
                onClick={fallbackToExternal}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 py-3 px-6 rounded-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Zoom App
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Zoom SDK container - hidden until meeting starts */}
      <div id="zmmtg-root" className="hidden"></div>
    </div>
  )
} 