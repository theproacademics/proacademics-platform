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
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, FileText, Settings, Calendar, ChevronLeft, ChevronRight, MoreHorizontal, CheckSquare, Square, AlertTriangle, Check, X, Download, PlayCircle } from "lucide-react"
import { toast } from "sonner"
import { PastPaper } from "@/types"

// Types

interface PastPaperFormData {
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
  status: 'draft' | 'active'
}

// Constants
const ITEMS_PER_PAGE = 10
const CURRENT_YEAR = new Date().getFullYear()
const BOARDS = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'CCEA', 'Cambridge', 'IB']

// Subject-Program mapping (same as lessons page)
let SUBJECT_PROGRAMS: Record<string, string[]> = {}
let SUBJECT_COLORS: Record<string, string> = {}

// Utility functions
const createEmptyFormData = (): PastPaperFormData => ({
  paperName: "",
  board: "",
  year: CURRENT_YEAR,
  subject: "",
  program: "",
  papers: [
    {
      name: "",
      questionPaperUrl: "",
      markSchemeUrl: ""
    }
  ],
  status: "draft"
})

export default function PastPapersPage() {
  // Core data states
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [adminSubjects, setAdminSubjects] = useState<{id: string, name: string, color: string, isActive: boolean, programs: {id: string, name: string, color: string, isActive: boolean}[]}[]>([])
  
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null)
  
  // Bulk operations
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<PastPaperFormData>(createEmptyFormData())



  // Get programs for selected subject (same logic as lessons page)
  const getAvailablePrograms = (subjectName: string) => {
    const programNames = SUBJECT_PROGRAMS[subjectName] || []
    return programNames.map(programName => ({
      id: programName,
      name: programName,
      color: SUBJECT_COLORS[programName] || '#3B82F6',
      isActive: true
    }))
  }

  // Fetch past papers data
  const fetchPastPapers = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
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

  // Fetch filter options and dynamic subject-programs mapping (same as lessons page)
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



  // CRUD Operations
  const handleCreatePaper = async () => {
    try {
      // Validate required fields
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
      
      // Validate papers
      if (!formData.papers || formData.papers.length === 0) {
        toast.error('At least one paper is required')
        return
      }
      
      for (let i = 0; i < formData.papers.length; i++) {
        const paper = formData.papers[i]
        if (!paper.name.trim()) {
          toast.error(`Paper ${i + 1} name is required`)
          return
        }
        if (!paper.questionPaperUrl.trim()) {
          toast.error(`Paper ${i + 1} question paper URL is required`)
          return
        }
        if (!paper.markSchemeUrl.trim()) {
          toast.error(`Paper ${i + 1} mark scheme URL is required`)
          return
        }
      }

      console.log('Creating past paper with data:', formData)

      const response = await fetch('/api/admin/pastpapers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paperName: formData.paperName,
          board: formData.board,
          year: formData.year,
          subject: formData.subject,
          program: formData.program,
          papers: formData.papers,
          status: formData.status
        })
      })

      console.log('API response status:', response.status)
      
      const data = await response.json()
      console.log('API response data:', data)
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create past paper')
      }
      
      setIsCreateDialogOpen(false)
      setFormData(createEmptyFormData())
      toast.success('Past paper created successfully!')
      
      // Refresh the list
      fetchPastPapers()
    } catch (error) {
      console.error('Error creating past paper:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create past paper')
    }
  }

  const handleEditPaper = (paper: PastPaper) => {
    setSelectedPaper(paper)
    setFormData({
      paperName: paper.paperName,
      board: paper.board,
      year: paper.year,
      subject: paper.subject,
      program: paper.program,
      papers: paper.papers,
      status: paper.status
    })
    setIsEditDialogOpen(true)
  }

  const handleViewPaper = (paper: PastPaper) => {
    setSelectedPaper(paper)
    setIsViewDialogOpen(true)
  }

  const handleUpdatePaper = async () => {
    if (!selectedPaper) return
    
    try {
      const response = await fetch(`/api/admin/pastpapers/${selectedPaper.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paperName: formData.paperName,
          board: formData.board,
          year: formData.year,
          subject: formData.subject,
          program: formData.program,
          papers: formData.papers,
          status: formData.status
        })
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update past paper')
      }
      
      setIsEditDialogOpen(false)
      setSelectedPaper(null)
      setFormData(createEmptyFormData())
      toast.success('Past paper updated successfully!')
      
      // Refresh the list
      fetchPastPapers()
    } catch (error) {
      console.error('Error updating past paper:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update past paper')
    }
  }

  const handleDeletePaper = async (paperId: string) => {
    try {
      const response = await fetch(`/api/admin/pastpapers/${paperId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete past paper')
      }

      toast.success('Past paper deleted successfully!')
      
      // Refresh the list
      fetchPastPapers()
    } catch (error) {
      console.error('Error deleting past paper:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete past paper')
    }
  }

  // Question management functions
  const handleViewQuestions = (paper: PastPaper) => {
    // Navigate to questions page
    window.location.href = `/admin/pastpapers/${paper.id}/questions`
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
              {/* Add Paper Button */}
              <div className="mb-6">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        console.log('Opening create dialog, resetting form...')
                        const newFormData = createEmptyFormData()
                        console.log('New form data:', newFormData)
                        setFormData(newFormData)
                      }}
                      className="bg-blue-500/10 border border-blue-400/30 text-blue-400 
                               hover:bg-blue-500/20 hover:border-blue-400/50 
                               focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400/60
                               rounded-xl transition-all duration-200 h-11 px-6 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Past Paper
                    </Button>
                  </DialogTrigger>
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

          {/* Past Papers Table */}
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
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-slate-300">Paper Name</TableHead>
                      <TableHead className="text-slate-300">Board</TableHead>
                      <TableHead className="text-slate-300">Year</TableHead>
                      <TableHead className="text-slate-300">Subject</TableHead>
                      <TableHead className="text-slate-300">Program</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastPapers.map((paper) => (
                      <>
                        {/* Main Past Paper Row */}
                        <TableRow key={paper.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white font-medium">{paper.paperName}</TableCell>
                          <TableCell className="text-slate-300">{paper.board}</TableCell>
                          <TableCell className="text-slate-300">{paper.year}</TableCell>
                          <TableCell className="text-slate-300">{paper.subject}</TableCell>
                          <TableCell className="text-slate-300">{paper.program}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                paper.status === 'active' 
                                  ? "bg-green-500/15 text-green-400 border-green-400/30" 
                                  : "bg-gray-500/15 text-gray-400 border-gray-400/30"
                              }
                            >
                              {paper.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewQuestions(paper)}
                                className="hover:bg-purple-500/20 text-purple-400"
                                title="View Questions"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewPaper(paper)}
                                className="hover:bg-blue-500/20 text-blue-400"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditPaper(paper)}
                                className="hover:bg-green-500/20 text-green-400"
                                title="Edit Paper"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="hover:bg-red-500/20 text-red-400"
                                    title="Delete Paper"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-800/95 border border-white/20 rounded-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete Past Paper</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                      This will permanently delete "{paper.paperName}". This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-700/80 text-white border-slate-600 hover:bg-slate-600">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeletePaper(paper.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <PastPaperDialog 
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          setSelectedPaper(null)
          setFormData(createEmptyFormData())
        }}
        onSave={selectedPaper ? handleUpdatePaper : handleCreatePaper}
        formData={formData}
        setFormData={setFormData}
        adminSubjects={adminSubjects}
        getAvailablePrograms={getAvailablePrograms}
        editMode={!!selectedPaper}
        title={selectedPaper ? "Edit Past Paper" : "Add Past Paper"}
      />

      {/* View Dialog */}
      <ViewPastPaperDialog 
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false)
          setSelectedPaper(null)
        }}
        paper={selectedPaper}
      />

    </div>
  )
}

