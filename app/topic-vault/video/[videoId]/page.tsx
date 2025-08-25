"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BookOpen, Video, User, Clock, ArrowLeft, Play, ExternalLink, Target, ChevronRight, GraduationCap, Lock, AlignLeft } from "lucide-react"
import Particles from "@/components/ui/particles"

interface SubtopicVideo {
  id: string
  videoName: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description: string
  zoomLink?: string
  videoEmbedLink: string
  status: 'draft' | 'active'
  topicName: string
  subject: string
}

// Helper function to check if URL is a YouTube/streaming URL
const isStreamingUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
}

const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url)
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Lesson': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'Tutorial': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'Workshop': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

const subjectColors = {
  Mathematics: "from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-200",
  Physics: "from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200",
  Chemistry: "from-purple-500/20 to-violet-500/20 border-purple-400/30 text-purple-200",
  Biology: "from-orange-500/20 to-amber-500/20 border-orange-400/30 text-orange-200",
  "Computer Science": "from-indigo-500/20 to-blue-500/20 border-indigo-400/30 text-indigo-200",
  English: "from-pink-500/20 to-rose-500/20 border-pink-400/30 text-pink-200",
}

export default function TopicVideoPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.videoId as string

  const [video, setVideo] = useState<SubtopicVideo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataReady, setDataReady] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [allVideos, setAllVideos] = useState<SubtopicVideo[]>([])
  const [nextVideo, setNextVideo] = useState<SubtopicVideo | null>(null)

  const { showPreloader, mounted: preloaderMounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  // Handle watch now button click
  const handleWatchNow = async () => {
    // Show the actual video player
    setShowVideoPlayer(true)
  }

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching video with ID:', videoId)
        
        // Fetch all topics to find the video
        const response = await fetch('/api/admin/topic-vault?limit=1000&status=active')
        console.log('API Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Response error:', errorText)
          
          // If it's a redirect to auth, show a more helpful message
          if (response.status === 307 || errorText.includes('signin')) {
            throw new Error('Authentication required. Please log in to access videos.')
          }
          
          throw new Error(`Failed to fetch topics: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('API Response data:', data)
        
        // Check if we have topics data (API doesn't return success field)
        if (!data.topics || !Array.isArray(data.topics)) {
          console.error('API returned invalid data:', data)
          throw new Error(data.error || 'Invalid data format received from server')
        }
        
        const allTopics = data.topics
        console.log('Found topics:', allTopics.length)
        
        // If no topics found, provide a helpful message
        if (allTopics.length === 0) {
          throw new Error('No topics found in the database. Please contact your administrator.')
        }
        
        // Find the video in all topics and collect all videos from same topic
        let foundVideo: SubtopicVideo | null = null
        let searchDetails: any[] = []
        let totalSubtopics = 0
        let videoTopic: any = null
        let allTopicVideos: SubtopicVideo[] = []
        
        for (const topic of allTopics) {
          if (topic.subtopics && Array.isArray(topic.subtopics)) {
            // Check ALL subtopics, not just active ones for debugging
            const allSubtopics = topic.subtopics
            const activeSubtopics = topic.subtopics.filter((s: any) => s.status === 'active')
            totalSubtopics += activeSubtopics.length
            
            searchDetails.push({
              topicName: topic.topicName,
              subject: topic.subject,
              program: topic.program,
              subtopicCount: activeSubtopics.length,
              totalSubtopics: allSubtopics.length,
              subtopicIds: allSubtopics.map((s: any) => ({id: s.id, status: s.status})),
              subtopicNames: allSubtopics.map((s: any) => s.videoName)
            })
            
            // First try to find active subtopic
            let subtopic = activeSubtopics.find((s: any) => s.id === videoId)
            
            // If not found in active, try in all subtopics for debugging
            if (!subtopic) {
              subtopic = allSubtopics.find((s: any) => s.id === videoId)
              if (subtopic) {
                console.log('Found video but with status:', subtopic.status)
              }
            }
            
            if (subtopic) {
              foundVideo = {
                ...subtopic,
                topicName: topic.topicName,
                subject: topic.subject
              }
              videoTopic = topic
              
              // Collect all active videos from this topic
              allTopicVideos = activeSubtopics.map((s: any) => ({
                ...s,
                topicName: topic.topicName,
                subject: topic.subject
              }))
              
              console.log('Found video:', foundVideo)
              console.log('All videos in topic:', allTopicVideos.length)
              break
            }
          }
        }
        
        // Find next video
        if (foundVideo && allTopicVideos.length > 1) {
          const currentIndex = allTopicVideos.findIndex(v => v.id === videoId)
          const nextIndex = (currentIndex + 1) % allTopicVideos.length
          const nextVid = allTopicVideos[nextIndex]
          
          if (nextVid && nextVid.id !== videoId) {
            setNextVideo(nextVid)
            console.log('Next video:', nextVid.videoName)
          }
        }
        
        setAllVideos(allTopicVideos)
        
        console.log('Search details:', searchDetails)
        console.log('Total active subtopics found:', totalSubtopics)
        console.log('Looking for video ID:', videoId)
        
        if (!foundVideo) {
          const availableIds = searchDetails.flatMap(d => d.subtopicIds)
          console.error('Video not found. Available IDs:', availableIds)
          
          if (totalSubtopics === 0) {
            throw new Error('No videos are currently available. Please contact your administrator.')
          } else {
            // Provide a more helpful error with available videos
            const firstFewVideos = searchDetails
              .flatMap(d => d.subtopicNames)
              .slice(0, 3)
              .join(', ')
            
            throw new Error(`Video with ID "${videoId}" not found. ${totalSubtopics} video${totalSubtopics !== 1 ? 's' : ''} available including: ${firstFewVideos}${totalSubtopics > 3 ? '...' : ''}`)
          }
        }
        
        setVideo(foundVideo)
        // Auto-unlock the video like in lesson page
        setShowVideoPlayer(true)
        setDataReady(true)
        
      } catch (error) {
        console.error('Error fetching video:', error)
        setError(error instanceof Error ? error.message : 'Failed to load video')
        setDataReady(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (videoId) {
      fetchVideo()
    }
  }, [videoId])



  const handleBack = () => {
    router.back()
  }

  if (showPreloader || !preloaderMounted || isLoading) {
    return <Preloader isVisible={showPreloader || !preloaderMounted || isLoading} colorScheme="purple" loadingText="Loading video..." />
  }

  if (error || !video) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background for error page */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-tr from-purple-800/30 via-transparent to-blue-800/30 pointer-events-none" />
        
        <Navigation />
        <main className="lg:ml-72 min-h-screen relative z-10">
          <ResponsiveContainer padding="lg">
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-4">Video Not Found</h1>
              <p className="text-gray-400 mb-8">{error || 'The video you\'re looking for doesn\'t exist or has been removed.'}</p>
              <Button onClick={handleBack} className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Topic Vault
              </Button>
            </div>
          </ResponsiveContainer>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Dark Background with Purple/Blue Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/60 to-slate-900 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-tr from-purple-900/30 via-transparent to-blue-900/30 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.3),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Floating 3D elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-32 left-16 w-40 h-40 border border-purple-400/40 rounded-full animate-pulse shadow-2xl shadow-purple-500/20"></div>
        <div className="absolute top-60 right-32 w-28 h-28 border border-blue-400/40 rotate-45 animate-pulse delay-1000 shadow-xl shadow-blue-500/20"></div>
        <div className="absolute bottom-60 left-1/3 w-24 h-24 border border-indigo-400/40 rounded-lg animate-pulse delay-2000 shadow-lg shadow-indigo-500/20"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-violet-400/40 rounded-full animate-pulse delay-3000"></div>
      </div>
      
      {/* Premium Purple Particles */}
      <Particles
        className="fixed inset-0 pointer-events-none"
        quantity={50}
        ease={80}
        color="#a855f7"
        size={0.8}
        staticity={60}
      />

      {/* Blue accent particles */}
      <Particles
        className="fixed inset-0 pointer-events-none"
        quantity={70}
        ease={60}
        color="#3b82f6"
        size={0.4}
        staticity={40}
      />

      {/* Modern geometric grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <svg 
          className="absolute inset-0 w-full h-full" 
          width="100%" 
          height="100%" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern 
              id="video-grid" 
              width="80" 
              height="80" 
              patternUnits="userSpaceOnUse"
            >
              <path 
                d="M 80 0 L 0 0 0 80" 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="1"
                opacity="0.6"
              />
              <circle cx="40" cy="40" r="2" fill="#3b82f6" opacity="0.4"/>
            </pattern>
          </defs>
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#video-grid)" 
          />
        </svg>
      </div>

      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="space-y-6 pb-16 pt-8">
            {/* Back to Topic Vault Button - Outside Card */}
            <div className="pb-6">
              <Button 
                variant="ghost" 
                className="text-white hover:text-purple-300 group rounded-full px-6 py-3 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Topic Vault</span>
              </Button>
            </div>

            {/* Video Card */}
            <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group">
              {/* Enhanced card background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-purple-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse opacity-30" />
              
              <CardContent className="relative z-10">
                {/* Video Player Section */}
                <div className="space-y-8" style={{paddingTop: '10px'}}>

                  {/* Video Player */}
                  <div>
                    
                    <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden relative transition-all duration-300">
                      {video.videoEmbedLink ? (
                        <>
                          {/* Show video player or click-to-play overlay */}
                          {showVideoPlayer ? (
                            // Actual Video Player
                            <>
                              {isStreamingUrl(video.videoEmbedLink) && getYouTubeVideoId(video.videoEmbedLink) ? (
                                // Handle YouTube URLs
                                <iframe
                                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.videoEmbedLink)}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=1&cc_load_policy=0&disablekb=0&autohide=1&color=white&controls=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                                                                     title={video.videoName || 'Video'}
                                   className="w-full h-full"
                                   allowFullScreen
                                   frameBorder="0"
                                   sandbox="allow-same-origin allow-scripts allow-presentation"
                                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                 />
                              ) : (
                                                                 // Handle direct video files
                                 <video
                                   src={video.videoEmbedLink}
                                   controls
                                   className="w-full h-full"
                                   poster="/video-placeholder.jpg"
                                 />
                              )}
                            </>
                          ) : (
                            // Click-to-Play Overlay with Lock
                            <div className="w-full h-full relative cursor-pointer group" onClick={handleWatchNow}>
                              {/* Video Thumbnail with Heavy Blur */}
                              {isStreamingUrl(video.videoEmbedLink) && getYouTubeThumbnail(video.videoEmbedLink) ? (
                                <img 
                                  src={getYouTubeThumbnail(video.videoEmbedLink)!}
                                  alt={video.videoName || 'Video Thumbnail'}
                                  className="w-full h-full object-cover blur-lg group-hover:blur-md transition-all duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-900/70 via-purple-900/30 to-slate-900/70 flex items-center justify-center blur-sm group-hover:blur-none transition-all duration-500">
                                  <Video className="w-16 h-16 text-purple-300" />
                                </div>
                              )}
                              
                              {/* Heavy dark overlay */}
                              <div className="absolute inset-0 bg-black/70 group-hover:bg-black/60 transition-all duration-500"></div>
                              
                              {/* Centered Lock Icon */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-6">
                                  <div className="bg-white/10 border border-white/30 rounded-full p-4 shadow-2xl group-hover:bg-white/20 transition-all duration-300">
                                    <Lock className="w-8 h-8 text-white" />
                                  </div>
                                  
                                  {/* Watch Now Button - Badge Style */}
                                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-400/30 hover:border-blue-400/50 flex items-center gap-2 text-sm">
                                    <Play className="w-4 h-4 text-white" fill="currentColor" />
                                    <span>Watch Now</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900/70 via-purple-900/30 to-slate-900/70 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20">
                            <div className="w-full h-full" style={{
                              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139,92,246,0.3) 1px, transparent 0)',
                              backgroundSize: '30px 30px'
                            }}></div>
                          </div>
                          <div className="text-center relative z-10">
                            <div className="relative">
                              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse"></div>
                              <Video className="w-16 h-16 text-purple-300 mx-auto mb-4 relative" />
                            </div>
                            <p className="text-gray-300 text-base font-medium">Video content available soon</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Separator Line */}
                    <div className="border-t border-white/20 my-8 relative">
                      <div className="absolute inset-0 border-t border-purple-400/20"></div>
                    </div>

                    {/* Video Details - Below video */}
                    <div className="space-y-4">
                      {/* Video Title */}
                      <h1 className="text-white text-2xl lg:text-3xl font-bold">{video.videoName}</h1>
                      
                      {/* Video Tags */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {video.topicName && (
                          <span className={`inline-flex items-center bg-gradient-to-r ${subjectColors[video.subject as keyof typeof subjectColors] || 'from-gray-500/20 to-gray-600/20 border-gray-400/30 text-gray-300'} px-3 py-2 text-sm font-bold border rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}>
                            {video.topicName}
                          </span>
                        )}
                        {video.type && (
                          <span className="inline-flex items-center bg-gradient-to-r from-purple-500/25 to-indigo-500/25 border-purple-400/40 text-purple-100 gap-2 px-3 py-2 text-sm font-bold border rounded-lg shadow-sm hover:from-purple-500/35 hover:to-indigo-500/35 transition-all duration-200">
                            {video.type === 'Lesson' && <GraduationCap className="w-4 h-4" />}
                            {video.type === 'Tutorial' && <Video className="w-4 h-4" />}
                            {video.type === 'Workshop' && <ExternalLink className="w-4 h-4" />}
                            {video.type}
                          </span>
                        )}
                      </div>

                      {/* Video Info Pills */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {video.duration && (
                          <div className="flex items-center bg-amber-500/15 px-3 py-2 rounded-lg border border-amber-400/25">
                            <Clock className="w-4 h-4 mr-2 text-amber-400" />
                            <span className="text-amber-200 font-medium">{video.duration}</span>
                          </div>
                        )}
                        {video.teacher && (
                          <div className="flex items-center bg-blue-500/15 px-3 py-2 rounded-lg border border-blue-400/25">
                            <User className="w-4 h-4 mr-2 text-blue-400" />
                            <span className="text-blue-200 font-medium truncate max-w-[120px]">{video.teacher}</span>
                          </div>
                        )}
                        {video.subject && (
                          <div className="flex items-center bg-emerald-500/15 px-3 py-2 rounded-lg border border-emerald-400/25">
                            <BookOpen className="w-4 h-4 mr-2 text-emerald-400" />
                            <span className="text-emerald-200 font-medium">{video.subject}</span>
                          </div>
                        )}
                      </div>

                      {/* Video Description - Matching Other Badges */}
                      {video.description && (
                        <div className="flex items-center bg-cyan-500/15 px-3 py-2 rounded-lg border border-cyan-400/25">
                          <AlignLeft className="w-4 h-4 mr-2 text-cyan-400" />
                          <span className="text-cyan-200 font-medium">
                            {video.description.length > 80 
                              ? video.description.substring(0, 80) + '...' 
                              : video.description
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                                    {/* Live Session Button */}
                  {video?.zoomLink && (
                    <div className="flex justify-center mt-6">
                      <Button 
                        onClick={() => {
                          if (video?.zoomLink) {
                            window.open(video.zoomLink, '_blank')
                          }
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-green-400/30"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Join Live Session
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons Section */}
                  <div className="border-t border-white/10 pt-8 mt-8 relative">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl blur-3xl"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      {/* Work with Lex Button - Enhanced */}
                      <div className="group relative">
                        {/* Button glow background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                        
                        <Button
                          onClick={() => {
                            router.push(`/lex?topic=${encodeURIComponent(video.topicName || '')}&subject=${encodeURIComponent(video.subject || '')}`)
                          }}
                          className="relative w-full h-auto p-0 bg-transparent border-0 hover:bg-transparent"
                        >
                          <div className="w-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 hover:from-purple-400 hover:via-violet-400 hover:to-indigo-500 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 border border-purple-400/30 hover:border-purple-300/50 backdrop-blur-sm relative overflow-hidden group">
                            {/* Animated background patterns */}
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                              <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>
                            </div>
                            
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                            
                            <div className="relative flex items-center gap-4">
                              {/* Enhanced Icon */}
                              <div className="relative">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-white/30">
                                  <Target className="w-7 h-7 text-white drop-shadow-lg" />
                                </div>
                                {/* Icon glow */}
                                <div className="absolute inset-0 w-14 h-14 bg-purple-300/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                              
                              {/* Enhanced Text */}
                              <div className="text-left flex-1">
                                <div className="text-lg font-bold text-white mb-1 group-hover:text-purple-100 transition-colors">
                                  Work with Lex
                                </div>
                                <div className="text-sm text-purple-100/80 font-medium">
                                  🤖 AI tutor for this topic
                                </div>
                              </div>
                              
                              {/* Enhanced Arrow */}
                              <div className="relative">
                                <ChevronRight className="w-6 h-6 text-white/80 group-hover:translate-x-2 group-hover:text-white transition-all duration-300" />
                                <div className="absolute inset-0 w-6 h-6 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                            </div>
                          </div>
                        </Button>
                      </div>

                      {/* Next Video Button - Enhanced */}
                      {nextVideo ? (
                        <div className="group relative">
                          {/* Button glow background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                          
                          <Button
                            onClick={() => {
                              router.push(`/topic-vault/video/${nextVideo.id}`)
                            }}
                            className="relative w-full h-auto p-0 bg-transparent border-0 hover:bg-transparent"
                          >
                            <div className="w-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 hover:from-blue-400 hover:via-cyan-400 hover:to-teal-500 rounded-2xl p-6 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border border-blue-400/30 hover:border-blue-300/50 backdrop-blur-sm relative overflow-hidden group">
                              {/* Animated background patterns */}
                              <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse delay-500"></div>
                                <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-xl animate-pulse delay-1500"></div>
                              </div>
                              
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                              
                              <div className="relative flex items-center gap-4">
                                {/* Enhanced Icon */}
                                <div className="relative">
                                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 border border-white/30">
                                    <Play className="w-7 h-7 text-white drop-shadow-lg ml-1" />
                                  </div>
                                  {/* Icon glow */}
                                  <div className="absolute inset-0 w-14 h-14 bg-blue-300/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                
                                {/* Enhanced Text */}
                                <div className="text-left flex-1 min-w-0">
                                  <div className="text-lg font-bold text-white mb-1 group-hover:text-blue-100 transition-colors">
                                    Next Video
                                  </div>
                                  <div className="text-sm text-blue-100/80 font-medium truncate">
                                    🎬 {nextVideo.videoName}
                                  </div>
                                </div>
                                
                                {/* Enhanced Arrow */}
                                <div className="relative flex-shrink-0">
                                  <ChevronRight className="w-6 h-6 text-white/80 group-hover:translate-x-2 group-hover:text-white transition-all duration-300" />
                                  <div className="absolute inset-0 w-6 h-6 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                              </div>
                            </div>
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 shadow-xl border border-slate-600/30 backdrop-blur-sm relative overflow-hidden">
                            {/* Subtle pattern for disabled state */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute top-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
                            </div>
                            
                            <div className="relative flex items-center gap-4">
                              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                                <Play className="w-7 h-7 text-slate-400" />
                              </div>
                              
                              <div className="text-left flex-1">
                                <div className="text-lg font-bold text-slate-300 mb-1">
                                  No More Videos
                                </div>
                                <div className="text-sm text-slate-400 font-medium">
                                  🏁 You've reached the end
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Progress Info */}
                    {allVideos.length > 1 && (
                      <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <p className="text-sm text-slate-300 font-medium">
                            Video {allVideos.findIndex(v => v.id === videoId) + 1} of {allVideos.length} in this topic
                          </p>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 