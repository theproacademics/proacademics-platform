"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  ChevronRight
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
  }[]
  questions?: QuestionVideo[]
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
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)
  const [view, setView] = useState<'subjects' | 'boards' | 'papers'>('subjects')
  
  // Question videos state
  const [questionsData, setQuestionsData] = useState<Record<string, QuestionVideo[]>>({})
  const [loadingQuestions, setLoadingQuestions] = useState<Record<string, boolean>>({})
  const [questionPages, setQuestionPages] = useState<Record<string, number>>({})
  const QUESTIONS_PER_PAGE = 6

  // Extract video thumbnail URL
  const getVideoThumbnail = (videoUrl: string): string | null => {
    try {
      if (!videoUrl) return null
      
      // YouTube URL patterns (youtube.com, youtu.be, youtube.com/embed)
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const youtubeMatch = videoUrl.match(youtubeRegex)
      
      if (youtubeMatch && youtubeMatch[1]) {
        // Try maxresdefault first, fallback handled by onError
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
      }
      
      // Vimeo URL patterns
      const vimeoRegex = /vimeo\.com\/(?:.*\/)?(\d+)/
      const vimeoMatch = videoUrl.match(vimeoRegex)
      
      if (vimeoMatch && vimeoMatch[1]) {
        // For Vimeo, we could use their oembed API, but for now return null
        // Future enhancement: fetch thumbnail from Vimeo API
        return null
      }
      
      // Add more platforms as needed
      // Dailymotion: /dailymotion\.com\/video\/([^_]+)/
      // Twitch: /twitch\.tv\/videos\/(\d+)/
      
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
    setPapers(papers)
    setView('papers')
    
    // Fetch questions for all papers
    papers.forEach(paper => {
      fetchQuestionsForPaper(paper.id)
    })
  }

  // Fetch questions for a specific paper
  const fetchQuestionsForPaper = async (paperId: string) => {
    if (questionsData[paperId] || loadingQuestions[paperId]) return

    try {
      setLoadingQuestions(prev => ({ ...prev, [paperId]: true }))
      
      const response = await fetch(`/api/admin/pastpapers/${paperId}/questions`)
      if (!response.ok) throw new Error('Failed to fetch questions')
      
      const data = await response.json()
      if (data.success) {
        setQuestionsData(prev => ({
          ...prev,
          [paperId]: data.questions || []
        }))
        setQuestionPages(prev => ({ ...prev, [paperId]: 1 }))
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestionsData(prev => ({ ...prev, [paperId]: [] }))
    } finally {
      setLoadingQuestions(prev => ({ ...prev, [paperId]: false }))
    }
  }

  // Handle back navigation
  const handleBack = () => {
    if (view === 'papers') {
      setView('boards')
      setSelectedBoard(null)
      setPapers([])
      // Clear questions data when leaving papers view
      setQuestionsData({})
      setLoadingQuestions({})
      setQuestionPages({})
    } else if (view === 'boards') {
      setView('subjects')
      setSelectedSubject(null)
      setBoards([])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <Navigation />
      
      <div className="lg:ml-80">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            
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
                      {view === 'papers' && `${selectedSubject} - ${selectedBoard}`}
                    </h2>
                    <p className="text-purple-200 text-sm">
                      {view === 'subjects' && 'Choose from available academic subjects'}
                      {view === 'boards' && 'Choose from available examination boards'}
                      {view === 'papers' && 'Available past papers'}
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
              ) : (
                // Papers with Video Tiles
                <div className="space-y-8">
                  {papers.map((paper, index) => {
                    const paperQuestions = questionsData[paper.id] || []
                    const currentPage = questionPages[paper.id] || 1
                    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE
                    const endIndex = startIndex + QUESTIONS_PER_PAGE
                    const paginatedQuestions = paperQuestions.slice(startIndex, endIndex)
                    const totalPages = Math.ceil(paperQuestions.length / QUESTIONS_PER_PAGE)
                    const isLoadingQuestions = loadingQuestions[paper.id]
                    
                    return (
                      <div key={paper.id} className="group relative">
                        {/* Paper Card Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-white/[0.01] rounded-3xl transition-all duration-300 group-hover:from-white/[0.08] group-hover:to-white/[0.03]"></div>
                        <div className="absolute inset-0 border border-white/10 rounded-3xl transition-all duration-300 group-hover:border-white/20"></div>
                        
                        {/* Paper Content */}
                        <div className="relative p-6 lg:p-8">
                          {/* Paper Header */}
                          <div className="flex items-start gap-4 mb-6">
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105">
                                <span className="text-white font-bold text-lg">
                                  {(index + 1).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                                  {paper.paperName}
                                </h3>
                                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {paper.year}
                                </Badge>
                                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  {paper.program}
                                </Badge>
                              </div>
                              <p className="text-slate-300 text-sm">{paperQuestions.length} video explanations available</p>
                            </div>
                            
                            {/* Paper Actions */}
                            <div className="flex gap-2">
                              {paper.papers.map((individualPaper, paperIndex) => (
                                <div key={paperIndex} className="flex gap-2">
                                  <a
                                    href={individualPaper.questionPaperUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-colors text-sm"
                                  >
                                    <Eye className="w-3 h-3" />
                                    GO
                                  </a>
                                  <a
                                    href={individualPaper.markSchemeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg transition-colors text-sm"
                                  >
                                    <Download className="w-3 h-3" />
                                    Mark Scheme
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Video Tiles Section */}
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
                                                 // Hide image on error, fallback to gradient background
                                                 e.currentTarget.style.display = 'none'
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
                                        [paper.id]: Math.max(1, currentPage - 1)
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
                                              [paper.id]: pageNum
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
                                        [paper.id]: Math.min(totalPages, currentPage + 1)
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
                        </div>
                      </div>
                    )
                  })}
                  
                  {papers.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-purple-400/50" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">No papers found</h3>
                      <p className="text-purple-200/70 max-w-md mx-auto">No papers available for this board yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
