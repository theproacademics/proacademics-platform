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
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Play, Users, Clock, Star, Upload, ChevronLeft, ChevronRight, Loader2, Download, MoreHorizontal, CheckSquare, Square, AlertTriangle, Check, X, FileText, Settings, Calendar, Video } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Constants
const ITEMS_PER_PAGE = 10

// Types
interface Lesson {
  _id?: string
  id: string
  title: string
  subject: string
  subtopic?: string
  teacher?: string
  program?: string
  duration?: string
  videoUrl?: string
  status: 'draft' | 'active'
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  week?: string
  grade?: string
}

interface LessonStats {
  totalLessons: number
  activeLessons: number
  draftLessons: number
  totalTeachers: number
  subjectBreakdown: { subject: string; count: number }[]
}

interface PaginatedLessons {
  lessons: Lesson[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface LessonFormData {
  title: string
  subject: string
  subtopic: string
  teacher: string
  program: string
  duration: string
  videoUrl: string
  week: string
  scheduledDate: string
  grade: string
  status: 'draft' | 'active'
}

// Utility functions
const createEmptyFormData = (): LessonFormData => ({
  title: "",
  subject: "",
  subtopic: "",
  teacher: "",
  program: "",
  duration: "",
  videoUrl: "",
  week: "",
  scheduledDate: "",
  grade: "",
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
    ['Topic', 'Subject', 'Subtopic', 'Teacher', 'Program', 'Status', 'Week', 'Grade', 'Scheduled Date', 'Duration', 'Created', 'Video URL'],
    ...lessons.map(lesson => [
      lesson.title,
      lesson.subject,
      lesson.subtopic || '',
      lesson.teacher || '',
      lesson.program || '',
      lesson.status || 'draft',
      lesson.week || '',
      lesson.grade || '',
      lesson.scheduledDate || '',
      lesson.duration || '',
      new Date(lesson.createdAt).toLocaleDateString(),
      lesson.videoUrl || ''
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
  const [stats, setStats] = useState<LessonStats | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])
  const [teachers, setTeachers] = useState<string[]>([])
  
  // Viewing analytics states
  const [viewingStats, setViewingStats] = useState<any>(null)
  const [loadingViewingStats, setLoadingViewingStats] = useState(false)
  
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

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/lessons/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Fetch viewing analytics
  const fetchViewingStats = async () => {
    try {
      setLoadingViewingStats(true)
      const response = await fetch('/api/lessons/track-view')
      if (response.ok) {
        const data = await response.json()
        setViewingStats(data)
      }
    } catch (error) {
      console.error('Error fetching viewing stats:', error)
    } finally {
      setLoadingViewingStats(false)
    }
  }

  // Effect hooks
  useEffect(() => {
    fetchLessons()
  }, [currentPage, searchTerm, selectedSubject, selectedTeacher, selectedStatus, scheduledDateFrom, scheduledDateTo, createdDateFrom, createdDateTo])

  useEffect(() => {
    fetchFilterOptions()
    fetchStats()
    fetchViewingStats()
  }, [])

  // CRUD Operations with optimized error handling
  const handleCreateLesson = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          week: formData.week || '',
          scheduledDate: formData.scheduledDate || '',
          grade: formData.grade || '',
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
        fetchStats(),
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
          week: formData.week || '',
          scheduledDate: formData.scheduledDate || '',
          grade: formData.grade || '',
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
        fetchStats(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error updating lesson:', error)
      toast.error('Failed to update lesson')
    }
  }, [selectedLesson, formData])

  const handleDeleteLesson = useCallback(async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete lesson')
      
      toast.success('Lesson deleted successfully!')
      
      // Refresh data and filters
      await Promise.all([
        fetchLessons(),
        fetchStats(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('Failed to delete lesson')
    }
  }, [])

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
      title: lesson.title || "",
      subject: lesson.subject || "",
      subtopic: lesson.subtopic || "",
      teacher: lesson.teacher || "",
      program: lesson.program || "",
      duration: lesson.duration || "",
      videoUrl: lesson.videoUrl || "",
      week: lesson.week || "",
      scheduledDate: lesson.scheduledDate || "",
      grade: lesson.grade || "",
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

  const handleBulkDelete = useCallback(async () => {
    if (selectedLessons.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedLessons.length} lesson(s)?`)) return
    
    setBulkActionLoading(true)
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
        fetchStats(),
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
        fetchStats(),
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

              {/* Enhanced Stats with Hover Effects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-12">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <Card className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-3 lg:p-6 hover:bg-white/[0.05] transition-all duration-300 hover:scale-105 hover:border-blue-400/30">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-xs lg:text-sm text-slate-400 font-medium mb-1">Total Lessons</p>
                  <p className="text-xl lg:text-3xl font-bold text-white counter-animation">{stats?.totalLessons || 0}</p>
                  <div className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                    All content
              </div>
            </div>
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-5 h-5 lg:w-7 lg:h-7 text-blue-400" />
                </div>
              </div>
        </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <Card className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-3 lg:p-6 hover:bg-white/[0.05] transition-all duration-300 hover:scale-105 hover:border-green-400/30">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-xs lg:text-sm text-slate-400 font-medium mb-1">Active</p>
                  <p className="text-xl lg:text-3xl font-bold text-white counter-animation">{stats?.activeLessons || 0}</p>
                  <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                    Published
              </div>
            </div>
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-5 h-5 lg:w-7 lg:h-7 text-green-400" />
                </div>
              </div>
        </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <Card className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-3 lg:p-6 hover:bg-white/[0.05] transition-all duration-300 hover:scale-105 hover:border-yellow-400/30">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-xs lg:text-sm text-slate-400 font-medium mb-1">Draft</p>
                  <p className="text-xl lg:text-3xl font-bold text-white counter-animation">{stats?.draftLessons || 0}</p>
                  <div className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                    In progress
              </div>
            </div>
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-5 h-5 lg:w-7 lg:h-7 text-yellow-400" />
                </div>
              </div>
        </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <Card className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-3 lg:p-6 hover:bg-white/[0.05] transition-all duration-300 hover:scale-105 hover:border-purple-400/30">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-xs lg:text-sm text-slate-400 font-medium mb-1">Teachers</p>
                  <p className="text-xl lg:text-3xl font-bold text-white counter-animation">{stats?.totalTeachers || 0}</p>
                  <div className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                    Educators
              </div>
            </div>
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5 lg:w-7 lg:h-7 text-purple-400" />
                </div>
              </div>
        </Card>
          </div>
      </div>

        {/* Viewing Analytics Section */}
        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-3xl mb-4 lg:mb-8 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-teal-500/5"></div>
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Viewing Analytics</h3>
                  <p className="text-sm text-slate-400">Real-time lesson engagement metrics</p>
                </div>
              </div>
              <Button
                onClick={fetchViewingStats}
                disabled={loadingViewingStats}
                variant="outline"
                size="sm"
                className="bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 rounded-xl"
              >
                {loadingViewingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {loadingViewingStats ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                  <p className="text-slate-400">Loading analytics...</p>
                </div>
              </div>
            ) : viewingStats ? (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-400/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{viewingStats.totalViewsAcrossAllLessons || 0}</p>
                        <p className="text-sm text-cyan-300">Total Views</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-400/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{viewingStats.totalLessonsViewed || 0}</p>
                        <p className="text-sm text-teal-300">Lessons Viewed</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {viewingStats.lessons?.reduce((total: number, lesson: any) => total + lesson.uniqueViewers, 0) || 0}
                        </p>
                        <p className="text-sm text-emerald-300">Unique Viewers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Viewed Lessons */}
                {viewingStats.lessons && viewingStats.lessons.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      Most Viewed Lessons
                    </h4>
                    <div className="space-y-3">
                      {viewingStats.lessons
                        .sort((a: any, b: any) => b.totalViews - a.totalViews)
                        .slice(0, 5)
                        .map((lessonStat: any) => {
                          const lesson = lessons.find(l => l.id === lessonStat.lessonId)
                          return (
                            <div key={lessonStat.lessonId} className="bg-white/5 border border-white/10 rounded-xl p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium truncate">
                                    {lesson?.title || `Lesson ${lessonStat.lessonId}`}
                                  </p>
                                  {lesson && (
                                    <p className="text-sm text-slate-400">
                                      {lesson.subject} • {lesson.teacher}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="text-center">
                                    <p className="text-cyan-400 font-bold">{lessonStat.totalViews}</p>
                                    <p className="text-slate-400">Views</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-teal-400 font-bold">{lessonStat.uniqueViewers}</p>
                                    <p className="text-slate-400">Unique</p>
                                  </div>
                                  {lessonStat.lastViewed && (
                                    <div className="text-center">
                                      <p className="text-emerald-400 font-bold">
                                        {new Date(lessonStat.lastViewed).toLocaleDateString()}
                                      </p>
                                      <p className="text-slate-400">Last View</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No viewing data available yet</p>
                <p className="text-sm text-slate-500">Analytics will appear when students start watching lessons</p>
              </div>
            )}
          </CardContent>
        </Card>

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
                  placeholder="Search by title, subject, subtopic, teacher, or program..."
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
                    <SelectContent className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl">
                      <SelectItem value="all" className="hover:bg-white/10">All Subjects</SelectItem>
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
                    <SelectContent className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl">
                      <SelectItem value="all" className="hover:bg-white/10">All Teachers</SelectItem>
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
                    <SelectContent className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl">
                      <SelectItem value="all" className="hover:bg-white/10">All Status</SelectItem>
                      <SelectItem value="active" className="hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="draft" className="hover:bg-white/10">
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
              
              <Button 
                variant="outline" 
                onClick={handleDeleteAllLessons}
                disabled={bulkActionLoading || totalLessons === 0}
                className="bg-red-500/10 border border-red-400/30 text-red-400 
                         hover:bg-red-500/20 hover:border-red-400/50 
                         focus:ring-2 focus:ring-red-400/20 focus:border-red-400/60
                         rounded-xl transition-all duration-200 backdrop-blur-sm disabled:opacity-50 h-10 text-xs sm:text-sm"
                title={totalLessons === 0 ? "No lessons to delete" : `Delete all ${totalLessons} lessons`}
              >
                {bulkActionLoading ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                )}
                <span>Delete</span>
              </Button>
              
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
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
              </Dialog>
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
                  onClick={handleBulkDelete}
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
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLessons([])}
                      className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                >
                      <X className="w-4 h-4 mr-2" />
                      Clear
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
                                          <TableHead>Topic</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Subtopic</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Week</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Created</TableHead>
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
                        {lesson.title}
                    </TableCell>
                      <TableCell>{lesson.subject}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{lesson.subtopic || '-'}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{lesson.teacher || '-'}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{lesson.program || '-'}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            lesson.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                          }`}></div>
                          <span className="capitalize text-sm">{lesson.status}</span>
                        </div>
                    </TableCell>
                      <TableCell>{lesson.week || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {lesson.scheduledDate ? new Date(lesson.scheduledDate).toLocaleDateString() : '-'}
                    </TableCell>
                      <TableCell>{lesson.grade || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLesson(lesson)}
                            className="h-8 w-8 p-0 hover:bg-blue-500/10"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLesson(lesson)}
                            className="h-8 w-8 p-0 hover:bg-green-500/10"
                          >
                            <Edit className="w-4 h-4 text-green-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="h-8 w-8 p-0 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
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
                              <h3 className="font-semibold text-white text-sm truncate">{lesson.title}</h3>
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
                            <span className="text-slate-400 font-medium">Teacher</span>
                            <p className="text-white font-medium truncate bg-white/5 px-2 py-1 rounded-lg">{lesson.teacher || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-medium">Program</span>
                            <p className="text-white font-medium truncate bg-white/5 px-2 py-1 rounded-lg">{lesson.program || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-medium">Grade</span>
                            <p className="text-white font-medium bg-white/5 px-2 py-1 rounded-lg text-center">{lesson.grade || '-'}</p>
                          </div>
                        </div>

                        {lesson.subtopic && (
                          <div className="mb-4">
                            <span className="text-xs text-slate-400 font-medium">Subtopic</span>
                            <p className="text-sm text-white mt-1 bg-white/5 px-2 py-1 rounded-lg">{lesson.subtopic}</p>
                          </div>
                        )}

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
                          onClick={() => handleDeleteLesson(lesson.id)}
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
        <DialogContent className="max-w-4xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="pb-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">Create New Lesson</DialogTitle>
                  <p className="text-sm text-slate-400 mt-1">Design and configure your educational content</p>
                </div>
              </div>
              </DialogHeader>
          <div className="space-y-8 p-6">
            {/* Primary Information */}
              <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Lesson Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Topic <span className="text-red-400">*</span>
                  </label>
                <Input 
                    placeholder="Enter lesson topic" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                />
                  </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Subject <span className="text-red-400">*</span>
                  </label>
                <Input 
                    placeholder="Enter subject" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                />
                  </div>
                </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Subtopic</label>
                <Input 
                  placeholder="Enter subtopic (optional)" 
                  value={formData.subtopic}
                  onChange={(e) => setFormData({...formData, subtopic: e.target.value})}
                  className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                />
                  </div>
                </div>

            {/* Educational Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Educational Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Teacher</label>
                <Input 
                    placeholder="Teacher name" 
                    value={formData.teacher}
                    onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                    className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                />
                  </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Week</label>
                    <Input 
                      type="number"
                    placeholder="1-52" 
                      min="1"
                      max="52"
                      value={formData.week}
                      onChange={(e) => setFormData({...formData, week: e.target.value})}
                    className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                    />
                  </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Grade</label>
                    <Input 
                      type="number"
                    placeholder="1-12" 
                      min="1"
                      max="12"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                    />
                  </div>
                </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Program</label>
                <Input 
                  placeholder="Program name"
                  value={formData.program}
                  onChange={(e) => setFormData({...formData, program: e.target.value})}
                  className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                />
              </div>
            </div>

            {/* Schedule & Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Schedule & Media
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Status</label>
                    <Select value={formData.status} onValueChange={(value: 'draft' | 'active') => setFormData({...formData, status: value})}>
                    <SelectTrigger className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    <SelectContent className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl">
                      <SelectItem value="draft" className="hover:bg-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span>📝 Draft</span>
                          </div>
                        </SelectItem>
                      <SelectItem value="active" className="hover:bg-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>✅ Active</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Duration (minutes)</label>
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
                    className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                  />
                  {formData.duration && (
                    <p className="text-xs text-blue-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formData.duration}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Scheduled Date</label>
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
                    className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                    />
                    {formData.scheduledDate && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {(() => {
                        const d = new Date(formData.scheduledDate)
                        return !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : formData.scheduledDate
                      })()}
                      </p>
                    )}
                  </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Video URL (Optional)</label>
                <Input 
                  placeholder="YouTube/Vimeo URL" 
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                />
                </div>
                

                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)} 
                className="flex-1 sm:flex-none bg-white/5 border border-white/20 text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                onClick={handleCreateLesson}
                disabled={!formData.title || !formData.subject}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
            </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

      {/* Enhanced Edit Lesson Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-500/10 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="pb-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Edit className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">Edit Lesson</DialogTitle>
                  <p className="text-sm text-slate-400 mt-1">Update and modify lesson content</p>
                </div>
              </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Input 
                  placeholder="Topic" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="glass-card border-white/20" 
                />
        </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input 
                  placeholder="Subject" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="glass-card border-white/20" 
                />
      </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subtopic</label>
                <Input 
                  placeholder="Subtopic (optional)" 
                  value={formData.subtopic}
                  onChange={(e) => setFormData({...formData, subtopic: e.target.value})}
                  className="glass-card border-white/20" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Teacher</label>
                <Input 
                  placeholder="Teacher name" 
                  value={formData.teacher}
                  onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  className="glass-card border-white/20" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Week</label>
                <Input 
                  type="number"
                  placeholder="1" 
                  min="1"
                  max="52"
                  value={formData.week}
                  onChange={(e) => setFormData({...formData, week: e.target.value})}
                  className="glass-card border-white/20" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Grade</label>
                <Input 
                  type="number"
                  placeholder="10" 
                  min="1"
                  max="12"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="glass-card border-white/20" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'active') => setFormData({...formData, status: value})}>
                  <SelectTrigger className="glass-card border-white/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>📝 Draft</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>✅ Active</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Scheduled Date</label>
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
                  className="bg-white/[0.03] border border-white/20 rounded-xl text-white hover:bg-white/[0.05] focus:border-purple-400/50 transition-all duration-200" 
                  />
                  {formData.scheduledDate && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {(() => {
                        const d = new Date(formData.scheduledDate)
                        return !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : formData.scheduledDate
                      })()}
                      </p>
                    )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                <Input 
                  type="number"
                  placeholder="minutes" 
                  min="1"
                  max="300"
                  value={formData.duration ? formData.duration.replace(/[^0-9]/g, '') : ''}
                  onChange={(e) => {
                    const minutes = e.target.value
                    setFormData({...formData, duration: minutes ? `${minutes} min` : ''})
                  }}
                  className="glass-card border-white/20" 
                />
                {formData.duration && (
                  <p className="text-xs text-blue-400 mt-1">
                    ⏱️ {formData.duration}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Video URL (Optional)</label>
                <Input 
                  placeholder="YouTube/Vimeo URL" 
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  className="glass-card border-white/20" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Program</label>
                <Input 
                  placeholder="Program name"
                  value={formData.program}
                  onChange={(e) => setFormData({...formData, program: e.target.value})}
                  className="glass-card border-white/20" 
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-500 to-green-600"
                onClick={handleUpdateLesson}
                disabled={!formData.title || !formData.subject}
              >
                Update Lesson
              </Button>
            </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced View Lesson Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="pb-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">Lesson Details</DialogTitle>
                  <p className="text-sm text-slate-400 mt-1">Complete lesson information and content</p>
                </div>
              </div>
          </DialogHeader>
          {selectedLesson && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Topic</h3>
                    <p className="text-lg font-semibold">{selectedLesson.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Subject</h3>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">
                      {selectedLesson.subject}
                    </Badge>
                  </div>

                  {selectedLesson.subtopic && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Subtopic</h3>
                      <p className="text-sm">{selectedLesson.subtopic}</p>
                    </div>
                  )}
                  {selectedLesson.grade && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Grade</h3>
                      <p className="text-sm">Grade {selectedLesson.grade}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Teacher</h3>
                    <p className="text-sm">{selectedLesson.teacher}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Program</h3>
                    <p className="text-sm">{selectedLesson.program}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">{selectedLesson.duration}</span>
                    </div>
                  </div>
                  {selectedLesson.scheduledDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Scheduled Date</h3>
                      <p className="text-sm">{selectedLesson.scheduledDate}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <Badge 
                      variant="outline" 
                      className={`${
                        selectedLesson.status === 'active' 
                          ? 'border-green-400/50 bg-green-400/10 text-green-400' 
                          : 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400'
                      } text-xs font-medium px-3 py-1 flex items-center gap-2 w-fit`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        selectedLesson.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                      {selectedLesson.status === 'active' ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              </div>
              

              
              {selectedLesson.videoUrl && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Video Content</h3>
                  {isValidVideoUrl(selectedLesson.videoUrl) && getYouTubeVideoId(selectedLesson.videoUrl) ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedLesson.videoUrl)}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=1&cc_load_policy=0&disablekb=0&autohide=1&color=white&controls=1`}
                        title="Lesson Video"
                        className="w-full h-full"
                        allowFullScreen
                        frameBorder="0"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <Play className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{selectedLesson.videoUrl}</span>
                    </div>
                  )}
                </div>
              )}
              

              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <p className="text-sm">{new Date(selectedLesson.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })} at {new Date(selectedLesson.createdAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  })}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <p className="text-sm">{new Date(selectedLesson.updatedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })} at {new Date(selectedLesson.updatedAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  })}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEditLesson(selectedLesson)
                  }}
                  className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Edit className="w-4 h-4 mr-2" />
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
    </div>
  )
}
