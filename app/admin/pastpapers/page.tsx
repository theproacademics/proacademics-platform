"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, FileText, Settings, Calendar, ChevronLeft, ChevronRight, MoreHorizontal, CheckSquare, Square, AlertTriangle, Check, X, Download, PlayCircle, ChevronDown, ChevronUp, FolderOpen, FileTextIcon } from "lucide-react"
import { toast } from "sonner"
import { PastPaper } from "@/types"

// Types
interface PastPaperFormData {
  paperName: string
  board: string
  year: number
  subject: string
  program: string
  status: 'draft' | 'active'
}

interface PaperFormData {
  name: string
  questionPaperUrl: string
  markSchemeUrl: string
}

// Constants
const ITEMS_PER_PAGE = 10
const CURRENT_YEAR = new Date().getFullYear()
const BOARDS = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'CCEA', 'Cambridge', 'IB', 'ICSE']

// Subject-Program mapping
let SUBJECT_PROGRAMS: Record<string, string[]> = {}
let SUBJECT_COLORS: Record<string, string> = {}

// Utility functions
const createEmptyFormData = (): PastPaperFormData => ({
  paperName: "",
  board: "",
  year: CURRENT_YEAR,
  subject: "",
  program: "",
  status: "draft"
})

const createEmptyPaperData = (): PaperFormData => ({
  name: "",
  questionPaperUrl: "",
  markSchemeUrl: ""
})

