"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { 
  FileText, 
  BookOpen, 
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
  ArrowRight,
  Download,
  Eye,
  Calendar,
  PlayCircle,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  FileTextIcon
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

// Interfaces
interface QuestionVideo {
  id: string
  questionNumber: number
  topic: string
  questionName: string
  questionDescription: string
  duration: string
  teacher: string
  videoEmbedLink: string
  createdAt: string
  updatedAt: string
}

interface PastPaper {
  _id: string
  id: string
  paperName: string
  board: string
  year: number
  subject: string
  program: string
  papers: {
    name: string
    questionPaperUrl: string
    markSchemeUrl: string
    questions: QuestionVideo[]
  }[]
  status: 'draft' | 'active'
  createdAt: string
  updatedAt: string
}

interface SubjectSummary {
  name: string
  color: string
  totalPapers: number
  boards: string[]
  icon: any
}

interface BoardSummary {
  board: string
  paperCount: number
  papers: PastPaper[]
}

export default function PastPapersPage() {
  const [subjects, setSubjects] = useState<SubjectSummary[]>([])
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([])
  const [selectedPastPaper, setSelectedPastPaper] = useState<PastPaper | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)
  const [view, setView] = useState<'subjects' | 'boards' | 'past-papers' | 'individual-papers'>('subjects')
  const [dataReady, setDataReady] = useState(false)
  
  // Question videos state for individual papers
  const [loadingQuestions, setLoadingQuestions] = useState<Record<string, boolean>>({})
  const [questionPages, setQuestionPages] = useState<Record<string, number>>({})
  const QUESTIONS_PER_PAGE = 6

  // Preloader hook
  const { showPreloader, mounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  // Helper functions for video processing
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getVimeoVideoId = (url: string): string | null => {
    const regex = /(?:vimeo\.com\/)(?:channels\/\w+\/|groups\/\w+\/videos\/|album\/\d+\/video\/|video\/|)(\d+)(?:\/\w+)?(?:$|\/|\?)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getVimeoHash = (url: string): string | null => {
    const regex = /vimeo\.com\/\d+\/([a-zA-Z0-9]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  const isVimeoUrl = (url: string): boolean => {
    return url.includes('vimeo.com')
  }

  // Extract video thumbnail URL with full Vimeo support
  const getVideoThumbnail = (videoUrl: string): string | null => {
    try {
      if (!videoUrl) return null
      
      // Handle YouTube videos
      if (isYouTubeUrl(videoUrl)) {
        const youtubeId = getYouTubeVideoId(videoUrl)
        if (youtubeId) {
          return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        }
      }
      
      // Handle Vimeo videos
      if (isVimeoUrl(videoUrl)) {
        const vimeoId = getVimeoVideoId(videoUrl)
        const hasHash = getVimeoHash(videoUrl)
        
        console.log('🎥 Processing Vimeo URL on pastpapers page:', videoUrl)
        console.log('🆔 Extracted ID:', vimeoId)
        console.log('🔐 Has hash:', hasHash)
        
        if (vimeoId) {
          // Use vumbnail service for both private and public videos
          if (hasHash) {
            console.log('🔒 Private Vimeo video - using vumbnail service')
          } else {
            console.log('🌍 Public Vimeo video - using vumbnail service')
          }
          return `https://vumbnail.com/${vimeoId}.jpg`
        }
      }
      
      return null
    } catch (error) {
      console.error('Error extracting video thumbnail:', error)
      return null
    }
  }

  // Fetch all subjects from admin and get paper counts
  const fetchPastPapers = async () => {
    try {
      setLoading(true)
      
      // Fetch all admin subjects first
      const subjectsResponse = await fetch('/api/admin/subjects')
      if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects')
      
      const subjectsData = await subjectsResponse.json()
      if (!subjectsData.success) throw new Error(subjectsData.error || 'Failed to fetch subjects')
      
      const adminSubjects = subjectsData.subjects || []
      
      // Fetch all past papers to get counts
      const papersResponse = await fetch('/api/admin/pastpapers')
      let allPapers: PastPaper[] = []
      if (papersResponse.ok) {
        const papersData = await papersResponse.json()
        if (papersData.success) {
          allPapers = papersData.pastPapers || []
        }
      }
      
      // Filter only active papers for student view
      const activePapers = allPapers.filter(paper => paper.status === 'active')
      
      // Create subject summaries for ALL admin subjects
      const subjectSummaries: SubjectSummary[] = adminSubjects
        .filter((subject: any) => subject.isActive)
        .map((subject: any) => {
          // Count papers for this subject
          const subjectPapers = activePapers.filter(paper => paper.subject === subject.name)
          const boards = new Set<string>()
          subjectPapers.forEach(paper => boards.add(paper.board))
          
          return {
            name: subject.name,
            color: subject.color || '#3B82F6',
            totalPapers: subjectPapers.length,
            boards: Array.from(boards),
            icon: getSubjectIcon(subject.name)
          }
        })
      
      setSubjects(subjectSummaries)
      
    } catch (error) {
      console.error("Failed to fetch subjects and papers:", error)
    } finally {
      setLoading(false)
      // Mark data as ready after a short delay to ensure UI is rendered
      setTimeout(() => setDataReady(true), 100)
    }
  }

  useEffect(() => {
    fetchPastPapers()
  }, [])

  // Handle subject selection
  const handleSubjectClick = async (subjectName: string) => {
    try {
      setLoading(true)
      setSelectedSubject(subjectName)
      
      // Fetch actual papers for this subject (only active papers)
      const papersResponse = await fetch(`/api/admin/pastpapers?subject=${encodeURIComponent(subjectName)}`)
      let allSubjectPapers: PastPaper[] = []
      
      if (papersResponse.ok) {
        const papersData = await papersResponse.json()
        if (papersData.success) {
          allSubjectPapers = papersData.pastPapers || []
        }
      }
      
      // Filter only active papers
      const subjectPapers = allSubjectPapers.filter(paper => paper.status === 'active')
      
      // Group papers by board and only show boards that actually have papers
      const paperMap = new Map<string, PastPaper[]>()
      subjectPapers.forEach(paper => {
        if (!paperMap.has(paper.board)) {
          paperMap.set(paper.board, [])
        }
        paperMap.get(paper.board)!.push(paper)
      })
      
      // Create board summaries only for boards that have papers
      const boardSummaries: BoardSummary[] = Array.from(paperMap.entries()).map(([boardName, papers]) => ({
        board: boardName,
        paperCount: papers.length,
        papers: papers
      }))
      
      setBoards(boardSummaries)
      setView('boards')
      
    } catch (error) {
      console.error("Failed to fetch subject papers:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle board selection
  const handleBoardClick = (boardName: string) => {
    setSelectedBoard(boardName)
    const boardData = boards.find(b => b.board === boardName)
    const papers = boardData ? boardData.papers : []
    setPastPapers(papers)
    setView('past-papers')
  }

  // Handle past paper selection - show individual papers
  const handlePastPaperClick = (pastPaper: PastPaper) => {
    setSelectedPastPaper(pastPaper)
    setView('individual-papers')
  }

  // Fetch questions for a specific paper
  const fetchQuestionsForPaper = async (pastPaperId: string, paperIndex: number) => {
    const cacheKey = `${pastPaperId}-${paperIndex}`
    if (loadingQuestions[cacheKey]) return

    try {
      setLoadingQuestions(prev => ({ ...prev, [cacheKey]: true }))
      
      const response = await fetch(`/api/admin/pastpapers/${pastPaperId}/questions?paper=${paperIndex}`)
      if (!response.ok) throw new Error('Failed to fetch questions')
      
      const data = await response.json()
      if (data.success) {
        // Update the selected past paper with the fetched questions
        if (selectedPastPaper && selectedPastPaper.id === pastPaperId) {
          const updatedPastPaper = { ...selectedPastPaper }
          if (updatedPastPaper.papers[paperIndex]) {
            updatedPastPaper.papers[paperIndex].questions = data.questions || []
          }
          setSelectedPastPaper(updatedPastPaper)
        }
        setQuestionPages(prev => ({ ...prev, [cacheKey]: 1 }))
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoadingQuestions(prev => ({ ...prev, [cacheKey]: false }))
    }
  }

  // Handle back navigation
  const handleBack = () => {
    if (view === 'individual-papers') {
      setView('past-papers')
      setSelectedPastPaper(null)
      setLoadingQuestions({})
      setQuestionPages({})
    } else if (view === 'past-papers') {
      setView('boards')
      setSelectedBoard(null)
      setPastPapers([])
    } else if (view === 'boards') {
      setView('subjects')
      setSelectedSubject(null)
      setBoards([])
    }
  }

  // Show preloader
  if (showPreloader || !mounted) {
    return <Preloader isVisible={showPreloader || !mounted} colorScheme="purple" loadingText="Loading past papers library..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <Navigation />
      
      <main className="lg:ml-[262px] min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-6 p-3 rounded-full bg-white/5 border border-white/10">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-purple-300 font-medium tracking-wider uppercase">Academic Resources</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 tracking-tight">
                Past Papers
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Access comprehensive past papers and study materials for your exam preparation
              </p>
            </div>

            {/* Main Content */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl">
              
              {/* Navigation Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  {view !== 'subjects' && (
                    <Button
                      onClick={handleBack}
                      variant="ghost"
                      className="text-purple-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors mr-4"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-white/10">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {view === 'subjects' && 'Select Subject'}
                      {view === 'boards' && `Select Board - ${selectedSubject}`}
                      {view === 'past-papers' && `Past Papers - ${selectedSubject} (${selectedBoard})`}
                      {view === 'individual-papers' && selectedPastPaper && `${selectedPastPaper.paperName} - Individual Papers`}
                    </h2>
                    <p className="text-purple-200 text-sm">
                      {view === 'subjects' && 'Choose from available academic subjects'}
                      {view === 'boards' && 'Choose from available examination boards'}
                      {view === 'past-papers' && 'Select a past paper to view individual papers'}
                      {view === 'individual-papers' && 'View individual papers and question videos'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content based on current view */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-64 bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-3xl animate-pulse border border-white/10"></div>
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
                                {subject.totalPapers}
                              </Badge>
                            </div>
                            
                            {/* Subject Info */}
                            <div className="mb-6">
                              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300 capitalize">
                                {subject.name}
                              </h3>
                              <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                                {subject.boards.length > 0 
                                  ? `${subject.boards.length} examination board${subject.boards.length !== 1 ? 's' : ''} available`
                                  : 'Click to browse available boards'
                                }
                              </p>
                            </div>
                            
                            {/* Footer */}
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300 transition-colors">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {subject.totalPapers} paper{subject.totalPapers !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-all duration-300">
                                <span className="text-sm font-medium">Browse Boards</span>
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
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-purple-400/50" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No past papers available</h3>
                    <p className="text-purple-200/70 max-w-md mx-auto">Contact your administrator to add past papers to the system</p>
                  </div>
                )
              ) : view === 'boards' ? (
                // Boards Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {boards.map((board) => (
                    <div
                      key={board.board}
                      onClick={() => handleBoardClick(board.board)}
                      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                    >
                      {/* Card Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-3xl transition-all duration-300 group-hover:from-white/[0.12] group-hover:to-white/[0.04]"></div>
                      <div className="absolute inset-0 border border-white/10 rounded-3xl transition-all duration-300 group-hover:border-white/20"></div>
                      
                      {/* Card Content */}
                      <div className="relative p-6 h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg flex items-center justify-center border-2 border-white/20 transition-all duration-300 group-hover:scale-110">
                            <span className="text-white font-bold text-lg">{board.board.charAt(0)}</span>
                          </div>
                          <Badge 
                            className="bg-white/10 text-white border border-white/20 px-3 py-1.5 text-sm font-medium rounded-full"
                          >
                            {board.paperCount}
                          </Badge>
                        </div>
                        
                        {/* Board Info */}
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300">
                            {board.board}
                          </h3>
                          <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                            {board.paperCount > 0 ? 'Examination board papers' : 'No papers available yet'}
                          </p>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300 transition-colors">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {board.paperCount} paper{board.paperCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-all duration-300">
                            <span className="text-sm font-medium">{board.paperCount > 0 ? 'View Papers' : 'Browse'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : view === 'past-papers' ? (
                // Past Papers List - Lesson-style Horizontal Tiles
                <div className="space-y-3">
                  {pastPapers.map((pastPaper) => (
                    <div
                      key={pastPaper.id}
                      onClick={() => handlePastPaperClick(pastPaper)}
                      className="group p-4 lg:p-5 rounded-xl bg-white/8 backdrop-blur-2xl hover:bg-white/12 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl relative overflow-hidden hover:scale-[1.01] cursor-pointer"
                    >
                      {/* Subtle hover gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="flex items-center gap-4 relative z-10">
                        {/* Left: Year and Board */}
                        <div className="flex-shrink-0 text-center min-w-[80px]">
                          <div className="text-2xl font-bold text-white leading-tight">
                            {pastPaper.year}
                          </div>
                          <div className="text-sm text-slate-400 font-medium">
                            {pastPaper.board}
                          </div>
                        </div>

                        {/* Separator Line */}
                        <div className="flex-shrink-0 h-16 lg:h-20 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

                        {/* Paper Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-blue-500 relative border border-white/10">
                            <div className="w-full h-full flex items-center justify-center">
                              <FolderOpen className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Header with Paper Name */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white text-lg leading-tight">
                                {pastPaper.paperName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                <span>{pastPaper.subject}</span>
                                {pastPaper.program && (
                                  <>
                                    <span>•</span>
                                    <span>{pastPaper.program}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Paper Count Badge */}
                          <div className="inline-flex items-center bg-blue-500/15 text-blue-200 border border-blue-400/25 px-3 py-1.5 text-xs font-semibold rounded-lg">
                            <FileText className="w-3 h-3 mr-1.5" />
                            {pastPaper.papers?.length || 0} papers
                          </div>

                          {/* Additional Info */}
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center bg-purple-500/15 text-purple-200 border border-purple-400/25 px-3 py-1.5 text-xs font-semibold rounded-lg">
                              {pastPaper.year}
                            </div>
                            {pastPaper.program && (
                              <div className="inline-flex items-center bg-green-500/15 text-green-200 border border-green-400/25 px-3 py-1.5 text-xs font-semibold rounded-lg">
                                {pastPaper.program}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          <Button 
                            className="bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:border-white/50 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl shadow-white/10 hover:shadow-white/20 px-6 py-2.5 text-sm"
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            View Papers
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {pastPapers.length === 0 && (
                    <div className="col-span-full text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-purple-400/50" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">No past papers found</h3>
                      <p className="text-purple-200/70 max-w-md mx-auto">No past papers available for this board yet</p>
                    </div>
                  )}
                </div>
              ) : view === 'individual-papers' && selectedPastPaper ? (
                // Individual Papers View with Question Videos
                <div className="space-y-8">
                  {selectedPastPaper.papers.map((paper, paperIndex) => {
                    const cacheKey = `${selectedPastPaper.id}-${paperIndex}`
                    const paperQuestions = paper.questions || []
                    const currentPage = questionPages[cacheKey] || 1
                    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE
                    const endIndex = startIndex + QUESTIONS_PER_PAGE
                    const paginatedQuestions = paperQuestions.slice(startIndex, endIndex)
                    const totalPages = Math.ceil(paperQuestions.length / QUESTIONS_PER_PAGE)
                    const isLoadingQuestions = loadingQuestions[cacheKey]
                    
                    return (
                      <div key={paperIndex} className="group relative">
                        {/* Paper Card Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-white/[0.01] rounded-3xl transition-all duration-300 group-hover:from-white/[0.08] group-hover:to-white/[0.03]"></div>
                        <div className="absolute inset-0 border border-white/10 rounded-3xl transition-all duration-300 group-hover:border-white/20"></div>
                        
                        {/* Paper Content */}
                        <div className="relative p-6 lg:p-8">
                          {/* Paper Header */}
                          <div className="flex items-start gap-4 mb-6">
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105">
                                <FileTextIcon className="w-7 h-7 text-white" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                                  {paper.name}
                                </h3>
                                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  {paperQuestions.length} videos
                                </Badge>
                              </div>
                              <p className="text-slate-300 text-sm">
                                {paperQuestions.length === 0 ? 'No question videos available yet' : `${paperQuestions.length} video explanation${paperQuestions.length !== 1 ? 's' : ''} available`}
                              </p>
                            </div>
                            
                            {/* Paper Actions */}
                            <div className="flex gap-2">
                              <a
                                href={paper.questionPaperUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-colors text-sm"
                              >
                                <Eye className="w-3 h-3" />
                                Question Paper
                              </a>
                              <a
                                href={paper.markSchemeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg transition-colors text-sm"
                              >
                                <Download className="w-3 h-3" />
                                Mark Scheme
                              </a>
                            </div>
                          </div>

                          {/* Load Questions Button */}
                          {paperQuestions.length === 0 && !isLoadingQuestions && (
                            <div className="text-center py-8">
                              <Button
                                onClick={() => fetchQuestionsForPaper(selectedPastPaper.id, paperIndex)}
                                className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30"
                              >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Load Question Videos
                              </Button>
                            </div>
                          )}

                          {/* Video Tiles Section */}
                          {(paperQuestions.length > 0 || isLoadingQuestions) && (
                            <div className="mt-6">
                              {isLoadingQuestions ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                  {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse border border-white/10"></div>
                                  ))}
                                </div>
                              ) : paperQuestions.length > 0 ? (
                                <>
                                  {/* Video Tiles Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                    {paginatedQuestions.map((question) => {
                                      const thumbnailUrl = getVideoThumbnail(question.videoEmbedLink)
                                      
                                      return (
                                        <div
                                          key={question.id}
                                          className="group/tile relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                                          onClick={() => window.location.href = `/pastpapers/video/${question.id}`}
                                        >
                                          {/* Video Tile Background */}
                                          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-white/10 relative">
                                            {/* Video Thumbnail */}
                                            {thumbnailUrl && (
                                              <img
                                                src={thumbnailUrl}
                                                alt={`${question.questionName} thumbnail`}
                                                className="absolute inset-0 w-full h-full object-cover"
                                                onError={(e) => {
                                                  const target = e.currentTarget
                                                  console.log('❌ Pastpapers thumbnail FAILED to load:', target.src)
                                                  console.log('🖼️ Video URL:', question.videoEmbedLink)
                                                  const youtubeId = question.videoEmbedLink ? getYouTubeVideoId(question.videoEmbedLink) : null
                                                  const vimeoId = question.videoEmbedLink ? getVimeoVideoId(question.videoEmbedLink) : null
                                                  
                                                  // Enhanced Vimeo fallbacks
                                                  if (vimeoId) {
                                                    if (target.src.includes('vumbnail.com') && !target.src.includes('_large')) {
                                                      console.log('🔄 Pastpapers vumbnail failed, trying CDN')
                                                      target.src = `https://i.vimeocdn.com/video/${vimeoId}_295x166.jpg`
                                                    } else if (target.src.includes('i.vimeocdn.com')) {
                                                      console.log('🔄 Pastpapers CDN failed, trying vumbnail large')
                                                      target.src = `https://vumbnail.com/${vimeoId}_large.jpg`
                                                    } else {
                                                      console.log('❌ All pastpapers Vimeo options failed')
                                                      target.style.display = 'none'
                                                    }
                                                  }
                                                  // YouTube fallback
                                                  else if (youtubeId && !target.src.includes('mqdefault')) {
                                                    console.log('🔄 Pastpapers trying YouTube fallback')
                                                    target.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                                                  } else {
                                                    console.log('❌ All pastpapers thumbnail options failed')
                                                    target.style.display = 'none'
                                                  }
                                                }}
                                              />
                                            )}
                                            
                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/tile:bg-black/20 transition-all duration-300">
                                              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover/tile:scale-110 transition-transform duration-300 border border-white/30">
                                                <PlayCircle className="w-6 h-6 text-white" />
                                              </div>
                                            </div>
                                            
                                            {/* Question Number Badge */}
                                            <div className="absolute top-2 left-2 bg-purple-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full border border-purple-400/50">
                                              Q{question.questionNumber}
                                            </div>
                                            
                                            {/* Duration Badge */}
                                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs flex items-center gap-1 px-2 py-1 rounded-full border border-white/20">
                                              <Clock className="w-3 h-3" />
                                              {question.duration}
                                            </div>
                                          </div>
                                          
                                          {/* Video Info */}
                                          <div className="mt-2 px-1">
                                            <h4 className="text-white text-sm font-medium truncate group-hover/tile:text-purple-200 transition-colors">
                                              {question.questionName}
                                            </h4>
                                            <p className="text-slate-400 text-xs truncate">
                                              {question.topic}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                              <User className="w-3 h-3 text-slate-500" />
                                              <span className="text-slate-500 text-xs truncate">{question.teacher}</span>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>

                                  {/* Pagination */}
                                  {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setQuestionPages(prev => ({
                                          ...prev,
                                          [cacheKey]: Math.max(1, currentPage - 1)
                                        }))}
                                        disabled={currentPage === 1}
                                        className="text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50"
                                      >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                      </Button>
                                      
                                      <div className="flex items-center gap-2">
                                        {[...Array(totalPages)].map((_, i) => {
                                          const pageNum = i + 1
                                          return (
                                            <button
                                              key={pageNum}
                                              onClick={() => setQuestionPages(prev => ({
                                                ...prev,
                                                [cacheKey]: pageNum
                                              }))}
                                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                currentPage === pageNum
                                                  ? 'bg-purple-500 text-white'
                                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                              }`}
                                            >
                                              {pageNum}
                                            </button>
                                          )
                                        })}
                                      </div>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setQuestionPages(prev => ({
                                          ...prev,
                                          [cacheKey]: Math.min(totalPages, currentPage + 1)
                                        }))}
                                        disabled={currentPage === totalPages}
                                        className="text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50"
                                      >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                      </Button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center py-8">
                                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 flex items-center justify-center">
                                    <PlayCircle className="w-8 h-8 text-purple-400/50" />
                                  </div>
                                  <p className="text-slate-400 text-sm">No video explanations available yet</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {selectedPastPaper.papers.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-purple-400/50" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">No individual papers</h3>
                      <p className="text-purple-200/70 max-w-md mx-auto">This past paper doesn't have any individual papers added yet</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-purple-400/50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Something went wrong</h3>
                  <p className="text-purple-200/70 max-w-md mx-auto">Please try refreshing the page</p>
                </div>
              )}
            </div>

          </div>
        </main>
    </div>
  );
}
