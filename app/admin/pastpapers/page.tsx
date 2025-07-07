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
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, FileText, Settings, Calendar, ChevronLeft, ChevronRight, MoreHorizontal, CheckSquare, Square, AlertTriangle, Check, X, Download, PlayCircle, ChevronDown, ChevronUp, FolderOpen, FileTextIcon, RotateCcw, ExternalLink, GripVertical } from "lucide-react"
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

// Utility function to ensure URL has proper protocol
const ensureUrlProtocol = (url: string): string => {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // Default to https for URLs without protocol
  return `https://${url}`
}

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
  
  // Board management states
  const [customBoards, setCustomBoards] = useState<string[]>([])
  const [isCreatingNewBoard, setIsCreatingNewBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  
  // Form states
  const [formData, setFormData] = useState<PastPaperFormData>(createEmptyFormData())
  const [paperFormData, setPaperFormData] = useState<PaperFormData>(createEmptyPaperData())

  // Drag and drop states
  const [draggedItem, setDraggedItem] = useState<{pastPaperId: string, paperIndex: number} | null>(null)
  const [dragOverItem, setDragOverItem] = useState<{pastPaperId: string, paperIndex: number} | null>(null)

  // Load custom boards from localStorage on component mount
  useEffect(() => {
    const savedBoards = localStorage.getItem('customBoards')
    if (savedBoards) {
      try {
        const boards = JSON.parse(savedBoards)
        setCustomBoards(Array.isArray(boards) ? boards : [])
      } catch (error) {
        console.error('Failed to load custom boards:', error)
      }
    }
  }, [])

  // Save custom boards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customBoards', JSON.stringify(customBoards))
  }, [customBoards])

  // Get all available boards (only custom boards now)
  const getAllBoards = () => {
    return customBoards.sort()
  }

  // Handle creating new board
  const handleCreateNewBoard = () => {
    if (newBoardName.trim() && !getAllBoards().includes(newBoardName.trim())) {
      const newBoard = newBoardName.trim()
      setCustomBoards(prev => [...prev, newBoard])
      setFormData({...formData, board: newBoard})
      setNewBoardName("")
      setIsCreatingNewBoard(false)
      toast.success(`Board "${newBoard}" created successfully!`)
    } else if (getAllBoards().includes(newBoardName.trim())) {
      toast.error('Board already exists!')
    }
  }

  // Handle deleting a board
  const handleDeleteBoard = (boardToDelete: string) => {
    setCustomBoards(prev => prev.filter(board => board !== boardToDelete))
    // If the deleted board was selected, clear the selection
    if (formData.board === boardToDelete) {
      setFormData({...formData, board: ""})
    }
    if (selectedBoard === boardToDelete) {
      setSelectedBoard("all")
    }
    toast.success(`Board "${boardToDelete}" deleted successfully!`)
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, pastPaperId: string, paperIndex: number) => {
    setDraggedItem({ pastPaperId, paperIndex })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
    
    // Add some visual feedback
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5'
      }
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent, pastPaperId: string, paperIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    // Only allow dropping within the same past paper
    if (draggedItem && draggedItem.pastPaperId === pastPaperId) {
      setDragOverItem({ pastPaperId, paperIndex })
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverItem(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, pastPaperId: string, paperIndex: number) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.pastPaperId !== pastPaperId) return
    
    const fromIndex = draggedItem.paperIndex
    const toIndex = paperIndex
    
    if (fromIndex === toIndex) return

    // Find the past paper
    const pastPaper = pastPapers.find(pp => pp.id === pastPaperId)
    if (!pastPaper || !pastPaper.papers) return

    const papers = [...pastPaper.papers]
    
    // Remove the dragged item and insert it at the new position
    const draggedPaper = papers.splice(fromIndex, 1)[0]
    papers.splice(toIndex, 0, draggedPaper)

    try {
      const response = await fetch(`/api/admin/pastpapers/${pastPaperId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...pastPaper,
          papers: papers
        })
      })

      if (response.ok) {
        toast.success('Papers reordered successfully!')
        await fetchPastPapers()
      } else {
        toast.error('Failed to reorder papers')
      }
    } catch (error) {
      console.error('Error reordering papers:', error)
      toast.error('Failed to reorder papers')
    }

    // Clear drag states
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1'
    }
    
    // Clear drag states
    setDraggedItem(null)
    setDragOverItem(null)
  }

  // Navigate to questions management for specific paper
  const handleManageQuestions = (pastPaper: PastPaper, paperIndex: number) => {
    window.location.href = `/admin/pastpapers/${pastPaper.id}/questions?paper=${paperIndex}`
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Global styles for select components and dialogs */}
      <style jsx global>{`
        [data-radix-select-content] {
          z-index: 999999 !important;
        }
        [data-radix-select-trigger] {
          z-index: 1 !important;
        }
        .glass-input {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
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
        
        /* COMPREHENSIVE DIALOG CLOSE BUTTON HIDING - More Specific Selectors */
        
        /* Hide by Radix UI data attributes - ONLY inside dialogs */
        [data-radix-dialog-content] [data-radix-dialog-close] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Hide by aria-label - ONLY inside dialogs */
        [data-radix-dialog-content] button[aria-label="Close"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Hide by role and type - ONLY inside dialogs */
        [data-radix-dialog-content] button[role="button"][type="button"]:has(svg):not([class*="bg-"]):not([class*="border-"]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Hide by absolute positioning in top-right corner */
        [data-radix-dialog-content] > button.absolute {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Hide by position and z-index patterns - ONLY inside dialogs */
        [data-radix-dialog-content] button[style*="position: absolute"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Hide by common close button class patterns - ONLY inside dialogs */
        [data-radix-dialog-content] button[class*="close"]:not([class*="Clear"]):not([class*="clear"]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Most specific: Hide default radix close button that appears in top-right */
        [data-radix-dialog-content] > button:not([class*="bg-"]):not([class*="gradient"]):not([class*="Clear"]):not([class*="clear"]):not([class*="border-"]):not([class*="outline"]):not([class*="hover:bg-"]):not([class*="text-"]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      
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
                  <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border-white/20 max-w-4xl max-h-[90vh] overflow-hidden [&>button]:!hidden">
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl"></div>
                    <div className="relative">
                      {/* Header */}
                      <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl px-6 py-4 -m-6 mb-0 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                              <Plus className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <DialogTitle className="text-xl font-semibold text-white">Create New Past Paper</DialogTitle>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData(createEmptyFormData())}
                              className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 px-3 text-xs transition-all duration-200"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Clear All
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsCreateDialogOpen(false)}
                              className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0 transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </DialogHeader>

                      {/* Content */}
                      <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 pb-2">
                            <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <FileText className="w-3 h-3 text-blue-400" />
                            </div>
                            <h3 className="text-sm font-medium text-white/90">Basic Information</h3>
                          </div>
                          
                          {/* Paper Name - Full Width */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-white/80 block">
                              Paper Name *
                            </label>
                            <Input 
                              placeholder="e.g., Mathematics Paper" 
                              value={formData.paperName}
                              onChange={(e) => setFormData({...formData, paperName: e.target.value})}
                              className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                                       rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                            />
                          </div>

                          {/* Board and Year */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-white/80 block">
                                Board *
                              </label>
                              <div className="relative">
                                {isCreatingNewBoard ? (
                                  <div className="flex gap-2">
                                    <Input 
                                      placeholder="Enter new board name" 
                                      value={newBoardName}
                                      onChange={(e) => setNewBoardName(e.target.value)}
                                      className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                                               rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                                    />
                                    <Button
                                      size="sm"
                                      onClick={handleCreateNewBoard}
                                      disabled={!newBoardName.trim() || getAllBoards().includes(newBoardName.trim())}
                                      className="bg-green-600 hover:bg-green-700 text-white h-9 px-3 text-xs"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setIsCreatingNewBoard(false)
                                        setNewBoardName("")
                                      }}
                                      className="border-white/20 text-white hover:bg-white/10 h-9 px-3 text-xs"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <Select value={formData.board} onValueChange={(value) => {
                                      if (value === "create_new") {
                                        setIsCreatingNewBoard(true)
                                      } else {
                                        setFormData({...formData, board: value})
                                      }
                                    }}>
                                      <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                                        <SelectValue placeholder="Select board" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999] min-w-[250px]">
                                        {getAllBoards().length === 0 ? (
                                          <div className="p-4 text-center space-y-3">
                                            <div className="text-slate-400 text-sm leading-relaxed">
                                              No boards created yet.<br />
                                              <span className="text-slate-500 text-xs">Create your first board below</span>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="space-y-1 p-1">
                                            {getAllBoards().map((board) => (
                                              <div key={board} className="relative group">
                                                <SelectItem 
                                                  value={board} 
                                                  className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm pr-10
                                                           rounded-lg transition-all duration-200 border-0 outline-none"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                    {board}
                                                  </div>
                                                </SelectItem>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleDeleteBoard(board)
                                                  }}
                                                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                                                           transition-all duration-200 h-6 w-6 p-0 text-red-400 hover:text-red-300 
                                                           hover:bg-red-500/20 rounded-md"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        <div className="border-t border-white/10 mt-2 pt-1">
                                          <SelectItem value="create_new" className="text-green-400 hover:bg-green-500/10 focus:bg-green-500/10 
                                                                                 rounded-lg transition-all duration-200 border-0">
                                            <div className="flex items-center gap-2">
                                              <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                                                <Plus className="w-2.5 h-2.5 text-green-400" />
                                              </div>
                                              <span className="font-medium">Create New Board</span>
                                            </div>
                                          </SelectItem>
                                        </div>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-white/80 block">
                                Year *
                              </label>
                              <Select value={formData.year.toString()} onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}>
                                <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                                       rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999] max-h-48">
                                  {Array.from({length: 30}, (_, i) => CURRENT_YEAR - i).map((year) => (
                                    <SelectItem key={year} value={year.toString()} className="text-white hover:bg-white/10">
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Subject and Program */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-white/80 block">
                                Subject *
                              </label>
                              <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value, program: ""})}>
                                <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                                       rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
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
                              <label className="text-xs font-medium text-white/80 block">
                                Program *
                              </label>
                              <Select 
                                value={formData.program} 
                                onValueChange={(value) => setFormData({...formData, program: value})}
                                disabled={!formData.subject}
                              >
                                <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                                       rounded-lg text-sm transition-all duration-200 hover:bg-white/10 disabled:opacity-50">
                                  <SelectValue placeholder={formData.subject ? "Select program" : "Select subject first"} />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                                  {formData.subject && SUBJECT_PROGRAMS[formData.subject as keyof typeof SUBJECT_PROGRAMS]?.map((program) => (
                                    <SelectItem key={program} value={program} className="text-white hover:bg-white/10">
                                      {program}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-white/80 block">
                              Status *
                            </label>
                            <Select value={formData.status} onValueChange={(value: 'draft' | 'active') => setFormData({...formData, status: value})}>
                              <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                                     rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                                <SelectItem value="draft" className="text-white hover:bg-white/10">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    Draft
                                  </div>
                                </SelectItem>
                                <SelectItem value="active" className="text-white hover:bg-white/10">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    Active
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 -m-6 mt-0 border-t border-white/10 flex gap-3 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)} 
                          className="bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                                   h-9 px-4 rounded-lg text-sm transition-all duration-200"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                                   text-white disabled:opacity-50 disabled:cursor-not-allowed h-9 px-6 rounded-lg text-sm
                                   transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                          onClick={handleCreatePastPaper}
                          disabled={!formData.paperName || !formData.board || !formData.subject || !formData.program}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Create Past Paper
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        All Subjects
                      </div>
                    </SelectItem>
                    {adminSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name} className="text-white hover:bg-white/10 focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                  <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white">
                    <SelectValue placeholder="Filter by Board" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999] min-w-[200px]">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        All Boards
                      </div>
                    </SelectItem>
                    {getAllBoards().length === 0 ? (
                      <div className="p-3 text-center">
                        <div className="text-slate-500 text-xs">
                          No custom boards yet
                        </div>
                      </div>
                    ) : (
                      getAllBoards().map((board) => (
                        <SelectItem key={board} value={board} className="text-white hover:bg-white/10 focus:bg-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            {board}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white">
                    <SelectValue placeholder="Filter by Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999] max-h-48">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        All Years
                      </div>
                    </SelectItem>
                    {Array.from({length: 30}, (_, i) => CURRENT_YEAR - i).map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-white hover:bg-white/10 focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          {year}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        All Status
                      </div>
                    </SelectItem>
                    <SelectItem value="active" className="text-white hover:bg-white/10 focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="draft" className="text-white hover:bg-white/10 focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        Draft
                      </div>
                    </SelectItem>
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
                                  <div
                                    key={index}
                                    className={`p-4 border-b border-white/5 last:border-b-0 ml-12 
                                               ${draggedItem?.pastPaperId === pastPaper.id && draggedItem.paperIndex === index ? 'opacity-50' : ''}
                                               ${dragOverItem?.pastPaperId === pastPaper.id && dragOverItem.paperIndex === index ? 'bg-blue-500/10' : ''}`}
                                    onDragStart={(e) => handleDragStart(e, pastPaper.id, index)}
                                    onDragOver={(e) => handleDragOver(e, pastPaper.id, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, pastPaper.id, index)}
                                    onDragEnd={handleDragEnd}
                                    draggable={true}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors">
                                          <GripVertical className="w-4 h-4 text-slate-400 hover:text-white" />
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                          <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center text-xs font-medium text-purple-400">
                                            {index + 1}
                                          </div>
                                          <div className="text-xs text-slate-500">
                                            Paper
                                          </div>
                                        </div>
                                        <FileTextIcon className="w-4 h-4 text-purple-400" />
                                        <div>
                                          <h4 className="text-white font-medium">{paper.name}</h4>
                                          <div className="flex items-center gap-4 text-xs mt-2">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                window.open(ensureUrlProtocol(paper.questionPaperUrl), '_blank', 'noopener,noreferrer')
                                              }}
                                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 
                                                       border border-blue-500/30 hover:border-blue-500/50 rounded-lg
                                                       text-blue-400 hover:text-blue-300 transition-all duration-200"
                                            >
                                              <FileTextIcon className="w-3 h-3" />
                                              Question Paper
                                              <ExternalLink className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                window.open(ensureUrlProtocol(paper.markSchemeUrl), '_blank', 'noopener,noreferrer')
                                              }}
                                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 
                                                       border border-green-500/30 hover:border-green-500/50 rounded-lg
                                                       text-green-400 hover:text-green-300 transition-all duration-200"
                                            >
                                              <CheckSquare className="w-3 h-3" />
                                              Mark Scheme
                                              <ExternalLink className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
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
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border-white/20 max-w-3xl max-h-[90vh] overflow-hidden [&>button]:!hidden">
          
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 rounded-3xl"></div>
          <div className="relative">
            {/* Header */}
            <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl px-6 py-4 -m-6 mb-0 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-white">
                      Add Paper to "{selectedPastPaper?.paperName}"
                    </DialogTitle>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaperFormData(createEmptyPaperData())}
                    className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 px-3 text-xs transition-all duration-200"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddPaperDialogOpen(false)}
                    className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Paper Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-3 h-3 text-green-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Paper Information</h3>
                </div>
                
                {/* Paper Name */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Paper Name *
                  </label>
                  <Input 
                    placeholder="e.g., Paper 1, Paper 2, etc." 
                    value={paperFormData.name}
                    onChange={(e) => setPaperFormData({...paperFormData, name: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>

                {/* URLs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">
                      Question Paper URL *
                    </label>
                    <Input 
                      placeholder="https://example.com/question-paper.pdf or www.example.com/paper.pdf" 
                      value={paperFormData.questionPaperUrl}
                      onChange={(e) => setPaperFormData({...paperFormData, questionPaperUrl: e.target.value})}
                      className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                               rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                    />
                    {paperFormData.questionPaperUrl && !paperFormData.questionPaperUrl.startsWith('http') && (
                      <p className="text-xs text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Will open as: https://{paperFormData.questionPaperUrl}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">
                      Mark Scheme URL *
                    </label>
                    <Input 
                      placeholder="https://example.com/mark-scheme.pdf or www.example.com/marks.pdf" 
                      value={paperFormData.markSchemeUrl}
                      onChange={(e) => setPaperFormData({...paperFormData, markSchemeUrl: e.target.value})}
                      className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                               rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                    />
                    {paperFormData.markSchemeUrl && !paperFormData.markSchemeUrl.startsWith('http') && (
                      <p className="text-xs text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Will open as: https://{paperFormData.markSchemeUrl}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 -m-6 mt-0 border-t border-white/10 flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsAddPaperDialogOpen(false)} 
                className="bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                         h-9 px-4 rounded-lg text-sm transition-all duration-200"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 
                         text-white disabled:opacity-50 disabled:cursor-not-allowed h-9 px-6 rounded-lg text-sm
                         transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                onClick={handleAddPaper}
                disabled={!paperFormData.name || !paperFormData.questionPaperUrl || !paperFormData.markSchemeUrl}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Paper
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



