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
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Play, Users, Clock, Star, Upload, ChevronLeft, ChevronRight, ChevronDown, Loader2, Download, MoreHorizontal, CheckSquare, Square, AlertTriangle, Check, X, FileText, Settings, Calendar, Video, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Constants
const ITEMS_PER_PAGE = 10

// Subject-Program mapping
const SUBJECT_PROGRAMS = {
  "Maths": [
    "GCSE - Yr 10",
    "GCSE - Yr 11",
    "A-Level - Yr 12",
    "A-Level - Yr 13",
    "GCSE - Level 10",
    "High Achievers Vault"
  ],
  "Maths Easter Club": [
    "GCSE - Yr 10",
    "GCSE - Yr 11",
    "A-Level - Yr 12",
    "A-Level - Yr 13"
  ],
  "1% Club": [],
  "Biology": [
    "GCSE - Yr 10",
    "GCSE - Yr 11",
    "GCSE - Level 10",
    "High Achievers Vault",
    "A-Level - Yr 12",
    "A-Level - Yr 13"
  ],
  "Chemistry": [
    "GCSE - Yr 10",
    "GCSE - Yr 11",
    "GCSE - Level 10",
    "High Achievers Vault",
    "A-Level - Yr 12",
    "A-Level - Yr 13"
  ],
  "Physics": [
    "GCSE - Yr 10",
    "GCSE - Yr 11",
    "GCSE - Level 10",
    "High Achievers Vault",
    "A-Level - Yr 12",
    "A-Level - Yr 13"
  ]
};


// Types
interface Lesson {
  _id?: string
  id: string
  lessonName?: string
  topic: string // Database stores as "topic"
  subject: string
  teacher?: string
  program?: string
  type?: 'Lesson' | 'Tutorial' | 'Workshop'
  duration?: string
  videoUrl?: string
  zoomLink?: string
  status: 'draft' | 'active'
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  time?: string
}



