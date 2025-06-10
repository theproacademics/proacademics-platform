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
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Play, Users, Clock, Star, Upload, ChevronLeft, ChevronRight, Loader2, Download, MoreHorizontal, CheckSquare, Square, Youtube, AlertTriangle, Check, X, FileText, Settings } from "lucide-react"
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
  instructor?: string
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
  totalInstructors: number
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
  instructor: string
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
  instructor: "",
  duration: "",
  videoUrl: "",
  week: "",
  scheduledDate: "",
  grade: "",
  status: "draft"
})

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
    ['Topic', 'Subject', 'Subtopic', 'Instructor', 'Status', 'Week', 'Grade', 'Scheduled Date', 'Duration', 'Created', 'Video URL'],
    ...lessons.map(lesson => [
      lesson.title,
      lesson.subject,
      lesson.subtopic || '',
      lesson.instructor || '',
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
  const [instructors, setInstructors] = useState<string[]>([])
  
  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedInstructor, setSelectedInstructor] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
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
        instructor: selectedInstructor,
        status: selectedStatus
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
      const [subjectsRes, instructorsRes] = await Promise.all([
        fetch('/api/admin/lessons/filters/subjects'),
        fetch('/api/admin/lessons/filters/instructors')
      ])
      
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json()
        setSubjects(subjectsData.subjects || [])
      }
      
      if (instructorsRes.ok) {
        const instructorsData = await instructorsRes.json()
        setInstructors(instructorsData.instructors || [])
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

  // Effect hooks
  useEffect(() => {
    fetchLessons()
  }, [currentPage, searchTerm, selectedSubject, selectedInstructor, selectedStatus])

  useEffect(() => {
    fetchFilterOptions()
    fetchStats()
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

  const handleInstructorFilter = useCallback((value: string) => {
    setSelectedInstructor(value)
    setCurrentPage(1)
  }, [])

  const handleStatusFilter = useCallback((value: string) => {
    setSelectedStatus(value)
    setCurrentPage(1)
  }, [])

  const handleEditLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson)
    setFormData({
      title: lesson.title,
      subject: lesson.subject,
      subtopic: lesson.subtopic || "",
      instructor: lesson.instructor || "",
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
    <div className="p-4 lg:p-8 lg:pt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Lesson Management</h1>
        <p className="text-muted-foreground">Create, edit, and manage educational lessons and courses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-2xl font-bold text-blue-400">{stats?.totalLessons || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Lessons</p>
                <p className="text-2xl font-bold text-green-400">{stats?.activeLessons || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft Lessons</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.draftLessons || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Instructors</p>
                <p className="text-2xl font-bold text-purple-400">{stats?.totalInstructors || 0}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 glass-card border-white/20"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSubject} onValueChange={handleSubjectFilter}>
            <SelectTrigger className="w-40 glass-card border-white/20">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.filter(subject => 
                subject && 
                subject.trim() !== '' && 
                subject.trim() !== '-' &&
                subject.toLowerCase() !== 'undefined' &&
                subject.toLowerCase() !== 'null'
              ).map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedInstructor} onValueChange={handleInstructorFilter}>
            <SelectTrigger className="w-40 glass-card border-white/20">
              <SelectValue placeholder="Instructor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Instructors</SelectItem>
              {instructors.filter(instructor => 
                instructor && 
                instructor.trim() !== '' && 
                instructor.trim() !== '-' &&
                instructor.toLowerCase() !== 'undefined' &&
                instructor.toLowerCase() !== 'null'
              ).map(instructor => (
                <SelectItem key={instructor} value={instructor}>{instructor}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-40 glass-card border-white/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Active</span>
                </div>
              </SelectItem>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Draft</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleExportLessons}
            className="border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDeleteAllLessons}
            disabled={bulkActionLoading || totalLessons === 0}
            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
            title={totalLessons === 0 ? "No lessons to delete" : `Delete all ${totalLessons} lessons`}
          >
            {bulkActionLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete All
          </Button>
          
          <Link href="/admin/lessons/import">
            <Button variant="outline" className="border-green-500/20 text-green-400 hover:bg-green-500/10">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </Link>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLessons.length > 0 && (
        <Card className="glass-card futuristic-border mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedLessons.length} lesson(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportLessons()}
                  className="border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
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
                  className="text-muted-foreground"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons Table */}
      <Card className="glass-card futuristic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lessons ({totalLessons})</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
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
                <TableHead>Instructor</TableHead>
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
                  <TableCell colSpan={11} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading lessons...</p>
                  </TableCell>
                </TableRow>
              ) : lessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No lessons found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm || selectedSubject !== 'all' || selectedInstructor !== 'all' || selectedStatus !== 'all'
                        ? "Try adjusting your filters" 
                        : "Create your first lesson to get started"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                lessons.map((lesson) => (
                  <TableRow key={lesson.id} className={selectedLessons.includes(lesson.id) ? "bg-blue-500/10" : ""}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectLesson(lesson.id)}
                        className="h-6 w-6 p-0"
                      >
                        {selectedLessons.includes(lesson.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-white">{lesson.title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        {lesson.subject}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${!lesson.subtopic || lesson.subtopic === '-' ? 'border-red-400 text-red-400' : 'border-purple-400 text-purple-400'} text-xs whitespace-nowrap`}>
                        {lesson.subtopic || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-300">{lesson.instructor || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Badge 
                          variant="outline" 
                          className={`${
                            lesson.status === 'active' 
                              ? 'border-green-400/50 bg-green-400/10 text-green-400' 
                              : 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400'
                          } text-xs font-medium px-3 py-1 flex items-center gap-2`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            lesson.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                          }`}></div>
                          {lesson.status === 'active' ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className={`text-sm font-medium ${!lesson.week || lesson.week === '' ? 'text-gray-500' : 'text-blue-400'}`}>
                          {lesson.week || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${!lesson.scheduledDate || lesson.scheduledDate === '' ? 'text-gray-500' : ''}`}>
                        {lesson.scheduledDate || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <Badge variant="outline" className={`${!lesson.grade || lesson.grade === '' ? 'border-gray-500 text-gray-500' : 'border-green-400 text-green-400'} text-xs`}>
                          {lesson.grade || '-'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        <div>{new Date(lesson.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: '2-digit', 
                          year: 'numeric' 
                        })}</div>
                        <div className="text-xs text-gray-500">{new Date(lesson.createdAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          hour12: true 
                        })}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300"
                          onClick={() => handleViewLesson(lesson)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-yellow-400 hover:text-yellow-300" 
                          onClick={() => handleEditLesson(lesson)}
                          title="Edit Lesson"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300" 
                          onClick={() => handleDeleteLesson(lesson.id)}
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && lessons.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalLessons)} of {totalLessons} lessons
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="glass-card border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
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
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Lesson Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl glass-card">
              <DialogHeader>
                <DialogTitle>Create New Lesson</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-3 gap-4">
                  <div>
                <label className="text-sm font-medium mb-2 block">Instructor</label>
                <Input 
                  placeholder="Instructor name" 
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
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
                          // Try to parse existing date formats
                          const dateStr = formData.scheduledDate
                          if (dateStr.includes('/')) {
                            // Handle "Monday 15/09/25" format
                            const parts = dateStr.split(' ')
                            if (parts.length > 1) {
                              const datePart = parts[1] // "15/09/25"
                              const [day, month, year] = datePart.split('/')
                              const fullYear = year.length === 2 ? `20${year}` : year
                              return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                            }
                          }
                          // Try direct parsing
                          return new Date(dateStr).toISOString().split('T')[0]
                        } catch {
                          return ''
                        }
                      })() : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value)
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
                          const formattedDate = `${dayName} ${date.toLocaleDateString('en-GB')}`
                          setFormData({...formData, scheduledDate: formattedDate})
                        } else {
                          setFormData({...formData, scheduledDate: ''})
                        }
                      }}
                      className="glass-card border-white/20" 
                    />
                    {formData.scheduledDate && (
                      <p className="text-xs text-green-400 mt-1">
                        📅 {formData.scheduledDate}
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
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600"
                onClick={handleCreateLesson}
                disabled={!formData.title || !formData.subject}
              >
                Create Lesson
              </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl glass-card">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Instructor</label>
                <Input 
                  placeholder="Instructor name" 
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
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
                      // Try to parse existing date formats
                      const dateStr = formData.scheduledDate
                      if (dateStr.includes('/')) {
                        // Handle "Monday 15/09/25" format
                        const parts = dateStr.split(' ')
                        if (parts.length > 1) {
                          const datePart = parts[1] // "15/09/25"
                          const [day, month, year] = datePart.split('/')
                          const fullYear = year.length === 2 ? `20${year}` : year
                          return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                        }
                      }
                      // Try direct parsing
                      return new Date(dateStr).toISOString().split('T')[0]
                    } catch {
                      return ''
                    }
                  })() : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value)
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
                      const formattedDate = `${dayName} ${date.toLocaleDateString('en-GB')}`
                      setFormData({...formData, scheduledDate: formattedDate})
                    } else {
                      setFormData({...formData, scheduledDate: ''})
                    }
                  }}
                  className="glass-card border-white/20" 
                />
                {formData.scheduledDate && (
                  <p className="text-xs text-green-400 mt-1">
                    📅 {formData.scheduledDate}
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
        </DialogContent>
      </Dialog>

      {/* View Lesson Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl glass-card">
          <DialogHeader>
            <DialogTitle>Lesson Details</DialogTitle>
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
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Instructor</h3>
                    <p className="text-sm">{selectedLesson.instructor}</p>
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
                  {selectedLesson.week && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Week</h3>
                      <p className="text-sm">Week {selectedLesson.week}</p>
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
                  {isValidVideoUrl(selectedLesson.videoUrl) ? (
                    <div className="space-y-2">
                      {getYouTubeVideoId(selectedLesson.videoUrl) ? (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedLesson.videoUrl)}`}
                            title="Lesson Video"
                            className="w-full h-full"
                            allowFullScreen
                            frameBorder="0"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                          <Youtube className="w-4 h-4 text-red-400" />
                          <a 
                            href={selectedLesson.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 underline"
                          >
                            {selectedLesson.videoUrl}
                          </a>
                        </div>
                      )}
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
        </DialogContent>
      </Dialog>

      
    </div>
  )
}
