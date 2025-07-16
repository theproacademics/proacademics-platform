"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Video, 
  Play, 
  Clock, 
  User, 
  Search, 
  Filter, 
  BookOpen, 
  ExternalLink, 
  ChevronRight, 
  GraduationCap, 
  Star,
  Calculator,
  Atom,
  Dna,
  Globe,
  PenTool,
  Cpu,
  Languages,
  Music,
  Palette,
  Activity,
  ArrowLeft,
  ArrowRight
} from "lucide-react"

// Icon mapping for subjects
const getSubjectIcon = (subjectName: string) => {
  const name = subjectName.toLowerCase()
  if (name.includes('math')) return Calculator
  if (name.includes('physics')) return Atom
  if (name.includes('chemistry')) return Activity
  if (name.includes('biology')) return Dna
  if (name.includes('english') || name.includes('literature')) return PenTool
  if (name.includes('computer') || name.includes('science')) return Cpu
  if (name.includes('geography')) return Globe
  if (name.includes('history')) return BookOpen
  if (name.includes('language')) return Languages
  if (name.includes('art')) return Palette
  if (name.includes('music')) return Music
  return BookOpen // Default icon
}

// Types
interface SubtopicVault {
  id: string
  videoName: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description: string
  zoomLink?: string
  videoEmbedLink: string
  status: 'draft' | 'active'
}

interface Topic {
  id: string
  topicName: string
  subject: string
  program: string
  description?: string
  status: 'draft' | 'active'
  subtopics: SubtopicVault[]
  createdAt: string
  updatedAt: string
}

interface SubjectSummary {
  name: string
  color: string
  totalTopics: number
  totalVideos: number
  icon: any
}

