"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Video, Plus, Search, Filter, Edit, Trash2, Eye, Play, Users, Clock, Star, Upload, ChevronLeft, ChevronRight, ChevronDown, Loader2, Download, MoreHorizontal, CheckSquare, Square, AlertTriangle, Check, X, FileText, Settings, Calendar, RotateCcw, Archive } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Constants
const ITEMS_PER_PAGE = 10

// Dynamic subject-programs mapping (loaded from database)
let SUBJECT_PROGRAMS: Record<string, string[]> = {}
let SUBJECT_COLORS: Record<string, string> = {}

// Types
interface TopicVault {
  _id?: string
  id: string
  videoName: string
  topic: string
  subject: string
  program: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description: string
  zoomLink?: string
  videoEmbedLink: string
  status: 'draft' | 'active'
  createdAt: string
  updatedAt: string
}

interface TopicVaultFormData {
  videoName: string
  topic: string
  subject: string
  program: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description: string
  zoomLink: string
  videoEmbedLink: string
  status: 'draft' | 'active'
}

interface PaginatedTopicVaults {
  topicVaults: TopicVault[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Utility functions
const createEmptyFormData = (): TopicVaultFormData => ({
  videoName: "",
  topic: "",
  subject: "",
  program: "",
  type: "Lesson",
  duration: "",
  teacher: "",
  description: "",
  zoomLink: "",
  videoEmbedLink: "",
  status: "draft"
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Lesson': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'Tutorial': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'Workshop': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export default function TopicVaultPage() {
  // Core data states
  const [topicVaults, setTopicVaults] = useState<TopicVault[]>([])
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<string[]>([])
  const [teachers, setTeachers] = useState<string[]>([])
  const [programs, setPrograms] = useState<string[]>([])
  
  // Add state for admin subjects
  const [adminSubjects, setAdminSubjects] = useState<{id: string, name: string, color: string, isActive: boolean}[]>([])

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedTeacher, setSelectedTeacher] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedProgram, setSelectedProgram] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTopicVaults, setTotalTopicVaults] = useState(0)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedTopicVault, setSelectedTopicVault] = useState<TopicVault | null>(null)
  
  // Bulk operations
  const [selectedTopicVaults, setSelectedTopicVaults] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<TopicVaultFormData>(createEmptyFormData())

  // Fetch topic vaults data
  const fetchTopicVaults = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: searchTerm,
        subject: selectedSubject,
        teacher: selectedTeacher,
        status: selectedStatus,
        type: selectedType,
        program: selectedProgram
      })

      const response = await fetch(`/api/admin/topic-vault?${params}`)
      if (!response.ok) throw new Error('Failed to fetch topic vaults')
      
      const data: PaginatedTopicVaults = await response.json()
      setTopicVaults(data.topicVaults)
      setTotalPages(data.totalPages)
      setTotalTopicVaults(data.total)
    } catch (error) {
      console.error('Error fetching topic vaults:', error)
      toast.error('Failed to fetch topic vaults')
    } finally {
      setLoading(false)
    }
  }

  // Fetch filter options and dynamic subject-programs mapping
  const fetchFilterOptions = async () => {
    try {
      const [subjectsRes, teachersRes, programsRes, subjectProgramsRes, adminSubjectsRes] = await Promise.all([
        fetch('/api/admin/topic-vault/filters/subjects'),
        fetch('/api/admin/topic-vault/filters/teachers'),
        fetch('/api/admin/topic-vault/filters/programs'),
        fetch('/api/admin/subjects/programs-map'),
        fetch('/api/admin/subjects')
      ])
      
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json()
        setSubjects(subjectsData.subjects || [])
      }
      
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData.teachers || [])
      }

      if (programsRes.ok) {
        const programsData = await programsRes.json()
        setPrograms(programsData.programs || [])
      }

      if (subjectProgramsRes.ok) {
        const subjectProgramsData = await subjectProgramsRes.json()
        if (subjectProgramsData.success) {
          SUBJECT_PROGRAMS = subjectProgramsData.subjectPrograms || {}
          SUBJECT_COLORS = subjectProgramsData.subjectColors || {}
        }
      }

      if (adminSubjectsRes.ok) {
        const adminSubjectsData = await adminSubjectsRes.json()
        if (adminSubjectsData.success) {
          setAdminSubjects(adminSubjectsData.subjects || [])
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  // Effect hooks
  useEffect(() => {
    fetchTopicVaults()
  }, [currentPage, searchTerm, selectedSubject, selectedTeacher, selectedStatus, selectedType, selectedProgram])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // CRUD Operations
  const handleCreateTopicVault = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/topic-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          description: formData.description || '',
          zoomLink: formData.zoomLink || '',
          status: formData.status || 'draft'
        })
      })

      if (!response.ok) throw new Error('Failed to create topic vault')
      
      toast.success('Topic vault created successfully!')
      setIsCreateDialogOpen(false)
      setFormData(createEmptyFormData())
      
      // Refresh data and filters
      await Promise.all([
        fetchTopicVaults(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error creating topic vault:', error)
      toast.error('Failed to create topic vault')
    }
  }, [formData])

  const handleUpdateTopicVault = useCallback(async () => {
    if (!selectedTopicVault) return
    
    try {
      const response = await fetch(`/api/admin/topic-vault/${selectedTopicVault.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          description: formData.description || '',
          zoomLink: formData.zoomLink || '',
          status: formData.status || 'draft'
        })
      })

      if (!response.ok) throw new Error('Failed to update topic vault')
      
      toast.success('Topic vault updated successfully!')
      setIsEditDialogOpen(false)
      setSelectedTopicVault(null)
      setFormData(createEmptyFormData())
      
      // Refresh data and filters
      await Promise.all([
        fetchTopicVaults(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error updating topic vault:', error)
      toast.error('Failed to update topic vault')
    }
  }, [selectedTopicVault, formData])

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [topicVaultToDelete, setTopicVaultToDelete] = useState<string | null>(null)

  const confirmDeleteTopicVault = useCallback((topicVaultId: string) => {
    setTopicVaultToDelete(topicVaultId)
    setDeleteConfirmOpen(true)
  }, [])

  const handleDeleteTopicVault = useCallback(async () => {
    if (!topicVaultToDelete) return
    
    try {
      const response = await fetch(`/api/admin/topic-vault/${topicVaultToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete topic vault')
      
      toast.success('Topic vault deleted successfully!')
      
      // Refresh data and filters
      await Promise.all([
        fetchTopicVaults(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error deleting topic vault:', error)
      toast.error('Failed to delete topic vault')
    } finally {
      setDeleteConfirmOpen(false)
      setTopicVaultToDelete(null)
    }
  }, [topicVaultToDelete])

  // Event handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }, [])

  const handleSubjectFilter = useCallback((value: string) => {
    setSelectedSubject(value)
    setCurrentPage(1)
  }, [])

  const handleTeacherFilter = useCallback((value: string) => {
    setSelectedTeacher(value)
    setCurrentPage(1)
  }, [])

  const handleStatusFilter = useCallback((value: string) => {
    setSelectedStatus(value)
    setCurrentPage(1)
  }, [])

  const handleTypeFilter = useCallback((value: string) => {
    setSelectedType(value)
    setCurrentPage(1)
  }, [])

  const handleProgramFilter = useCallback((value: string) => {
    setSelectedProgram(value)
    setCurrentPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedSubject("all")
    setSelectedTeacher("all")
    setSelectedStatus("all")
    setSelectedType("all")
    setSelectedProgram("all")
    setCurrentPage(1)
  }, [])

  const handleEditTopicVault = useCallback((topicVault: TopicVault) => {
    setSelectedTopicVault(topicVault)
    setFormData({
      videoName: topicVault.videoName || "",
      topic: topicVault.topic || "",
      subject: topicVault.subject || "",
      program: topicVault.program || "",
      type: topicVault.type || "Lesson",
      duration: topicVault.duration || "",
      teacher: topicVault.teacher || "",
      description: topicVault.description || "",
      zoomLink: topicVault.zoomLink || "",
      videoEmbedLink: topicVault.videoEmbedLink || "",
      status: topicVault.status || "draft"
    })

    setIsEditDialogOpen(true)
  }, [])

  const handleViewTopicVault = useCallback((topicVault: TopicVault) => {
    setSelectedTopicVault(topicVault)
    setIsViewDialogOpen(true)
  }, [])

  // Bulk operations
  const handleSelectTopicVault = useCallback((topicVaultId: string) => {
    setSelectedTopicVaults(prev => 
      prev.includes(topicVaultId) 
        ? prev.filter(id => id !== topicVaultId)
        : [...prev, topicVaultId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedTopicVaults.length === topicVaults.length) {
      setSelectedTopicVaults([])
    } else {
      setSelectedTopicVaults(topicVaults.map(topicVault => topicVault.id))
    }
  }, [selectedTopicVaults.length, topicVaults])

  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const confirmBulkDelete = useCallback(() => {
    if (selectedTopicVaults.length === 0) return
    setBulkDeleteConfirmOpen(true)
  }, [selectedTopicVaults.length])

  const handleBulkDelete = useCallback(async () => {
    if (selectedTopicVaults.length === 0) return
    
    setBulkActionLoading(true)
    try {
      const deletePromises = selectedTopicVaults.map(id => 
        fetch(`/api/admin/topic-vault/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      toast.success(`Successfully deleted ${selectedTopicVaults.length} topic vaults`)
      setSelectedTopicVaults([])
      
      // Refresh data and filters
      await Promise.all([
        fetchTopicVaults(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error bulk deleting topic vaults:', error)
      toast.error('Failed to delete selected topic vaults')
    } finally {
      setBulkActionLoading(false)
      setBulkDeleteConfirmOpen(false)
    }
  }, [selectedTopicVaults])

  // Get available programs for selected subject
  const getAvailablePrograms = useMemo(() => {
    if (!formData.subject || formData.subject === 'all') return []
    return SUBJECT_PROGRAMS[formData.subject] || []
  }, [formData.subject])

  // Pagination component
  const PaginationControls = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalTopicVaults)} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalTopicVaults)} of {totalTopicVaults} results
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="glass-button"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + Math.max(1, currentPage - 2)
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={currentPage === page ? "glass-button-active" : "glass-button"}
              >
                {page}
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="glass-button"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/50 to-purple-900 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-800/30 via-transparent to-purple-800/30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none" />
      
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-14 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden">
          {/* Enhanced Header */}
          <div className="mb-6 lg:mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Video className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="text-xs lg:text-sm text-blue-300 font-medium tracking-wider uppercase">Admin Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 tracking-tight">
              Topic Vault Management
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
              Create, edit, and manage topic vault videos with advanced analytics and insights
            </p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto animate-pulse"></div>
          </div>

          {/* Enhanced Filters Section */}
          <Card className="mb-6 lg:mb-8 glass-card-transparent border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Filter className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">Filters & Search</CardTitle>
                    <p className="text-sm text-muted-foreground">Filter and search through topic vaults</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleClearFilters}
                    variant="ghost"
                    size="sm"
                    className="glass-button text-blue-400 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search topic vaults by name, topic, subject, teacher..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="glass-input pl-10 h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Subject Filter */}
                <Select value={selectedSubject} onValueChange={handleSubjectFilter}>
                  <SelectTrigger className="glass-select-trigger h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Teacher Filter */}
                <Select value={selectedTeacher} onValueChange={handleTeacherFilter}>
                  <SelectTrigger className="glass-select-trigger h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white">
                    <SelectValue placeholder="All Teachers" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">All Teachers</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher} value={teacher} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                        {teacher}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Program Filter */}
                <Select value={selectedProgram} onValueChange={handleProgramFilter}>
                  <SelectTrigger className="glass-select-trigger h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white">
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program} value={program} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={selectedType} onValueChange={handleTypeFilter}>
                  <SelectTrigger className="glass-select-trigger h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">All Types</SelectItem>
                    <SelectItem value="Lesson" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Lesson</SelectItem>
                    <SelectItem value="Tutorial" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Tutorial</SelectItem>
                    <SelectItem value="Workshop" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Workshop</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="glass-select-trigger h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">All Status</SelectItem>
                    <SelectItem value="active" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Active</SelectItem>
                    <SelectItem value="draft" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Action Bar */}
          <Card className="mb-6 lg:mb-8 glass-card-transparent border-white/10 backdrop-blur-xl shadow-2xl">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Archive className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Topic Vault Library</h3>
                      <p className="text-sm text-muted-foreground">
                        {totalTopicVaults} total topic vaults
                      </p>
                    </div>
                  </div>
                  
                  {selectedTopicVaults.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {selectedTopicVaults.length} selected
                      </Badge>
                      <Button
                        onClick={confirmBulkDelete}
                        variant="destructive"
                        size="sm"
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                        disabled={bulkActionLoading}
                      >
                        {bulkActionLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete Selected
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Topic Vault
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Topic Vaults Table */}
          <Card className="glass-card-transparent border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Video className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Topic Vaults</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage your topic vault library</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  <span className="ml-2 text-muted-foreground">Loading topic vaults...</span>
                </div>
              ) : topicVaults.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No topic vaults found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedSubject !== 'all' || selectedTeacher !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || selectedProgram !== 'all'
                      ? 'No topic vaults match your current filters.'
                      : 'Get started by creating your first topic vault.'}
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Topic Vault
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableHead className="w-12">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                className="w-6 h-6 p-0 hover:bg-white/10"
                              >
                                {selectedTopicVaults.length === topicVaults.length && topicVaults.length > 0 ? (
                                  <CheckSquare className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </TableHead>
                          <TableHead className="text-white font-medium">Video Name</TableHead>
                          <TableHead className="text-white font-medium">Topic</TableHead>
                          <TableHead className="text-white font-medium">Subject</TableHead>
                          <TableHead className="text-white font-medium">Program</TableHead>
                          <TableHead className="text-white font-medium">Type</TableHead>
                          <TableHead className="text-white font-medium">Teacher</TableHead>
                          <TableHead className="text-white font-medium">Duration</TableHead>
                          <TableHead className="text-white font-medium">Status</TableHead>
                          <TableHead className="text-white font-medium">Created</TableHead>
                          <TableHead className="text-white font-medium w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topicVaults.map((topicVault) => (
                          <TableRow key={topicVault.id} className="border-white/10 hover:bg-white/5 transition-colors">
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSelectTopicVault(topicVault.id)}
                                  className="w-6 h-6 p-0 hover:bg-white/10"
                                >
                                  {selectedTopicVaults.includes(topicVault.id) ? (
                                    <CheckSquare className="w-4 h-4 text-blue-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                  <Video className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-white">{topicVault.videoName}</div>
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {topicVault.description || 'No description'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-white">{topicVault.topic}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-white">{topicVault.subject}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-white">{topicVault.program}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getTypeColor(topicVault.type)} border text-xs`}>
                                {topicVault.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-white">{topicVault.teacher}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-white">{topicVault.duration}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(topicVault.status)} border text-xs`}>
                                {topicVault.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(topicVault.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewTopicVault(topicVault)}
                                        className="w-8 h-8 p-0 hover:bg-white/10"
                                      >
                                        <Eye className="w-4 h-4 text-blue-400" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View details</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditTopicVault(topicVault)}
                                        className="w-8 h-8 p-0 hover:bg-white/10"
                                      >
                                        <Edit className="w-4 h-4 text-yellow-400" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit topic vault</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => confirmDeleteTopicVault(topicVault.id)}
                                        className="w-8 h-8 p-0 hover:bg-white/10"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete topic vault</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <PaginationControls />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Topic Vault Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center">
              <Plus className="w-5 h-5 mr-2 text-blue-400" />
              Create New Topic Vault
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 py-5 space-y-5">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Video className="w-3 h-3 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Basic Information</h3>
              </div>
              
              {/* Video Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  Video Name
                </label>
                <Input 
                  placeholder="Enter video name" 
                  value={formData.videoName}
                  onChange={(e) => setFormData({...formData, videoName: e.target.value})}
                  className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                />
              </div>

              {/* Topic and Subject */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Topic
                  </label>
                  <Input 
                    placeholder="Enter topic" 
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Subject
                  </label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData({...formData, subject: value, program: ''})}
                  >
                    <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                      style={{ zIndex: 999999 }}
                    >
                      {adminSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  Description
                </label>
                <Textarea 
                  placeholder="Enter description (optional)" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="glass-input min-h-[80px] bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10 resize-none" 
                  rows={3}
                />
              </div>

              {/* Program and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Program
                  </label>
                  <Select 
                    value={formData.program} 
                    onValueChange={(value) => setFormData({...formData, program: value})}
                    disabled={!formData.subject}
                  >
                    <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                      style={{ zIndex: 999999 }}
                    >
                      {getAvailablePrograms.map((program) => (
                        <SelectItem key={program} value={program} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Type
                  </label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value as 'Lesson' | 'Tutorial' | 'Workshop'})}
                  >
                    <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                      style={{ zIndex: 999999 }}
                    >
                      <SelectItem value="Lesson" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        Lesson
                      </SelectItem>
                      <SelectItem value="Tutorial" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        Tutorial
                      </SelectItem>
                      <SelectItem value="Workshop" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        Workshop
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration and Teacher */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Duration
                  </label>
                  <Input 
                    placeholder="e.g., 45 minutes" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Teacher
                  </label>
                  <Input 
                    placeholder="Enter teacher name" 
                    value={formData.teacher}
                    onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
              </div>

              {/* Video Links */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Play className="w-3 h-3 text-purple-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Video Links</h3>
                </div>

                {/* Video Embed Link */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Video Embed Link
                  </label>
                  <Input 
                    placeholder="Enter video embed link (required)" 
                    value={formData.videoEmbedLink}
                    onChange={(e) => setFormData({...formData, videoEmbedLink: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>

                {/* Zoom Link */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Zoom Link (Optional)
                  </label>
                  <Input 
                    placeholder="Enter zoom link (optional)" 
                    value={formData.zoomLink}
                    onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  Status
                </label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value as 'draft' | 'active'})}
                >
                  <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                    style={{ zIndex: 999999 }}
                  >
                    <SelectItem value="draft" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                      Draft
                    </SelectItem>
                    <SelectItem value="active" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                      Active
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-white/10">
            <Button 
              variant="ghost" 
              onClick={() => setIsCreateDialogOpen(false)}
              className="glass-button text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       text-white disabled:opacity-50 disabled:cursor-not-allowed h-9 px-6 rounded-lg text-sm
                       transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              onClick={handleCreateTopicVault}
              disabled={!formData.videoName || !formData.topic || !formData.subject || !formData.program || !formData.teacher || !formData.videoEmbedLink}
            >
              <Plus className="w-3 h-3 mr-1" />
              Create Topic Vault
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Topic Vault Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center">
              <Edit className="w-5 h-5 mr-2 text-yellow-400" />
              Edit Topic Vault
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 py-5 space-y-5">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Video className="w-3 h-3 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Basic Information</h3>
              </div>
              
              {/* Video Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  Video Name
                </label>
                <Input 
                  placeholder="Enter video name" 
                  value={formData.videoName}
                  onChange={(e) => setFormData({...formData, videoName: e.target.value})}
                  className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                />
              </div>

              {/* Topic and Subject */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Topic
                  </label>
                  <Input 
                    placeholder="Enter topic" 
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Subject
                  </label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData({...formData, subject: value, program: ''})}
                  >
                    <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                      style={{ zIndex: 999999 }}
                    >
                      {adminSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  Description
                </label>
                <Textarea 
                  placeholder="Enter description (optional)" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="glass-input min-h-[80px] bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10 resize-none" 
                  rows={3}
                />
              </div>

              {/* Program and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Program
                  </label>
                  <Select 
                    value={formData.program} 
                    onValueChange={(value) => setFormData({...formData, program: value})}
                    disabled={!formData.subject}
                  >
                    <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                      style={{ zIndex: 999999 }}
                    >
                      {getAvailablePrograms.map((program) => (
                        <SelectItem key={program} value={program} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Type
                  </label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value as 'Lesson' | 'Tutorial' | 'Workshop'})}
                  >
                    <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                      style={{ zIndex: 999999 }}
                    >
                      <SelectItem value="Lesson" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        Lesson
                      </SelectItem>
                      <SelectItem value="Tutorial" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        Tutorial
                      </SelectItem>
                      <SelectItem value="Workshop" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        Workshop
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration and Teacher */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Duration
                  </label>
                  <Input 
                    placeholder="e.g., 45 minutes" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Teacher
                  </label>
                  <Input 
                    placeholder="Enter teacher name" 
                    value={formData.teacher}
                    onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
              </div>

              {/* Video Links */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Play className="w-3 h-3 text-purple-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Video Links</h3>
                </div>

                {/* Video Embed Link */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Video Embed Link
                  </label>
                  <Input 
                    placeholder="Enter video embed link (required)" 
                    value={formData.videoEmbedLink}
                    onChange={(e) => setFormData({...formData, videoEmbedLink: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>

                {/* Zoom Link */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Zoom Link (Optional)
                  </label>
                  <Input 
                    placeholder="Enter zoom link (optional)" 
                    value={formData.zoomLink}
                    onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  Status
                </label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value as 'draft' | 'active'})}
                >
                  <SelectTrigger className="glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                    style={{ zIndex: 999999 }}
                  >
                    <SelectItem value="draft" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                      Draft
                    </SelectItem>
                    <SelectItem value="active" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                      Active
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-white/10">
            <Button 
              variant="ghost" 
              onClick={() => setIsEditDialogOpen(false)}
              className="glass-button text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       text-white disabled:opacity-50 disabled:cursor-not-allowed h-9 px-6 rounded-lg text-sm
                       transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              onClick={handleUpdateTopicVault}
              disabled={!formData.videoName || !formData.topic || !formData.subject || !formData.program || !formData.teacher || !formData.videoEmbedLink}
            >
              <Check className="w-3 h-3 mr-1" />
              Update Topic Vault
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Topic Vault Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="glass-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center">
              <Eye className="w-5 h-5 mr-2 text-green-400" />
              View Topic Vault Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTopicVault && (
            <div>
              <div className="px-6 py-5 space-y-5">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Video className="w-3 h-3 text-blue-400" />
                    </div>
                    <h3 className="text-sm font-medium text-white/90">Basic Information</h3>
                  </div>

                  {/* Video Name - Full Width */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">Video Name</label>
                    <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                      {selectedTopicVault.videoName || 'Not specified'}
                    </div>
                  </div>

                  {/* Topic and Subject - 2 Column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Topic</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {selectedTopicVault.topic || 'Not specified'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Subject</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {selectedTopicVault.subject || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {/* Description - Full Width */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">Description</label>
                    <div className="glass-input min-h-[80px] bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-start p-3">
                      {selectedTopicVault.description || 'No description provided'}
                    </div>
                  </div>

                  {/* Program and Type - 2 Column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Program</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {selectedTopicVault.program || 'Not specified'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Type</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        <Badge className={`${getTypeColor(selectedTopicVault.type)} border text-xs`}>
                          {selectedTopicVault.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Duration and Teacher - 2 Column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Duration</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {selectedTopicVault.duration || 'Not specified'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Teacher</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {selectedTopicVault.teacher || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Links */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Play className="w-3 h-3 text-purple-400" />
                    </div>
                    <h3 className="text-sm font-medium text-white/90">Video Links</h3>
                  </div>

                  {/* Video Embed Link */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">Video Embed Link</label>
                    <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                      {selectedTopicVault.videoEmbedLink ? (
                        <a 
                          href={selectedTopicVault.videoEmbedLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 truncate"
                        >
                          {selectedTopicVault.videoEmbedLink}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  </div>

                  {/* Zoom Link */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">Zoom Link</label>
                    <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                      {selectedTopicVault.zoomLink ? (
                        <a 
                          href={selectedTopicVault.zoomLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 truncate"
                        >
                          {selectedTopicVault.zoomLink}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Metadata */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2">
                    <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Settings className="w-3 h-3 text-green-400" />
                    </div>
                    <h3 className="text-sm font-medium text-white/90">Status & Metadata</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Status</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        <Badge className={`${getStatusColor(selectedTopicVault.status)} border text-xs`}>
                          {selectedTopicVault.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Created</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {formatDate(selectedTopicVault.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-white/10">
            <Button 
              variant="ghost" 
              onClick={() => setIsViewDialogOpen(false)}
              className="glass-button text-white hover:bg-white/10"
            >
              Close
            </Button>
            {selectedTopicVault && (
              <Button 
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 
                         text-white h-9 px-6 rounded-lg text-sm transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                onClick={() => {
                  setIsViewDialogOpen(false)
                  handleEditTopicVault(selectedTopicVault)
                }}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit Topic Vault
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="glass-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Delete Topic Vault
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this topic vault? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTopicVault}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent className="glass-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Delete Multiple Topic Vaults
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete {selectedTopicVaults.length} topic vaults? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={bulkActionLoading}
            >
              {bulkActionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete All'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 