// Past Paper Dialog Component
function PastPaperDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  formData, 
  setFormData, 
  adminSubjects, 
  getAvailablePrograms, 
  editMode, 
  title 
}: {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  formData: PastPaperFormData
  setFormData: (data: PastPaperFormData) => void
  adminSubjects: any[]
  getAvailablePrograms: (subject: string) => any[]
  editMode: boolean
  title: string
}) {
  const addPaper = () => {
    setFormData({
      ...formData,
      papers: [...formData.papers, { name: "", questionPaperUrl: "", markSchemeUrl: "" }]
    })
  }

  const removePaper = (index: number) => {
    if (formData.papers.length > 1) {
      setFormData({
        ...formData,
        papers: formData.papers.filter((_, i) => i !== index)
      })
    }
  }

  const updatePaper = (index: number, field: keyof typeof formData.papers[0], value: string) => {
    const updatedPapers = [...formData.papers]
    updatedPapers[index] = { ...updatedPapers[index], [field]: value }
    setFormData({ ...formData, papers: updatedPapers })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-y-auto [&>button]:!hidden">
        <style jsx global>{`
          [data-radix-select-content] {
            z-index: 999999 !important;
          }
          .glass-input:focus {
            outline: none !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) !important;
          }
          .glass-select-trigger:focus {
            outline: none !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) !important;
          }
        `}</style>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl"></div>
        <div className="relative">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 px-6 py-4 -m-6 mb-0 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-white">
                    {title}
                  </DialogTitle>
                  <p className="text-sm text-slate-400 mt-1">
                    {editMode ? "Update past paper information" : "Create a new past paper with question papers and mark schemes"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
      
          {/* Content */}
          <div className="px-6 py-5 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-3 h-3 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">Past Paper Name</label>
                  <Input
                    value={formData.paperName}
                    onChange={(e) => setFormData({ ...formData, paperName: e.target.value })}
                    placeholder="Past paper name"
                    className="h-10 bg-white/5 border border-white/20 text-white placeholder:text-white/40 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">Board</label>
                  <Input
                    value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                    placeholder="Enter board name"
                    className="h-10 bg-white/5 border border-white/20 text-white placeholder:text-white/40 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">Year</label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || CURRENT_YEAR })}
                    placeholder="Enter year"
                    min="1900"
                    max="2100"
                    className="h-10 bg-white/5 border border-white/20 text-white placeholder:text-white/40 rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Subject and Program */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Subject & Program</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">Subject</label>
                  <Select 
                    value={formData.subject}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData, 
                        subject: value,
                        program: ""
                      });
                    }}
                  >
                    <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                      style={{ zIndex: 999999 }}
                    >
                      {adminSubjects
                        .filter(subject => subject.isActive)
                        .map((subject) => (
                          <SelectItem key={subject.id} value={subject.name} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: subject.color }}
                              />
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">Program</label>
                  <Select 
                    value={formData.program} 
                    onValueChange={(value) => setFormData({...formData, program: value})}
                    disabled={!formData.subject}
                  >
                    <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10 disabled:opacity-50">
                      <SelectValue placeholder={formData.subject ? "Select program" : "Select subject first"} />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                      style={{ zIndex: 999999 }}
                    >
                      {formData.subject && adminSubjects
                        .find(subject => subject.name === formData.subject)
                        ?.programs?.filter((program: any) => program.isActive)
                        ?.map((program: any) => (
                          <SelectItem key={program.id} value={program.name} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: program.color }}
                              />
                              {program.name}
                            </div>
                        </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dynamic Papers */}
            {formData.papers.map((paper, index) => {
              const paperNumber = index + 1
              const colors = [
                { bg: 'bg-green-500/20', text: 'text-green-400' },
                { bg: 'bg-orange-500/20', text: 'text-orange-400' },
                { bg: 'bg-blue-500/20', text: 'text-blue-400' },
                { bg: 'bg-purple-500/20', text: 'text-purple-400' },
                { bg: 'bg-pink-500/20', text: 'text-pink-400' },
                { bg: 'bg-cyan-500/20', text: 'text-cyan-400' }
              ]
              const color = colors[index % colors.length]
              
              return (
                <div key={index} className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2">
                    <div className={`w-6 h-6 ${color.bg} rounded-lg flex items-center justify-center`}>
                      <span className={`${color.text} text-xs font-bold`}>{paperNumber}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white/90">Paper {paperNumber}</h3>
                    {formData.papers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePaper(index)}
                        className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg p-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Paper {paperNumber} Name</label>
                      <Input
                        value={paper.name}
                        onChange={(e) => updatePaper(index, 'name', e.target.value)}
                        placeholder={`e.g., Paper ${paperNumber} - ${paperNumber === 1 ? 'Non Calculator' : 'Calculator'}`}
                        className="h-10 bg-white/5 border border-white/20 text-white placeholder:text-white/40 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">Question Paper URL</label>
                        <Input
                          value={paper.questionPaperUrl}
                          onChange={(e) => updatePaper(index, 'questionPaperUrl', e.target.value)}
                          placeholder={`https://example.com/paper${paperNumber}-questions.pdf`}
                          className="h-10 bg-white/5 border border-white/20 text-white placeholder:text-white/40 rounded-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">Mark Scheme URL</label>
                        <Input
                          value={paper.markSchemeUrl}
                          onChange={(e) => updatePaper(index, 'markSchemeUrl', e.target.value)}
                          placeholder={`https://example.com/paper${paperNumber}-markscheme.pdf`}
                          className="h-10 bg-white/5 border border-white/20 text-white placeholder:text-white/40 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add Additional Papers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-3 h-3 text-yellow-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Additional Papers</h3>
                </div>
              </div>
              
              <div className="p-4 border-2 border-dashed border-white/20 rounded-lg text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addPaper}
                  className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Paper {formData.papers.length + 1}
                </Button>
                <p className="text-xs text-slate-400 mt-2">
                  Add another paper to this past paper collection
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-3 h-3 text-cyan-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Status</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">Publication Status</label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'draft' | 'active') => {
                    console.log('Status dropdown clicked!')
                    console.log('Status changed from', formData.status, 'to', value)
                    console.log('Current form data before change:', formData)
                    const updatedFormData = { ...formData, status: value }
                    setFormData(updatedFormData)
                    console.log('Updated form data:', updatedFormData)
                  }}
                >
                  <SelectTrigger className="glass-select-trigger h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                    style={{ zIndex: 999999 }}
                  >
                    <SelectItem value="draft" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>Draft</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="active" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Active</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900/50 px-6 py-4 -m-6 mt-0 border-t border-white/10 flex gap-3 justify-end">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose} 
              className="bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/30 h-10 px-4 rounded-lg"
            >
              <X className="w-3 h-3 mr-2" />
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                console.log('Create button clicked, current formData:', formData)
                onSave()
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       text-white h-10 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Check className="w-3 h-3 mr-2" />
              {editMode ? "Update Past Paper" : "Create Past Paper"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// View Dialog Component
function ViewPastPaperDialog({ 
  isOpen, 
  onClose, 
  paper 
}: {
  isOpen: boolean
  onClose: () => void
  paper: PastPaper | null
}) {
  if (!paper) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl overflow-y-auto [&>button]:!hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl"></div>
        <div className="relative">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 px-6 py-4 -m-6 mb-0 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-white">
                    {paper.paperName}
                  </DialogTitle>
                  <p className="text-sm text-slate-400 mt-1">
                    {paper.board} • {paper.year} • {paper.subject}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 py-5 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Board</p>
                <p className="text-white font-medium">{paper.board}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Year</p>
                <p className="text-white font-medium">{paper.year}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Subject</p>
                <p className="text-white font-medium">{paper.subject}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Program</p>
                <p className="text-white font-medium">{paper.program}</p>
              </div>
            </div>

            {/* Papers */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Papers & Resources</h3>
              
              {paper.papers.map((paperItem, index) => {
                const paperNumber = index + 1
                const colors = [
                  { bg: 'bg-green-500/20', text: 'text-green-400' },
                  { bg: 'bg-orange-500/20', text: 'text-orange-400' },
                  { bg: 'bg-blue-500/20', text: 'text-blue-400' },
                  { bg: 'bg-purple-500/20', text: 'text-purple-400' },
                  { bg: 'bg-pink-500/20', text: 'text-pink-400' },
                  { bg: 'bg-cyan-500/20', text: 'text-cyan-400' }
                ]
                const color = colors[index % colors.length]

                return (
                  <div key={index} className="bg-white/5 rounded-lg p-4">
                    <h4 className={`${color.text} font-medium mb-3 flex items-center gap-2`}>
                      <span className={`w-6 h-6 ${color.bg} rounded-full flex items-center justify-center text-xs`}>{paperNumber}</span>
                      {paperItem.name || `Paper ${paperNumber}`}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <a 
                        href={paperItem.questionPaperUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400">Question Paper</span>
                      </a>
                      <a 
                        href={paperItem.markSchemeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400">Mark Scheme</span>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