export default function StudentTopicVaultPage() {
  // State management (same pattern as past papers)
  const [subjects, setSubjects] = useState<SubjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [view, setView] = useState<'subjects' | 'topic-content'>('subjects')
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dataReady, setDataReady] = useState(false)

  // Preloader hook (same as past papers)
  const { showPreloader, mounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  // Fetch subjects and calculate counts (same pattern as past papers)
  const fetchSubjects = async () => {
    try {
      setLoading(true)
      
      // Fetch all admin subjects first
      const subjectsResponse = await fetch('/api/admin/subjects')
      if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects')
      
      const subjectsData = await subjectsResponse.json()
      if (!subjectsData.success) throw new Error(subjectsData.error || 'Failed to fetch subjects')
      
      const adminSubjects = subjectsData.subjects || []
      
      // Fetch all topics to get counts
      const topicsResponse = await fetch('/api/admin/topic-vault?limit=1000&status=active')
      let allTopics: Topic[] = []
      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json()
        console.log('Topics API response:', topicsData)
        // API returns topics directly without success field
        if (topicsData.topics && Array.isArray(topicsData.topics)) {
          allTopics = topicsData.topics
          console.log('Found topics:', allTopics.length)
        }
      }
      
      // Create subject summaries for ALL admin subjects
      const subjectSummaries: SubjectSummary[] = adminSubjects
        .filter((subject: any) => subject.isActive)
        .map((subject: any) => {
          // Count topics and videos for this subject
          const subjectTopics = allTopics.filter(topic => topic.subject === subject.name)
          const totalVideos = subjectTopics.reduce((acc, topic) => 
            acc + (topic.subtopics?.filter(s => s.status === 'active').length || 0), 0
          )
          
          console.log(`Subject: ${subject.name}, Topics: ${subjectTopics.length}, Videos: ${totalVideos}`)
          
          return {
            name: subject.name,
            color: subject.color || '#3B82F6',
            totalTopics: subjectTopics.length,
            totalVideos: totalVideos,
            icon: getSubjectIcon(subject.name)
          }
        })
      
      setSubjects(subjectSummaries)
      
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
    } finally {
      setLoading(false)
      // Mark data as ready after a short delay to ensure UI is rendered
      setTimeout(() => setDataReady(true), 100)
    }
  }

  // Fetch topics for selected subject
  const fetchTopicsForSubject = async (subjectName: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/topic-vault?limit=1000&status=active&subject=${encodeURIComponent(subjectName)}`)
      if (response.ok) {
        const data = await response.json()
        setTopics(data.topics || [])
      }
    } catch (error) {
      console.error('Error fetching topics for subject:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleSubjectClick = (subjectName: string) => {
    setSelectedSubject(subjectName)
    setView('topic-content')
    fetchTopicsForSubject(subjectName)
  }

  const handleBackToSubjects = () => {
    setView('subjects')
    setSelectedSubject(null)
    setSelectedTopic("all")
    setSearchTerm("")
  }

  // Get filtered topics for the selected subject
  const filteredTopics = topics.filter(topic => {
    if (selectedTopic !== "all" && topic.id !== selectedTopic) return false
    return true
  })

  // Get all videos from filtered topics
  const allVideos = filteredTopics.flatMap(topic => 
    topic.subtopics
      ?.filter(subtopic => subtopic.status === 'active')
      ?.filter(subtopic => 
        searchTerm === "" || 
        subtopic.videoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subtopic.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.topicName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      ?.map(subtopic => ({ ...subtopic, topicName: topic.topicName, subject: topic.subject })) || []
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lesson': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Tutorial': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'Workshop': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const ensureUrlProtocol = (url: string): string => {
    if (!url) return url
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getVideoThumbnail = (videoUrl: string): string | null => {
    if (!videoUrl) return null
    const youtubeId = getYouTubeVideoId(videoUrl)
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    }
    return null
  }

  // Show preloader
  if (showPreloader || !mounted) {
    return <Preloader isVisible={showPreloader || !mounted} colorScheme="purple" loadingText="Loading topic vault..." />
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

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {view === 'topic-content' && (
                <Button
                  variant="ghost"
                  onClick={handleBackToSubjects}
                  className="mr-2 text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {view === 'subjects' && 'Topic Vault'}
                  {view === 'topic-content' && selectedSubject}
                </h1>
                <p className="text-slate-300 text-lg">
                  {view === 'subjects' && 'Choose from available academic subjects'}
                  {view === 'topic-content' && 'Explore topics and videos'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : view === 'subjects' ? (
            // Subjects Grid
            subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subjects.map((subject) => {
                  const IconComponent = subject.icon
                  return (
                    <div
                      key={subject.name}
                      onClick={() => handleSubjectClick(subject.name)}
                      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                    >
                      {/* Card Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-3xl transition-all duration-300 group-hover:from-white/[0.12] group-hover:to-white/[0.04]"></div>
                      <div className="absolute inset-0 border border-white/10 rounded-3xl transition-all duration-300 group-hover:border-white/20"></div>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-3xl blur-xl transition-all duration-300"
                        style={{ backgroundColor: `${subject.color}20` }}
                      ></div>
                      
                      {/* Card Content */}
                      <div className="relative p-6 h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="relative">
                            <div 
                              className="w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center border-2 border-white/20 transition-all duration-300 group-hover:scale-110"
                              style={{ backgroundColor: subject.color }}
                            >
                              <IconComponent className="w-8 h-8 text-white" />
                            </div>
                            <div 
                              className="absolute inset-0 w-16 h-16 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                              style={{ backgroundColor: subject.color }}
                            />
                          </div>
                          <Badge 
                            className="bg-white/10 text-white border border-white/20 px-3 py-1.5 text-sm font-medium rounded-full"
                          >
                            {subject.totalTopics}
                          </Badge>
                        </div>
                        
                        {/* Subject Info */}
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300 capitalize">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                            {subject.totalVideos > 0 
                              ? `${subject.totalVideos} video${subject.totalVideos !== 1 ? 's' : ''} available`
                              : 'Click to explore topics'
                            }
                          </p>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300 transition-colors">
                            <Video className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {subject.totalTopics} topic{subject.totalTopics !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-all duration-300">
                            <span className="text-sm font-medium">Explore</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No subjects available</h3>
                <p className="text-slate-400">Check back later for available subjects</p>
              </div>
            )
          ) : (
            // Topic Content View (when subject is selected)
            <div className="space-y-8">
              {/* Recommended Subtopic Videos - Moved to Top */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  Recommended Subtopic Videos
                </h2>
                
                {allVideos.slice(0, 3).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allVideos.slice(0, 3).map((video, index) => (
                      <Card 
                        key={video.id} 
                        className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] opacity-0 animate-fade-in"
                        style={{
                          animationDelay: `${index * 150}ms`,
                          animationFillMode: 'forwards'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-purple-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                                                 <CardContent className="p-0">
                           {/* Video Thumbnail with Overlaid Content */}
                           <div className="relative aspect-video rounded-2xl overflow-hidden">
                             {getVideoThumbnail(video.videoEmbedLink) ? (
                               <img 
                                 src={getVideoThumbnail(video.videoEmbedLink)!} 
                                 alt={video.videoName}
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                   e.currentTarget.style.display = 'none'
                                 }}
                               />
                             ) : (
                               <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                 <Video className="w-12 h-12 text-white/60" />
                               </div>
                             )}
                             
                             {/* Dark gradient overlay for text readability */}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                             
                             {/* Type Badge */}
                             <div className="absolute top-3 left-3">
                               <Badge className={`${getTypeColor(video.type)} border text-xs px-2 py-1 font-semibold`}>
                                 {video.type}
                               </Badge>
                             </div>
                             
                             {/* Duration Badge */}
                             {video.duration && (
                               <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                                 <div className="flex items-center gap-1 text-white text-xs font-medium">
                                   <Clock className="w-3 h-3" />
                                   {video.duration}
                                 </div>
                               </div>
                             )}



                             {/* Content Overlaid on Thumbnail */}
                             <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                               {/* Video Title */}
                               <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors leading-tight">
                                 {video.videoName}
                               </h3>
                               
                               {/* Video Info - Compact Layout */}
                               <div className="space-y-1">
                                 <div className="flex items-center gap-2 text-xs text-slate-200">
                                   <User className="w-3 h-3 flex-shrink-0" />
                                   <span className="truncate font-medium">{video.teacher}</span>
                                 </div>

                                 <div className="flex items-center gap-2 text-xs text-slate-200">
                                   <BookOpen className="w-3 h-3 flex-shrink-0" />
                                   <span className="truncate">{video.topicName}</span>
                                 </div>
                               </div>

                               {/* Action Button - Simplified */}
                               <div className="pt-1">
                                 <Button
                                   size="sm"
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     console.log('Navigating to video with ID:', video.id)
                                     window.location.href = `/topic-vault/video/${video.id}`
                                   }}
                                   className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                                 >
                                   <Play className="w-4 h-4 mr-2" />
                                   Watch
                                 </Button>
                               </div>
                             </div>
                           </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No videos available</h3>
                    <p className="text-slate-400">Check back later for recommended content</p>
                  </div>
                )}
              </div>

              {/* Topic Filters */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <Filter className="w-5 h-5 text-purple-400" />
                    Filter by Topic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {/* View All Topics Button */}
                    <Button
                      variant={selectedTopic === "all" ? "default" : "outline"}
                      onClick={() => setSelectedTopic("all")}
                      className={`rounded-full px-6 py-2 transition-all duration-300 ${
                        selectedTopic === "all"
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
                          : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                      }`}
                    >
                      View All Topics
                    </Button>

                    {/* Topic Filter Buttons */}
                    {topics.map((topic) => (
                      <Button
                        key={topic.id}
                        variant={selectedTopic === topic.id ? "default" : "outline"}
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`rounded-full px-6 py-2 transition-all duration-300 ${
                          selectedTopic === topic.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                        }`}
                      >
                        {topic.topicName}
                        <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                          {topic.subtopics?.filter(s => s.status === 'active').length || 0}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Search Bar */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardContent className="p-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Search videos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* All Videos List - Lesson Style */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <Video className="w-5 h-5 text-green-400" />
                    All Videos ({allVideos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allVideos.length === 0 ? (
                    <div className="text-center py-16">
                      <Video className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
                      <p className="text-slate-400">Try adjusting your filters or search terms</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allVideos.map((video, index) => (
                        <div
                          key={video.id}
                          className="group p-4 lg:p-5 rounded-xl bg-white/8 backdrop-blur-2xl hover:bg-white/12 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl relative overflow-hidden hover:scale-[1.01] opacity-0 animate-fade-in"
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animationFillMode: 'forwards'
                          }}
                        >
                          {/* Subject Color Accent */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2 backdrop-blur-sm"
                            style={{ 
                              backgroundColor: '#3B82F6',
                              borderRadius: '0 12px 12px 0',
                              boxShadow: `0 0 20px #3B82F6, inset 0 1px 0 rgba(255,255,255,0.4)`,
                              border: `1px solid rgba(255,255,255,0.3)`,
                              borderLeft: 'none'
                            }}
                          />
                          
                          {/* Subtle hover gradient effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="flex items-center gap-4 relative z-10">
                            {/* Left: Type Badge */}
                            <div className="flex-shrink-0 text-center min-w-[80px]">
                              <Badge className={`${getTypeColor(video.type)} border text-xs px-3 py-2 font-semibold`}>
                                {video.type}
                              </Badge>
                              {video.duration && (
                                <div className="text-xs text-slate-400 font-medium mt-1">
                                  {video.duration}
                                </div>
                              )}
                            </div>

                            {/* Separator Line */}
                            <div className="flex-shrink-0 h-16 lg:h-20 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

                            {/* Video Thumbnail */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 relative">
                                {getVideoThumbnail(video.videoEmbedLink) ? (
                                  <img 
                                    src={getVideoThumbnail(video.videoEmbedLink)!}
                                    alt={video.videoName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Video className="w-8 h-8 text-slate-400" />
                                  </div>
                                )}
                                
                                {/* Play overlay */}
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <Play className="w-3 h-3 text-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Header with Video Name */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-white text-lg leading-tight">
                                    {video.videoName}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                    <User className="w-4 h-4" />
                                    <span>{video.teacher}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Topic Badge */}
                              <div className="inline-flex items-center bg-indigo-500/15 text-indigo-200 border border-indigo-400/25 px-3 py-1.5 text-xs font-semibold rounded-lg">
                                <BookOpen className="w-3 h-3 mr-1.5" />
                                {video.topicName}
                              </div>

                              {/* Description */}
                              {video.description && (
                                <p className="text-sm text-slate-400 line-clamp-2">
                                  {video.description}
                                </p>
                              )}
                            </div>

                            {/* Right: Action Button */}
                            <div className="flex-shrink-0">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log('Navigating to video with ID:', video.id)
                                  window.location.href = `/topic-vault/video/${video.id}`
                                }}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Watch
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 