export default function PastPapersPage() {
  // Core data states
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [adminSubjects, setAdminSubjects] = useState<{id: string, name: string, color: string, isActive: boolean, programs: {id: string, name: string, color: string, isActive: boolean}[]}[]>([])
  
  // Expanded papers state
  const [expandedPapers, setExpandedPapers] = useState<Set<string>>(new Set())
  
  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedBoard, setSelectedBoard] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPapers, setTotalPapers] = useState(0)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddPaperDialogOpen, setIsAddPaperDialogOpen] = useState(false)
  const [selectedPastPaper, setSelectedPastPaper] = useState<PastPaper | null>(null)
  
  // Form states
  const [formData, setFormData] = useState<PastPaperFormData>(createEmptyFormData())
  const [paperFormData, setPaperFormData] = useState<PaperFormData>(createEmptyPaperData())

  // Get programs for selected subject
  const getAvailablePrograms = (subjectName: string) => {
    const programNames = SUBJECT_PROGRAMS[subjectName] || []
    return programNames.map(programName => ({
      id: programName,
      name: programName,
      color: SUBJECT_COLORS[programName] || '#3B82F6',
      isActive: true
    }))
  }

  // Toggle expanded state for past papers
  const toggleExpanded = (paperId: string) => {
    const newExpanded = new Set(expandedPapers)
    if (newExpanded.has(paperId)) {
      newExpanded.delete(paperId)
    } else {
      newExpanded.add(paperId)
    }
    setExpandedPapers(newExpanded)
  }

  // Fetch past papers data
  const fetchPastPapers = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString()
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedSubject !== 'all') params.append('subject', selectedSubject)
      if (selectedBoard !== 'all') params.append('board', selectedBoard)
      if (selectedYear !== 'all') params.append('year', selectedYear)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      
      const response = await fetch(`/api/admin/pastpapers?${params}`)
      if (!response.ok) throw new Error('Failed to fetch past papers')
      
      const data = await response.json()
      if (data.success) {
        setPastPapers(data.pastPapers || [])
        setTotalPapers(data.total || 0)
        setTotalPages(data.totalPages || 1)
      } else {
        throw new Error(data.error || 'Failed to fetch past papers')
      }
    } catch (error) {
      console.error('Error fetching past papers:', error)
      toast.error('Failed to fetch past papers')
      setPastPapers([])
      setTotalPapers(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const [subjectsRes, subjectProgramsRes, adminSubjectsRes] = await Promise.all([
        fetch('/api/admin/lessons/filters/subjects'),
        fetch('/api/admin/subjects/programs-map'),
        fetch('/api/admin/subjects')
      ])
      
      if (adminSubjectsRes.ok) {
        const adminSubjectsData = await adminSubjectsRes.json()
        if (adminSubjectsData.success && adminSubjectsData.subjects) {
          setAdminSubjects(adminSubjectsData.subjects)
        }
      }

      if (subjectProgramsRes.ok) {
        const subjectProgramsData = await subjectProgramsRes.json()
        if (subjectProgramsData.success && subjectProgramsData.subjectPrograms) {
          SUBJECT_PROGRAMS = subjectProgramsData.subjectPrograms
          SUBJECT_COLORS = subjectProgramsData.subjectColors || {}
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  // Effect hooks
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    fetchPastPapers()
  }, [currentPage, searchTerm, selectedSubject, selectedBoard, selectedYear, selectedStatus])

  // Create new past paper container
  const handleCreatePastPaper = async () => {
    try {
      if (!formData.paperName.trim()) {
        toast.error('Past paper name is required')
        return
      }
      if (!formData.board.trim()) {
        toast.error('Board is required')
        return
      }
      if (!formData.subject.trim()) {
        toast.error('Subject is required')
        return
      }
      if (!formData.program.trim()) {
        toast.error('Program is required')
        return
      }

      const response = await fetch('/api/admin/pastpapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          papers: [] // Start with empty papers array
        })
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create past paper')
      }
      
      setIsCreateDialogOpen(false)
      setFormData(createEmptyFormData())
      toast.success('Past paper container created successfully!')
      fetchPastPapers()
    } catch (error) {
      console.error('Error creating past paper:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create past paper')
    }
  }

  // Add individual paper to past paper
  const handleAddPaper = async () => {
    if (!selectedPastPaper) return

    try {
      if (!paperFormData.name.trim()) {
        toast.error('Paper name is required')
        return
      }
      if (!paperFormData.questionPaperUrl.trim()) {
        toast.error('Question paper URL is required')
        return
      }
      if (!paperFormData.markSchemeUrl.trim()) {
        toast.error('Mark scheme URL is required')
        return
      }

      const updatedPapers = [...(selectedPastPaper.papers || []), {...paperFormData, questions: []}]

      const response = await fetch(`/api/admin/pastpapers/${selectedPastPaper.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedPastPaper,
          papers: updatedPapers
        })
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add paper')
      }
      
      setIsAddPaperDialogOpen(false)
      setPaperFormData(createEmptyPaperData())
      setSelectedPastPaper(null)
      toast.success('Paper added successfully!')
      fetchPastPapers()
    } catch (error) {
      console.error('Error adding paper:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add paper')
    }
  }

  // Delete past paper
  const handleDeletePastPaper = async (paperId: string) => {
    try {
      const response = await fetch(`/api/admin/pastpapers/${paperId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete past paper')
      }

      toast.success('Past paper deleted successfully!')
      fetchPastPapers()
    } catch (error) {
      console.error('Error deleting past paper:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete past paper')
    }
  }

  // Navigate to questions management for specific paper
  const handleManageQuestions = (pastPaper: PastPaper, paperIndex: number) => {
    window.location.href = `/admin/pastpapers/${pastPaper.id}/questions?paper=${paperIndex}`
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Scrollable Content Container */}
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-14 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden">
          
          {/* Enhanced Header */}
          <div className="mb-6 lg:mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4 p-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FileText className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="text-xs lg:text-sm text-blue-300 font-medium tracking-wider uppercase">Admin Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 tracking-tight">
              Past Papers Management
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
              Manage past papers with question papers and mark schemes for all subjects and programs
            </p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto animate-pulse"></div>
          </div>

          {/* Filters & Actions Section */}
          <Card className="bg-white/[0.02] border border-white/10 rounded-2xl lg:rounded-3xl mb-4 lg:mb-8 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
            <CardContent className="relative p-3 sm:p-4 lg:p-8">
              
              {/* Add Past Paper Button */}
              <div className="mb-6">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setFormData(createEmptyFormData())}
                      className="bg-blue-500/10 border border-blue-400/30 text-blue-400 
                               hover:bg-blue-500/20 hover:border-blue-400/50 
                               focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400/60
                               rounded-xl transition-all duration-200 h-11 px-6 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Past Paper
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/20 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white text-xl">Create New Past Paper</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Paper Name *</label>
                          <Input
                            placeholder="e.g., Mathematics Paper"
                            value={formData.paperName}
                            onChange={(e) => setFormData({...formData, paperName: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Board *</label>
                          <Select value={formData.board} onValueChange={(value) => setFormData({...formData, board: value})}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select board" />
                            </SelectTrigger>
                            <SelectContent>
                              {BOARDS.map((board) => (
                                <SelectItem key={board} value={board}>{board}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Year *</label>
                          <Select value={formData.year.toString()} onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 30}, (_, i) => CURRENT_YEAR - i).map((year) => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Subject *</label>
                          <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value, program: ""})}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {adminSubjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Program *</label>
                          <Select value={formData.program} onValueChange={(value) => setFormData({...formData, program: value})}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailablePrograms(formData.subject).map((program) => (
                                <SelectItem key={program.id} value={program.name}>{program.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Status *</label>
                          <Select value={formData.status} onValueChange={(value: 'draft' | 'active') => setFormData({...formData, status: value})}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePastPaper} className="bg-blue-600 hover:bg-blue-700">
                        Create Past Paper
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search past papers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/[0.03] border-2 border-white/20 rounded-xl text-white placeholder:text-slate-400 
                             focus:border-blue-400/80 focus:ring-2 focus:ring-blue-400/20 focus:bg-white/[0.08]
                             hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300"
                  />
                </div>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white">
                    <SelectValue placeholder="Filter by Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border border-white/20 rounded-xl">
                    <SelectItem value="all">All Subjects</SelectItem>
                    {adminSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                  <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white">
                    <SelectValue placeholder="Filter by Board" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border border-white/20 rounded-xl">
                    <SelectItem value="all">All Boards</SelectItem>
                    {BOARDS.map((board) => (
                      <SelectItem key={board} value={board}>
                        {board}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white">
                    <SelectValue placeholder="Filter by Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border border-white/20 rounded-xl">
                    <SelectItem value="all">All Years</SelectItem>
                    {Array.from({length: 30}, (_, i) => CURRENT_YEAR - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Past Papers List */}
          <Card className="relative bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-800/30 to-purple-800/20">
              <CardTitle className="text-white font-semibold text-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                Past Papers ({totalPapers})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading past papers...</p>
                </div>
              ) : pastPapers.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No past papers yet</h3>
                  <p className="text-slate-400 mb-6">Create your first past paper to get started</p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Past Paper
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {pastPapers.map((pastPaper) => {
                    const isExpanded = expandedPapers.has(pastPaper.id)
                    return (
                      <div key={pastPaper.id} className="border-b border-white/10 last:border-b-0">
                        {/* Main Past Paper Row */}
                        <div className="p-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(pastPaper.id)}
                                className="p-1 h-auto"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                )}
                              </Button>
                              
                              <FolderOpen className="w-5 h-5 text-blue-400 flex-shrink-0" />
                              
                              <div className="flex-1">
                                <h3 className="text-white font-medium">{pastPaper.paperName}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                  <span>{pastPaper.board}</span>
                                  <span>{pastPaper.year}</span>
                                  <span>{pastPaper.subject}</span>
                                  <span>{pastPaper.program}</span>
                                  <Badge 
                                    className={`px-2 py-1 text-xs ${
                                      pastPaper.status === 'active' 
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    }`}
                                  >
                                    {pastPaper.status}
                                  </Badge>
                                  <span className="text-xs">
                                    {pastPaper.papers?.length || 0} papers
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPastPaper(pastPaper)
                                  setPaperFormData(createEmptyPaperData())
                                  setIsAddPaperDialogOpen(true)
                                }}
                                className="text-blue-400 border-blue-400/30 hover:bg-blue-500/10"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Paper
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-500/10">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-900 border-white/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete Past Paper</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                      This will permanently delete "{pastPaper.paperName}" and all its papers. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeletePastPaper(pastPaper.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Papers List */}
                        {isExpanded && (
                          <div className="bg-slate-800/30 border-t border-white/10">
                            {pastPaper.papers && pastPaper.papers.length > 0 ? (
                              <div className="space-y-0">
                                {pastPaper.papers.map((paper, index) => (
                                  <div key={index} className="p-4 border-b border-white/5 last:border-b-0 ml-12">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <FileTextIcon className="w-4 h-4 text-purple-400" />
                                        <div>
                                          <h4 className="text-white font-medium">{paper.name}</h4>
                                          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                                            <a 
                                              href={paper.questionPaperUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="hover:text-blue-400 transition-colors"
                                            >
                                              Question Paper ↗
                                            </a>
                                            <a 
                                              href={paper.markSchemeUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="hover:text-green-400 transition-colors"
                                            >
                                              Mark Scheme ↗
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleManageQuestions(pastPaper, index)}
                                        className="text-purple-400 border-purple-400/30 hover:bg-purple-500/10"
                                      >
                                        <Settings className="w-4 h-4 mr-1" />
                                        Manage Questions
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center ml-12">
                                <FileTextIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                <p className="text-slate-400 text-sm">No papers added yet</p>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPastPaper(pastPaper)
                                    setPaperFormData(createEmptyPaperData())
                                    setIsAddPaperDialogOpen(true)
                                  }}
                                  className="mt-3 text-blue-400 border-blue-400/30"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add First Paper
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <span className="text-white px-4">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Paper Dialog */}
      <Dialog open={isAddPaperDialogOpen} onOpenChange={setIsAddPaperDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Add Paper to "{selectedPastPaper?.paperName}"
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Paper Name *</label>
              <Input
                placeholder="e.g., Paper 1, Paper 2, etc."
                value={paperFormData.name}
                onChange={(e) => setPaperFormData({...paperFormData, name: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Question Paper URL *</label>
              <Input
                placeholder="https://example.com/question-paper.pdf"
                value={paperFormData.questionPaperUrl}
                onChange={(e) => setPaperFormData({...paperFormData, questionPaperUrl: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Mark Scheme URL *</label>
              <Input
                placeholder="https://example.com/mark-scheme.pdf"
                value={paperFormData.markSchemeUrl}
                onChange={(e) => setPaperFormData({...paperFormData, markSchemeUrl: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddPaperDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPaper} className="bg-blue-600 hover:bg-blue-700">
              Add Paper
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