interface PaginatedLessons {
  lessons: Lesson[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface LessonFormData {
  lessonName: string
  title: string
  subject: string
  teacher: string
  program: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  videoUrl: string
  zoomLink: string
  scheduledDate: string
  time: string
  status: 'draft' | 'active'
}

// Utility functions
const createEmptyFormData = (): LessonFormData => ({
  lessonName: "",
  title: "",
  subject: "",
  teacher: "",
  program: "",
  type: "Lesson",
  duration: "",
  videoUrl: "",
  zoomLink: "",
  scheduledDate: "",
  time: "",
  status: "draft"
})



// Helper functions for video handling
const isValidVideoUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
}

const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

const generateUniqueId = (): string => `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`



const exportToCSV = (lessons: Lesson[], filename: string): void => {
  const csvContent = [
    ['Lesson Name', 'Topic', 'Subject', 'Teacher', 'Program', 'Type', 'Status', 'Date', 'Time', 'Duration', 'Created', 'Video URL', 'Zoom Link'],
    ...lessons.map(lesson => [
      lesson.lessonName || '',
      lesson.topic,
      lesson.subject,
      lesson.teacher || '',
      lesson.program || '',
      lesson.type || '',
      lesson.status || 'draft',
      lesson.scheduledDate || '',
      lesson.time || '',
      lesson.duration || '',
      new Date(lesson.createdAt).toLocaleDateString(),
      lesson.videoUrl || '',
      lesson.zoomLink || ''
    ])
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// CSV parsing utility moved to separate import page

export default function LessonsPage() {
  // Core data states
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<string[]>([])
  const [teachers, setTeachers] = useState<string[]>([])
  

  
  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedTeacher, setSelectedTeacher] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [scheduledDateFrom, setScheduledDateFrom] = useState("")
  const [scheduledDateTo, setScheduledDateTo] = useState("")
  const [createdDateFrom, setCreatedDateFrom] = useState("")
  const [createdDateTo, setCreatedDateTo] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLessons, setTotalLessons] = useState(0)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  
  // Bulk operations
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
    // Import functionality moved to separate page /admin/lessons/import
  const [showValidationErrors, setShowValidationErrors] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState<LessonFormData>(createEmptyFormData())

  // Fetch lessons data
  const fetchLessons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: searchTerm,
        subject: selectedSubject,
        teacher: selectedTeacher,
        status: selectedStatus,
        scheduledDateFrom,
        scheduledDateTo,
        createdDateFrom,
        createdDateTo
      })

      const response = await fetch(`/api/admin/lessons?${params}`)
      if (!response.ok) throw new Error('Failed to fetch lessons')
      
      const data: PaginatedLessons = await response.json()
      setLessons(data.lessons)
      setTotalPages(data.totalPages)
      setTotalLessons(data.total)
    } catch (error) {
      console.error('Error fetching lessons:', error)
      toast.error('Failed to fetch lessons')
    } finally {
      setLoading(false)
    }
  }

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const [subjectsRes, teachersRes] = await Promise.all([
        fetch('/api/admin/lessons/filters/subjects'),
        fetch('/api/admin/lessons/filters/teachers')
      ])
      
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json()
        setSubjects(subjectsData.subjects || [])
      }
      
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData.teachers || [])
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }





  // Effect hooks
  useEffect(() => {
    fetchLessons()
  }, [currentPage, searchTerm, selectedSubject, selectedTeacher, selectedStatus, scheduledDateFrom, scheduledDateTo, createdDateFrom, createdDateTo])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // CRUD Operations with optimized error handling
  const handleCreateLesson = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledDate: formData.scheduledDate || '',
          zoomLink: formData.zoomLink || '',
          status: formData.status || 'draft'
        })
      })

      if (!response.ok) throw new Error('Failed to create lesson')
      
      toast.success('Lesson created successfully!')
      setIsCreateDialogOpen(false)
      setFormData(createEmptyFormData())
      
      // Refresh data and filters
      await Promise.all([
        fetchLessons(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error creating lesson:', error)
      toast.error('Failed to create lesson')
    }
  }, [formData])

  const handleUpdateLesson = useCallback(async () => {
    if (!selectedLesson) return
    
    try {
      const response = await fetch(`/api/admin/lessons/${selectedLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledDate: formData.scheduledDate || '',
          zoomLink: formData.zoomLink || '',
          status: formData.status || 'draft'
        })
      })

      if (!response.ok) throw new Error('Failed to update lesson')
      
      toast.success('Lesson updated successfully!')
      setIsEditDialogOpen(false)
      setSelectedLesson(null)
      setFormData(createEmptyFormData())
      
      // Refresh data and filters
      await Promise.all([
        fetchLessons(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error updating lesson:', error)
      toast.error('Failed to update lesson')
    }
  }, [selectedLesson, formData])

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null)

  const confirmDeleteLesson = useCallback((lessonId: string) => {
    setLessonToDelete(lessonId)
    setDeleteConfirmOpen(true)
  }, [])

  const handleDeleteLesson = useCallback(async () => {
    if (!lessonToDelete) return
    
    try {
      const response = await fetch(`/api/admin/lessons/${lessonToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete lesson')
      
      toast.success('Lesson deleted successfully!')
      
      // Refresh data and filters
      await Promise.all([
        fetchLessons(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('Failed to delete lesson')
    } finally {
      setDeleteConfirmOpen(false)
      setLessonToDelete(null)
    }
  }, [lessonToDelete])

  // Event handlers with optimization
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

  const handleClearFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedSubject("all")
    setSelectedTeacher("all")
    setSelectedStatus("all")
    setScheduledDateFrom("")
    setScheduledDateTo("")
    setCreatedDateFrom("")
    setCreatedDateTo("")
    setCurrentPage(1)
  }, [])

  const handleEditLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson)
    setFormData({
      lessonName: lesson.lessonName || "",
      title: lesson.topic || "", // Map "topic" from database to "title" in form
      subject: lesson.subject || "",
      teacher: lesson.teacher || "",
      program: lesson.program || "",
      type: lesson.type || "Lesson",
      duration: lesson.duration || "",
      videoUrl: lesson.videoUrl || "",
      zoomLink: lesson.zoomLink || "",
      scheduledDate: lesson.scheduledDate || "",
      time: lesson.time || "",
      status: lesson.status || "draft"
    })
    setIsEditDialogOpen(true)
  }, [])

  const handleViewLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsViewDialogOpen(true)
  }, [])

  // Bulk operations with optimization
  const handleSelectLesson = useCallback((lessonId: string) => {
    setSelectedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedLessons.length === lessons.length) {
      setSelectedLessons([])
    } else {
      setSelectedLessons(lessons.map(lesson => lesson.id))
    }
  }, [selectedLessons.length, lessons])

  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const confirmBulkDelete = useCallback(() => {
    if (selectedLessons.length === 0) return
    setBulkDeleteConfirmOpen(true)
  }, [selectedLessons.length])

  const handleBulkDelete = useCallback(async () => {
    if (selectedLessons.length === 0) return
    
    setBulkActionLoading(true)
    setBulkDeleteConfirmOpen(false)
    
    try {
      const deletePromises = selectedLessons.map(lessonId =>
        fetch(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' })
      )
      
      const results = await Promise.all(deletePromises)
      const successCount = results.filter(r => r.ok).length
      
      if (successCount === selectedLessons.length) {
        toast.success(`Successfully deleted ${successCount} lesson(s)`)
      } else {
        toast.warning(`Deleted ${successCount} out of ${selectedLessons.length} lesson(s)`)
      }
      
      setSelectedLessons([])
      
      // Refresh data and filters
      await Promise.all([
        fetchLessons(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error bulk deleting lessons:', error)
      toast.error('Failed to delete lessons')
    } finally {
      setBulkActionLoading(false)
    }
  }, [selectedLessons])

  const handleDeleteAllLessons = useCallback(async () => {
    if (totalLessons === 0) {
      toast.info('No lessons to delete')
      return
    }
    
    const confirmation = confirm(
      `⚠️ DANGER: This will permanently delete ALL ${totalLessons} lessons!\n\n` +
      `This action cannot be undone. Are you absolutely sure you want to proceed?`
    )
    
    if (!confirmation) return
    
    // Second confirmation for extra safety
    const finalConfirmation = confirm(
      `🚨 FINAL WARNING: You are about to delete ALL lessons!\n\n` +
      `Type "DELETE ALL" to confirm this destructive action.`
    )
    
    if (!finalConfirmation) return
    
    setBulkActionLoading(true)
    try {
      const response = await fetch('/api/admin/lessons/delete-all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) throw new Error('Failed to delete all lessons')
      
      const data = await response.json()
      toast.success(`Successfully deleted all ${data.deletedCount} lessons!`)
      
      // Reset all state
      setLessons([])
      setSelectedLessons([])
      setCurrentPage(1)
      setTotalLessons(0)
      setTotalPages(1)
      
      // Refresh data and filters
      await Promise.all([
        fetchLessons(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error deleting all lessons:', error)
      toast.error('Failed to delete all lessons')
    } finally {
      setBulkActionLoading(false)
    }
  }, [totalLessons])

  // Export handler with optimization
  const handleExportLessons = useCallback(() => {
    const lessonsToExport = selectedLessons.length > 0 
      ? lessons.filter(lesson => selectedLessons.includes(lesson.id))
      : lessons

    exportToCSV(lessonsToExport, `lessons_export_${new Date().toISOString().split('T')[0]}.csv`)
    toast.success(`Exported ${lessonsToExport.length} lesson(s)`)
  }, [selectedLessons, lessons])

  // CSV import functionality moved to /admin/lessons/import page

  // Import-related memoized values moved to separate import page

  // All import-related functions moved to /admin/lessons/import page

  return (
    <TooltipProvider>
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements - Covers entire screen including nav area */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Additional background elements for nav area */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl animate-pulse delay-3000"></div>
        <div className="absolute top-1/2 left-5 w-48 h-48 bg-violet-500/8 rounded-full blur-3xl animate-pulse delay-4000"></div>
        
        {/* Extended background elements behind nav */}
        <div className="absolute top-1/4 left-20 w-56 h-56 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-5000"></div>
        <div className="absolute bottom-1/4 left-8 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-6000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400/60 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce delay-1500"></div>
        <div className="absolute top-60 left-32 w-1 h-1 bg-indigo-400/60 rounded-full animate-bounce delay-2500"></div>
        <div className="absolute top-80 left-16 w-1.5 h-1.5 bg-violet-400/60 rounded-full animate-bounce delay-3500"></div>
        <div className="absolute top-32 left-24 w-1 h-1 bg-cyan-400/60 rounded-full animate-bounce delay-7000"></div>
        <div className="absolute bottom-60 left-12 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce delay-8000"></div>
        
        {/* Grid pattern overlay - Covers entire screen */}
        <div className="absolute inset-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEyNywgNjMsIDI1NSwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      </div>
      
      {/* Scrollable Content Container - positioned below navigation */}
      <div className="absolute inset-0 z-10 overflow-y-auto">

      <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-14 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden">
              {/* Enhanced Header */}
        <div className="mb-6 lg:mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
            </div>
            <span className="text-xs lg:text-sm text-purple-300 font-medium tracking-wider uppercase">Admin Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3 tracking-tight">
            Lesson Management
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
            Create, edit, and manage educational lessons with advanced analytics and insights
          </p>
          <div className="mt-4 h-1 w-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto animate-pulse"></div>
        </div>



        {/* Enhanced Filters Section */}
        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-3xl mb-4 lg:mb-8 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>
          <CardContent className="relative p-3 sm:p-4 lg:p-8">
            {/* Search Bar with Enhanced Design */}
            <div className="mb-4 lg:mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2 lg:mb-3">Search Lessons</label>
              <div className="relative group">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 group-hover:text-purple-400 transition-colors duration-200 z-10" />
                <Input
                  placeholder="Search by lesson name, topic, subject, teacher, or program..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 bg-white/[0.03] border-2 border-white/20 rounded-xl sm:rounded-2xl text-white placeholder:text-slate-400 
                           focus:border-purple-400/80 focus:ring-2 sm:focus:ring-4 focus:ring-purple-400/20 focus:bg-white/[0.08]
                           hover:bg-white/[0.05] hover:border-white/30
                           transition-all duration-300 ease-in-out
                           focus-visible:outline-none focus-visible:ring-2 sm:focus-visible:ring-4 focus-visible:ring-purple-400/20
                           text-sm w-full"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white 
                             hover:bg-white/10 rounded-lg p-1 transition-all duration-200 z-10"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Grid with Enhanced Design */}
            <div className="space-y-4 mb-6">
              {/* Main Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Subject</label>
                  <Select value={selectedSubject} onValueChange={handleSubjectFilter}>
                    <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white 
                                           hover:bg-white/[0.05] hover:border-white/30
                                           focus:border-purple-400/80 focus:ring-4 focus:ring-purple-400/20 
                                           transition-all duration-300 ease-in-out
                                           focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/20
                                           h-11">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border border-white/20 rounded-xl z-[999999]">
                      <SelectItem value="all" className="hover:bg-white/10 text-white cursor-pointer">All Subjects</SelectItem>
                      {subjects.filter(subject => 
                        subject && 
                        subject.trim() !== '' && 
                        subject.trim() !== '-' &&
                        subject.toLowerCase() !== 'undefined' &&
                        subject.toLowerCase() !== 'null'
                      ).map(subject => (
                        <SelectItem key={subject} value={subject} className="hover:bg-white/10">{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Teacher</label>
                  <Select value={selectedTeacher} onValueChange={handleTeacherFilter}>
                    <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white 
                                           hover:bg-white/[0.05] hover:border-white/30
                                           focus:border-purple-400/80 focus:ring-4 focus:ring-purple-400/20 
                                           transition-all duration-300 ease-in-out
                                           focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/20
                                           h-11">
                      <SelectValue placeholder="All Teachers" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border border-white/20 rounded-xl z-[999999]">
                      <SelectItem value="all" className="hover:bg-white/10 text-white cursor-pointer">All Teachers</SelectItem>
                      {teachers.filter(teacher =>
                        teacher &&
                        teacher.trim() !== '' &&
                        teacher.trim() !== '-' &&
                        teacher.toLowerCase() !== 'undefined' &&
                        teacher.toLowerCase() !== 'null'
                      ).map(teacher => (
                        <SelectItem key={teacher} value={teacher} className="hover:bg-white/10">{teacher}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</label>
                  <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white 
                                           hover:bg-white/[0.05] hover:border-white/30
                                           focus:border-purple-400/80 focus:ring-4 focus:ring-purple-400/20 
                                           transition-all duration-300 ease-in-out
                                           focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/20
                                           h-11">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border border-white/20 rounded-xl z-[999999]">
                      <SelectItem value="all" className="hover:bg-white/10 text-white cursor-pointer">All Status</SelectItem>
                      <SelectItem value="active" className="hover:bg-white/10 text-white cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="draft" className="hover:bg-white/10 text-white cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span>Draft</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters Button - Separate Row */}
              {(searchTerm || selectedSubject !== 'all' || selectedTeacher !== 'all' || selectedStatus !== 'all' || scheduledDateFrom || scheduledDateTo || createdDateFrom || createdDateTo) && (
                <div className="flex justify-center lg:justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                    className="bg-white/[0.03] border-2 border-red-400/30 text-red-400 
                             hover:bg-red-500/10 hover:border-red-400/50 
                             focus:ring-4 focus:ring-red-400/20 focus:border-red-400/60
                             rounded-xl transition-all duration-300 ease-in-out h-11 px-6"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>

                     {/* Date Filters - Mobile Optimized */}
            <div className="space-y-4 mb-6">
              <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                {/* Scheduled Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Scheduled Date Range
                  </label>
                  <div className="p-2 sm:p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">From</label>
                        <Input
                          type="date"
                          value={scheduledDateFrom}
                          onChange={(e) => setScheduledDateFrom(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/20 rounded-lg text-white text-sm
                                   hover:bg-white/[0.05] hover:border-white/30
                                   focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/20 focus:bg-white/[0.08]
                                   transition-all duration-200 h-9 px-3
                                   [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">To</label>
                        <Input
                          type="date"
                          value={scheduledDateTo}
                          onChange={(e) => setScheduledDateTo(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/20 rounded-lg text-white text-sm
                                   hover:bg-white/[0.05] hover:border-white/30
                                   focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/20 focus:bg-white/[0.08]
                                   transition-all duration-200 h-9 px-3
                                   [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Created Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Created Date Range
                  </label>
                  <div className="p-2 sm:p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">From</label>
                        <Input
                          type="date"
                          value={createdDateFrom}
                          onChange={(e) => setCreatedDateFrom(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/20 rounded-lg text-white text-sm
                                   hover:bg-white/[0.05] hover:border-white/30
                                   focus:border-blue-400/80 focus:ring-1 focus:ring-blue-400/20 focus:bg-white/[0.08]
                                   transition-all duration-200 h-9 px-3no
                                   [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">To</label>
                        <Input
                          type="date"
                          value={createdDateTo}
                          onChange={(e) => setCreatedDateTo(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/20 rounded-lg text-white text-sm
                                   hover:bg-white/[0.05] hover:border-white/30
                                   focus:border-blue-400/80 focus:ring-1 focus:ring-blue-400/20 focus:bg-white/[0.08]
                                   transition-all duration-200 h-9 px-3
                                   [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full bg-purple-500/10 border border-purple-400/30 text-purple-400 
                                 hover:bg-purple-500/20 hover:border-purple-400/50 
                                 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400/60
                                 rounded-xl transition-all duration-200 backdrop-blur-sm h-10 text-xs sm:text-sm"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span>Create</span>
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-slate-900/95 backdrop-blur-xl border border-purple-400/30 text-white rounded-xl shadow-2xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-3 h-3 text-purple-400" />
                      <span className="text-sm font-medium">Create a new lesson</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </Dialog>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/admin/lessons/import" className="block">
                    <Button 
                      variant="outline" 
                      className="w-full bg-green-500/10 border border-green-400/30 text-green-400 
                               hover:bg-green-500/20 hover:border-green-400/50 
                               focus:ring-2 focus:ring-green-400/20 focus:border-green-400/60
                               rounded-xl transition-all duration-200 backdrop-blur-sm h-10 text-xs sm:text-sm"
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span>Import</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="bg-slate-900/95 backdrop-blur-xl border border-green-400/30 text-white rounded-xl shadow-2xl px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-3 h-3 text-green-400" />
                    <span className="text-sm font-medium">Import lessons from CSV file</span>
                  </div>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={handleExportLessons}
                className="bg-orange-500/10 border border-orange-400/30 text-orange-400 
                         hover:bg-orange-500/20 hover:border-orange-400/50 
                         focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400/60
                         rounded-xl transition-all duration-200 backdrop-blur-sm h-10 text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Export</span>
              </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="bg-slate-900/95 backdrop-blur-xl border border-orange-400/30 text-white rounded-xl shadow-2xl px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3 h-3 text-orange-400" />
                    <span className="text-sm font-medium">
                      Export {selectedLessons.length > 0 ? `${selectedLessons.length} selected` : 'all'} lessons to CSV
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={handleDeleteAllLessons}
                disabled={bulkActionLoading || totalLessons === 0}
                className="bg-red-500/10 border border-red-400/30 text-red-400 
                         hover:bg-red-500/20 hover:border-red-400/50 
                         focus:ring-2 focus:ring-red-400/20 focus:border-red-400/60
                         rounded-xl transition-all duration-200 backdrop-blur-sm disabled:opacity-50 h-10 text-xs sm:text-sm"
              >
                {bulkActionLoading ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                )}
                <span>Delete</span>
              </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="bg-slate-900/95 backdrop-blur-xl border border-red-400/30 text-white rounded-xl shadow-2xl px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span className="font-medium">
                      {totalLessons === 0 ? "No lessons to delete" : `Delete all ${totalLessons} lessons`}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>


        </CardContent>
      </Card>

              {/* Enhanced Bulk Actions Bar */}
      {selectedLessons.length > 0 && (
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl"></div>
            <Card className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                      <CheckSquare className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <span className="text-white font-medium">
                        {selectedLessons.length} lesson{selectedLessons.length > 1 ? 's' : ''} selected
                </span>
                      <p className="text-xs text-slate-400">Bulk actions available</p>
              </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportLessons()}
                      className="bg-orange-500/10 border border-orange-400/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400/50 rounded-xl transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={confirmBulkDelete}
                  disabled={bulkActionLoading}
                      className="bg-red-500/10 border border-red-400/30 text-red-400 hover:bg-red-500/20 hover:border-red-400/50 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  {bulkActionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLessons([])}
                  className="group bg-white/5 backdrop-blur-sm border border-white/20 text-white/80 
                           hover:bg-white/10 hover:border-white/30 hover:text-white
                           focus:ring-2 focus:ring-white/20 focus:border-white/40
                           rounded-xl transition-all duration-300 ease-in-out
                           shadow-lg hover:shadow-xl hover:shadow-white/10
                           active:scale-95 transform font-medium"
                >
                  <X className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-180" />
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        )}

      {/* Enhanced Lessons Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-purple-900/20 rounded-2xl blur-2xl"></div>
        <Card className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <CardHeader className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-800/30 to-purple-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <CardTitle className="text-white font-semibold text-lg">
                  Lessons ({totalLessons})
          </CardTitle>
              </div>
              <div className="flex items-center space-x-4">
                {totalLessons > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <span>Total: {totalLessons}</span>
                    <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                    <span>Selected: {selectedLessons.length}</span>
                  </div>
                )}
                {loading && (
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-6 w-6 p-0"
                  >
                    {selectedLessons.length === lessons.length && lessons.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </Button>
                </TableHead>
                                          <TableHead>Lesson Name</TableHead>
                                          <TableHead>Topic</TableHead>
                <TableHead>Subject</TableHead>
                  <TableHead>Program</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading lessons...</p>
                  </TableCell>
                </TableRow>
              ) : lessons.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No lessons found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {searchTerm || selectedSubject !== 'all' || selectedTeacher !== 'all' || selectedStatus !== 'all' || scheduledDateFrom || scheduledDateTo || createdDateFrom || createdDateTo
                        ? "Try adjusting your filters" 
                        : "Create your first lesson to get started"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                lessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectLesson(lesson.id)}
                        className="h-6 w-6 p-0"
                      >
                        {selectedLessons.includes(lesson.id) ? (
                            <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {lesson.lessonName || '-'}
                    </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {lesson.topic}
                    </TableCell>
                      <TableCell>{lesson.subject}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{lesson.program || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {lesson.type || 'Lesson'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{lesson.teacher || '-'}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            lesson.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                          }`}></div>
                          <span className="capitalize text-sm">{lesson.status}</span>
                        </div>
                    </TableCell>
                      <TableCell className="text-sm">
                        {lesson.scheduledDate ? new Date(lesson.scheduledDate).toLocaleDateString() : '-'}
                    </TableCell>
                      <TableCell className="text-sm">
                        {lesson.time || '-'}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLesson(lesson)}
                                className="h-8 w-8 p-0 hover:bg-blue-500/10 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </Button>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="bg-slate-900/95 backdrop-blur-xl border border-blue-400/30 text-white rounded-xl shadow-2xl px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <Eye className="w-3 h-3 text-blue-400" />
                                <span className="text-sm font-medium">View Lesson Details</span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLesson(lesson)}
                                className="h-8 w-8 p-0 hover:bg-green-500/10 transition-all duration-200"
                          >
                            <Edit className="w-4 h-4 text-green-400" />
                          </Button>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="bg-slate-900/95 backdrop-blur-xl border border-green-400/30 text-white rounded-xl shadow-2xl px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <Edit className="w-3 h-3 text-green-400" />
                                <span className="text-sm font-medium">Edit Lesson</span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                                onClick={() => confirmDeleteLesson(lesson.id)}
                                className="h-8 w-8 p-0 hover:bg-red-500/10 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="bg-slate-900/95 backdrop-blur-xl border border-red-400/30 text-white rounded-xl shadow-2xl px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <Trash2 className="w-3 h-3 text-red-400" />
                                <span className="text-sm font-medium">Delete Lesson</span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3 p-4">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading lessons...</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No lessons found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm || selectedSubject !== 'all' || selectedTeacher !== 'all' || selectedStatus !== 'all' || scheduledDateFrom || scheduledDateTo || createdDateFrom || createdDateTo
                    ? "Try adjusting your filters" 
                    : "Create your first lesson to get started"}
                </p>
              </div>
            ) : (
              <>
                {/* Select All on Mobile */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-muted-foreground">Select all lessons</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 w-8 p-0"
                  >
                    {selectedLessons.length === lessons.length && lessons.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Card className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 card-entrance stagger-{index % 6 + 1}">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-4 h-4 text-purple-400" />
                              <h3 className="font-semibold text-white text-sm truncate">{lesson.topic}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${
                            lesson.status === 'active' 
                              ? 'border-green-400/50 bg-green-400/10 text-green-400' 
                              : 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400'
                                } text-xs font-medium px-2 py-1 flex items-center gap-1`}
                        >
                                <div className={`w-1.5 h-1.5 rounded-full ${
                            lesson.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                          }`}></div>
                          {lesson.status === 'active' ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                      </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectLesson(lesson.id)}
                            className="h-8 w-8 p-0 ml-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                          >
                            {selectedLessons.includes(lesson.id) ? (
                              <CheckSquare className="w-4 h-4 text-purple-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </Button>
                      </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                          <div className="space-y-1">
                            <span className="text-slate-400 font-medium">Subject</span>
                            <p className="text-white font-medium truncate bg-white/5 px-2 py-1 rounded-lg">{lesson.subject}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-medium">Program</span>
                            <p className="text-white font-medium truncate bg-white/5 px-2 py-1 rounded-lg">{lesson.program || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-medium">Teacher</span>
                            <p className="text-white font-medium truncate bg-white/5 px-2 py-1 rounded-lg">{lesson.teacher || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-medium">Type</span>
                            <p className="text-white font-medium bg-white/5 px-2 py-1 rounded-lg text-center">{lesson.type || 'Lesson'}</p>
                        </div>
                          </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lesson.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewLesson(lesson)}
                              className="h-8 w-8 p-0 hover:bg-blue-500/20 rounded-lg transition-all duration-200 group/btn"
                        >
                              <Eye className="w-4 h-4 text-blue-400 group-hover/btn:scale-110 transition-transform duration-200" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditLesson(lesson)}
                              className="h-8 w-8 p-0 hover:bg-green-500/20 rounded-lg transition-all duration-200 group/btn"
                        >
                              <Edit className="w-4 h-4 text-green-400 group-hover/btn:scale-110 transition-transform duration-200" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => confirmDeleteLesson(lesson.id)}
                              className="h-8 w-8 p-0 hover:bg-red-500/20 rounded-lg transition-all duration-200 group/btn"
                        >
                              <Trash2 className="w-4 h-4 text-red-400 group-hover/btn:scale-110 transition-transform duration-200" />
                        </Button>
                      </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
        </Card>
      </div>

          {/* Pagination */}
          {!loading && lessons.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalLessons)} of {totalLessons} lessons
              </div>
              
          <div className="flex items-center space-x-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="glass-card border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === pageNum 
                            ? "bg-gradient-to-r from-blue-500 to-purple-600" 
                            : "glass-card border-white/20"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="glass-card border-white/20"
                >
              <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

      {/* Enhanced Create Lesson Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
               <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] bg-slate-900/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-y-auto [&>button]:!hidden">
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
                  input[type="date"]::-webkit-calendar-picker-indicator {
                    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E") center/contain no-repeat;
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    cursor: pointer;
                    padding: 8px;
                    transition: all 0.2s ease;
                    width: 20px;
                    height: 20px;
                  }
                  input[type="time"]::-webkit-calendar-picker-indicator {
                    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12,6 12,12 16,14'/%3E%3C/svg%3E") center/contain no-repeat;
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    cursor: pointer;
                    padding: 8px;
                    transition: all 0.2s ease;
                    width: 20px;
                    height: 20px;
                  }
                  input[type="date"]::-webkit-calendar-picker-indicator:hover,
                  input[type="time"]::-webkit-calendar-picker-indicator:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    transform: scale(1.05);
                  }
                  input[type="date"],
                  input[type="time"] {
                    color-scheme: dark;
                  }
                  
                  /* COMPREHENSIVE DIALOG CLOSE BUTTON HIDING - Multiple targeting approaches */
                  
                  /* Hide by Radix UI data attributes */
                  [data-radix-dialog-close] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                  }
                  
                  /* Hide by aria-label */
                  button[aria-label="Close"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                  }
                  
                  /* Hide by role and type */
                  button[role="button"][type="button"]:has(svg):not([class*="bg-"]):not([class*="border-"]) {
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
                  
                  /* Hide by position and z-index patterns */
                  [data-radix-dialog-content] button[style*="position: absolute"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                  }
                  
                  /* Hide by common close button class patterns */
                  button[class*="close"]:not([class*="Clear"]):not([class*="clear"]) {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                  }
                  
                  /* Hide by X icon content */
                  button:has(svg):not([class*="bg-white"]):not([class*="Clear"]):not([class*="clear"]):not([class*="hover:bg-white"]) {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                  }
                  
                  /* Fallback: Hide any button in dialog that doesn't have our custom classes */
                  [data-radix-dialog-content] > button:not([class*="bg-white"]):not([class*="gradient"]):not([class*="Clear"]):not([class*="clear"]):not([class*="border-white"]) {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                  }

                `}</style>
                
                {/* Header */}
                <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 -m-4 sm:-m-6 mb-0 border-b border-white/10">
                  <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-white">Create New Lesson</DialogTitle>
                      </div>
                    </div>
                                        <div className="flex items-center space-x-2 sm:space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(createEmptyFormData())}
                        className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-7 sm:h-8 px-2 sm:px-3 text-xs transition-all duration-200"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Clear All</span>
                        <span className="sm:hidden">Clear</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-7 w-7 sm:h-8 sm:w-8 p-0 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                </div>
              </div>
              </DialogHeader>

                {/* Content */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                  {/* Basic Information */}
              <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-blue-400" />
                      </div>
                      <h3 className="text-sm font-medium text-white/90">Basic Information</h3>
                    </div>
                    
                    {/* Lesson Name */}
                <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">
                        Lesson Name
                      </label>
                      <Input 
                        placeholder="Enter lesson name" 
                        value={formData.lessonName}
                        onChange={(e) => setFormData({...formData, lessonName: e.target.value})}
                        className="glass-input h-9 sm:h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                                 rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                      />
                    </div>

                    {/* Topic and Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">
                          Topic
                  </label>
                <Input 
                    placeholder="Enter lesson topic" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                            <SelectItem value="Maths" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                              Maths
                            </SelectItem>
                            <SelectItem value="Biology" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                              Biology
                            </SelectItem>
                            <SelectItem value="Chemistry" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                              Chemistry
                            </SelectItem>
                            <SelectItem value="Physics" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                              Physics
                            </SelectItem>
                          </SelectContent>
                        </Select>
                  </div>
                </div>

                    {/* Program and Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                                                   rounded-lg text-sm transition-all duration-200 hover:bg-white/10 disabled:opacity-50">
                            <SelectValue placeholder={formData.subject ? "Select program" : "Select subject first"} />
                          </SelectTrigger>
                          <SelectContent 
                            className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                            style={{ zIndex: 999999 }}
                          >
                            {formData.subject && SUBJECT_PROGRAMS[formData.subject as keyof typeof SUBJECT_PROGRAMS]?.map((program) => (
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
                </div>

                  {/* Schedule Information */}
            <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-green-400" />
                  </div>
                      <h3 className="text-sm font-medium text-white/90">Schedule & Details</h3>
                  </div>
                    
                    {/* Date and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">
                          Date
                        </label>
                    <Input 
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                          className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                   rounded-lg text-sm transition-all duration-200 hover:bg-white/10 [color-scheme:dark] cursor-pointer" 
                    />
                  </div>
                      
              <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">
                          Time
                        </label>
                <Input 
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                   rounded-lg text-sm transition-all duration-200 hover:bg-white/10 [color-scheme:dark] cursor-pointer" 
                />
              </div>
            </div>

                    {/* Duration and Teacher */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">
                          Duration (minutes)
                        </label>
                  <Input 
                    type="number"
                    placeholder="60" 
                    min="1"
                    max="300"
                    value={formData.duration ? formData.duration.replace(/[^0-9]/g, '') : ''}
                    onChange={(e) => {
                      const minutes = e.target.value
                      setFormData({...formData, duration: minutes ? `${minutes} min` : ''})
                    }}
                          className="glass-input h-9 sm:h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
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
                          className="glass-input h-9 sm:h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                                   rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                        />
                  </div>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Settings className="w-3 h-3 text-orange-400" />
                      </div>
                      <h3 className="text-sm font-medium text-white/90">Additional Options</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">
                          Video URL
                        </label>
                <Input 
                          placeholder="https://youtube.com/watch?v=..." 
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                          className="glass-input h-9 sm:h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                                   rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                />
                </div>
              </div>

                    {/* Zoom Link */}
                <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">
                        Zoom Meeting Link
                      </label>
                <Input 
                  placeholder="https://zoom.us/j/123456789" 
                  value={formData.zoomLink}
                  onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                        className="glass-input h-9 sm:h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                                 rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                      />
                </div>
                </div>
            </div>

                {/* Footer */}
                <div className="bg-slate-900/50 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 -m-4 sm:-m-6 mt-0 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:justify-end">
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
                onClick={handleCreateLesson}
                    disabled={!formData.lessonName || !formData.title || !formData.subject || !formData.program || !formData.scheduledDate || !formData.time || !formData.duration || !formData.teacher}
              >
                    <Plus className="w-3 h-3 mr-1" />
                Create Lesson
              </Button>
              </div>
            </DialogContent>
          </Dialog>

      {/* Enhanced Edit Lesson Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto [&>button]:!hidden">
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
            input[type="date"]::-webkit-calendar-picker-indicator {
              background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E") center/contain no-repeat;
              background-color: rgba(255, 255, 255, 0.1);
              border-radius: 6px;
              cursor: pointer;
              padding: 8px;
              transition: all 0.2s ease;
              width: 20px;
              height: 20px;
            }
            input[type="time"]::-webkit-calendar-picker-indicator {
              background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12,6 12,12 16,14'/%3E%3C/svg%3E") center/contain no-repeat;
              background-color: rgba(255, 255, 255, 0.1);
              border-radius: 6px;
              cursor: pointer;
              padding: 8px;
              transition: all 0.2s ease;
              width: 20px;
              height: 20px;
            }
            input[type="date"]::-webkit-calendar-picker-indicator:hover,
            input[type="time"]::-webkit-calendar-picker-indicator:hover {
              background-color: rgba(255, 255, 255, 0.2);
              transform: scale(1.05);
            }
            input[type="date"],
            input[type="time"] {
              color-scheme: dark;
            }
            
            /* COMPREHENSIVE DIALOG CLOSE BUTTON HIDING - Edit Dialog */
            
            /* Hide by Radix UI data attributes */
            [data-radix-dialog-close] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
            
            /* Hide by aria-label */
            button[aria-label="Close"] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
            
            /* Hide by role and type */
            button[role="button"][type="button"]:has(svg):not([class*="bg-"]):not([class*="border-"]) {
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
            
            /* Hide by position and z-index patterns */
            [data-radix-dialog-content] button[style*="position: absolute"] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
            
            /* Hide by common close button class patterns */
            button[class*="close"]:not([class*="Clear"]):not([class*="clear"]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
            
            /* Hide by X icon content */
            button:has(svg):not([class*="bg-"]):not([class*="Clear"]):not([class*="clear"]):not([class*="hover:bg-"]):not([class*="gradient"]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
            
            /* Fallback: Hide any button in dialog that doesn't have our custom classes */
            [data-radix-dialog-content] > button:not([class*="bg-"]):not([class*="gradient"]):not([class*="Clear"]):not([class*="clear"]):not([class*="border-"]):not([class*="outline"]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          `}</style>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-500/10 rounded-3xl"></div>
          <div className="relative">
                {/* Header */}
                <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl px-6 py-4 -m-6 mb-0 border-b border-white/10">
                  <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                        <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                        <DialogTitle className="text-xl font-semibold text-white">Edit Lesson</DialogTitle>
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
                        onClick={() => setIsEditDialogOpen(false)}
                        className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                </div>
              </div>
          </DialogHeader>

                {/* Content */}
                <div className="px-6 py-5 space-y-5">
                  {/* Basic Information */}
          <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-blue-400" />
        </div>
                      <h3 className="text-sm font-medium text-white/90">Basic Information</h3>
      </div>
                    
                    {/* Lesson Name */}
                <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">
                        Lesson Name
                      </label>
                <Input 
                        placeholder="Enter lesson name" 
                        value={formData.lessonName}
                        onChange={(e) => setFormData({...formData, lessonName: e.target.value})}
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
                    placeholder="Enter lesson topic" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                            <SelectItem value="Maths" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                              Maths
                            </SelectItem>
                            <SelectItem value="Biology" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                              Biology
                            </SelectItem>
                            <SelectItem value="Chemistry" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                              Chemistry
                            </SelectItem>
                            <SelectItem value="Physics" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                              Physics
                            </SelectItem>
                          </SelectContent>
                        </Select>
              </div>
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
                                                   rounded-lg text-sm transition-all duration-200 hover:bg-white/10 disabled:opacity-50">
                            <SelectValue placeholder={formData.subject ? "Select program" : "Select subject first"} />
                          </SelectTrigger>
                          <SelectContent 
                            className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl"
                            style={{ zIndex: 999999 }}
                          >
                            {formData.subject && SUBJECT_PROGRAMS[formData.subject as keyof typeof SUBJECT_PROGRAMS]?.map((program) => (
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
            </div>

                  {/* Schedule Information */}
            <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-green-400" />
                  </div>
                      <h3 className="text-sm font-medium text-white/90">Schedule & Details</h3>
                  </div>
                    
                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">
                          Date
                        </label>
                <Input 
                  type="date"
                  value={formData.scheduledDate ? (() => {
                    try {
                      // Always expect ISO format (YYYY-MM-DD)
                      const dateStr = formData.scheduledDate
                      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                        return dateStr
                      }
                      // Try to parse other formats
                      const parsed = new Date(dateStr)
                      if (!isNaN(parsed.getTime())) {
                        return parsed.toISOString().split('T')[0]
                      }
                      return ''
                    } catch {
                      return ''
                    }
                  })() : ''}
                  onChange={(e) => {
                    setFormData({...formData, scheduledDate: e.target.value})
                  }}
                          className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                   rounded-lg text-sm transition-all duration-200 hover:bg-white/10 [color-scheme:dark] cursor-pointer" 
                    />
              </div>
                      
              <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">
                          Time
                        </label>
                <Input 
                          type="time"
                          value={formData.time || ''}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                   rounded-lg text-sm transition-all duration-200 hover:bg-white/10 [color-scheme:dark] cursor-pointer" 
                />
            </div>
            </div>

                    {/* Duration and Teacher */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">
                          Duration (minutes)
                        </label>
                <Input 
                  type="number"
                    placeholder="60" 
                  min="1"
                  max="300"
                  value={formData.duration ? formData.duration.replace(/[^0-9]/g, '') : ''}
                  onChange={(e) => {
                    const minutes = e.target.value
                    setFormData({...formData, duration: minutes ? `${minutes} min` : ''})
                  }}
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
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Settings className="w-3 h-3 text-orange-400" />
                      </div>
                      <h3 className="text-sm font-medium text-white/90">Additional Options</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
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
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/80 block">
                          Video URL
                        </label>
                <Input 
                          placeholder="https://youtube.com/watch?v=..." 
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                          className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                                   rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                />
              </div>
            </div>

                    {/* Zoom Link */}
                <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">
                        Zoom Meeting Link
                      </label>
                <Input 
                  placeholder="https://zoom.us/j/123456789" 
                  value={formData.zoomLink}
                  onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                        className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                                 rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                      />
              </div>
            </div>
              </div>

                {/* Footer */}
                <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 -m-6 mt-0 border-t border-white/10 flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)} 
                    className="bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                             h-9 px-4 rounded-lg text-sm transition-all duration-200"
              >
                    <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button 
                    className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 
                             text-white disabled:opacity-50 disabled:cursor-not-allowed h-9 px-6 rounded-lg text-sm
                             transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                onClick={handleUpdateLesson}
                    disabled={!formData.lessonName || !formData.title || !formData.subject || !formData.program || !formData.scheduledDate || !formData.time || !formData.duration || !formData.teacher}
              >
                    <Edit className="w-3 h-3 mr-1" />
                Update Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

              {/* Enhanced View Lesson Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="w-[95vw] max-w-4xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto [&>button]:!hidden">
          <style jsx global>{`
            /* COMPLETELY HIDE DEFAULT DIALOG CLOSE BUTTON - NUCLEAR APPROACH */
            
            /* Primary targeting: Hide any button that is auto-generated by Dialog without our classes */
            [data-radix-dialog-content] > button:not([class*="bg-"]):not([class*="border-"]):not([class*="outline"]):not([class*="variant"]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
              position: absolute !important;
              left: -9999px !important;
              top: -9999px !important;
            }
            
            /* Secondary targeting: Hide by common attributes */
            button[aria-label="Close"],
            button[data-radix-dialog-close],
            [data-dialog-close] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
              position: absolute !important;
              left: -9999px !important;
              top: -9999px !important;
            }
            
            /* Tertiary targeting: Hide by structure and position */
            [data-radix-dialog-content] button.absolute:not([class*="bg-white"]):not([class*="bg-gradient"]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
              position: absolute !important;
              left: -9999px !important;
              top: -9999px !important;
            }
            
            /* Nuclear option: Hide any button with X icon that's not one of ours */
            button[type="button"]:not([class*="Clear"]):not([class*="bg-white"]):not([class*="bg-gradient"]):not([class*="bg-red"]):not([class*="bg-blue"]):not([class*="bg-green"]):not([class*="bg-orange"]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
              position: absolute !important;
              left: -9999px !important;
              top: -9999px !important;
            }
          `}</style>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10 rounded-3xl"></div>
          <div className="relative">
                {/* Header */}
                <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl px-6 py-4 -m-6 mb-0 border-b border-white/10">
                  <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                        <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                        <DialogTitle className="text-xl font-semibold text-white">Lesson Details</DialogTitle>
                      </div>
                    </div>
                                        <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsViewDialogOpen(false)}
                        className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                </div>
              </div>
          </DialogHeader>

          {selectedLesson && (
                  <div>
                {/* Content */}
                <div className="px-6 py-5 space-y-5">
                  {/* Basic Information */}
              <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-blue-400" />
                  </div>
                      <h3 className="text-sm font-medium text-white/90">Basic Information</h3>
                  </div>

                    {/* Lesson Name - Full Width */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/60 block">Lesson Name</label>
                      <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                        <p className="text-sm text-white font-medium">{selectedLesson.lessonName || 'Not specified'}</p>
                    </div>
                    </div>

                    {/* Topic and Subject - 2 Column */}
                    <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Topic</label>
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                          <p className="text-sm text-white font-medium">{selectedLesson.topic}</p>
                </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Subject</label>
                        <div className="p-3 bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-lg">
                          <p className="text-sm text-blue-300 font-medium">{selectedLesson.subject}</p>
                        </div>
                      </div>
                    </div>

                    {/* Program and Type - 2 Column */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Program</label>
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                          <p className="text-sm text-white">{selectedLesson.program || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Type</label>
                        <div className="p-3 bg-purple-500/10 backdrop-blur-sm border border-purple-400/30 rounded-lg">
                          <p className="text-sm text-purple-300 font-medium">{selectedLesson.type || 'Lesson'}</p>
                        </div>
                      </div>
                    </div>
                </div>

                  {/* Schedule Information */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-green-400" />
                  </div>
                      <h3 className="text-sm font-medium text-white/90">Schedule & Details</h3>
                  </div>
                    
                    {/* Date and Time - 2 Column */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Date</label>
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-green-400" />
                          <p className="text-sm text-white">
                            {selectedLesson.scheduledDate ? new Date(selectedLesson.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                          </p>
                    </div>
                  </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Time</label>
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg flex items-center gap-2">
                          <Clock className="w-3 h-3 text-green-400" />
                          <p className="text-sm text-white">{selectedLesson.time || 'Not specified'}</p>
                    </div>
                      </div>
                    </div>

                    {/* Duration and Teacher - 2 Column */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Duration (minutes)</label>
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg flex items-center gap-2">
                          <Clock className="w-3 h-3 text-purple-400" />
                          <p className="text-sm text-white">{selectedLesson.duration || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Teacher</label>
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                          <p className="text-sm text-white">{selectedLesson.teacher || 'Not assigned'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Settings className="w-3 h-3 text-orange-400" />
                      </div>
                      <h3 className="text-sm font-medium text-white/90">Additional Options</h3>
                    </div>
                    
                    {/* Status and Video URL - 2 Column */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Status</label>
                        <div className={`p-3 backdrop-blur-sm border rounded-lg flex items-center gap-2 ${
                        selectedLesson.status === 'active' 
                            ? 'bg-green-500/10 border-green-400/30' 
                            : 'bg-yellow-500/10 border-yellow-400/30'
                        }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        selectedLesson.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                          <p className={`text-sm font-medium ${
                            selectedLesson.status === 'active' ? 'text-green-300' : 'text-yellow-300'
                          }`}>
                      {selectedLesson.status === 'active' ? 'Active' : 'Draft'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Video URL</label>
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                          {selectedLesson.videoUrl ? (
                            <div className="flex items-center gap-2">
                              <Play className="w-3 h-3 text-purple-400" />
                              <p className="text-sm text-white truncate">{selectedLesson.videoUrl}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-white/60">No video URL provided</p>
                          )}
                  </div>
                </div>
              </div>
              
                    {/* Zoom Meeting Link - Full Width */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/60 block">Zoom Meeting Link</label>
                      {selectedLesson.zoomLink ? (
                        <div className="p-3 bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-lg flex items-center gap-2">
                          <Video className="w-3 h-3 text-blue-400" />
                          <span className="text-sm text-blue-300 flex-1">Zoom Meeting Available</span>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-3 text-xs"
                            onClick={() => window.open(selectedLesson.zoomLink, '_blank')}
                          >
                            Join Meeting
                          </Button>
                        </div>
                      ) : (
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                          <p className="text-sm text-white/60">No Zoom meeting link provided</p>
                        </div>
                      )}
                    </div>
                  </div>

              {/* Video Content Preview Section - Only show if there's a valid video URL */}
              {selectedLesson.videoUrl && isValidVideoUrl(selectedLesson.videoUrl) && getYouTubeVideoId(selectedLesson.videoUrl) && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Play className="w-3 h-3 text-purple-400" />
                      </div>
                      <h3 className="text-sm font-medium text-white/90">Video Preview</h3>
                    </div>
                  
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/60 block">Video Content</label>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/20">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedLesson.videoUrl)}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=1&cc_load_policy=0&disablekb=0&autohide=1&color=white&controls=1`}
                            title="Lesson Video"
                            className="w-full h-full"
                            allowFullScreen
                            frameBorder="0"
                          />
                        </div>
                        </div>
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <div className="w-6 h-6 bg-slate-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-3 h-3 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-white/90">Metadata</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Created</label>
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                          <p className="text-sm text-white">
                            {new Date(selectedLesson.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })} at {new Date(selectedLesson.createdAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                            })}
                          </p>
                </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 block">Last Updated</label>
                        <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                          <p className="text-sm text-white">
                            {new Date(selectedLesson.updatedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })} at {new Date(selectedLesson.updatedAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
              
                {/* Footer */}
                <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 -m-6 mt-0 border-t border-white/10 flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)} 
                    className="bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                             h-9 px-4 rounded-lg text-sm transition-all duration-200"
              >
                    <X className="w-3 h-3 mr-1" />
                  Close
                </Button>
                <Button 
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 
                             text-white h-9 px-6 rounded-lg text-sm transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEditLesson(selectedLesson)
                  }}
                >
                    <Edit className="w-3 h-3 mr-1" />
                  Edit Lesson
                </Button>
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      
      </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-md bg-slate-900/95 backdrop-blur-2xl border border-red-400/30 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 rounded-2xl"></div>
          <div className="relative">
            <AlertDialogHeader className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-red-400/30">
                <Trash2 className="w-8 h-8 text-red-400" />
    </div>
              <div className="text-center">
                <AlertDialogTitle className="text-xl font-semibold text-white">
                  Delete {selectedLessons.length} Lesson{selectedLessons.length > 1 ? 's' : ''}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/70 mt-2">
                  Are you sure you want to delete {selectedLessons.length > 1 ? 'these' : 'this'} {selectedLessons.length} lesson{selectedLessons.length > 1 ? 's' : ''}? This action cannot be undone and will permanently remove all lesson data.
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 pt-6">
              <AlertDialogCancel className="bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                                          h-10 px-6 rounded-xl transition-all duration-200 flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkDelete}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 
                          text-white h-10 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl 
                          backdrop-blur-sm flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {selectedLessons.length > 1 ? 'All' : 'Lesson'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-md bg-slate-900/95 backdrop-blur-2xl border border-red-400/30 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 rounded-2xl"></div>
          <div className="relative">
            <AlertDialogHeader className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-red-400/30">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <AlertDialogTitle className="text-xl font-semibold text-white">
                  Delete Lesson
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/70 mt-2">
                  Are you sure you want to delete this lesson? This action cannot be undone and will permanently remove the lesson data.
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 pt-6">
              <AlertDialogCancel className="bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                                          h-10 px-6 rounded-xl transition-all duration-200 flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteLesson}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 
                          text-white h-10 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl 
                          backdrop-blur-sm flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Lesson
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
    </TooltipProvider>
  )
}
