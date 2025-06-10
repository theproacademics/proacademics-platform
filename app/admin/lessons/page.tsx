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
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Play, Users, Clock, Star, Upload, ChevronLeft, ChevronRight, Loader2, Copy, Download, MoreHorizontal, CheckSquare, Square, Youtube, AlertTriangle, Check, X, FileText, Settings } from "lucide-react"
import { toast } from "sonner"

// Constants
const ITEMS_PER_PAGE = 10
const PREVIEW_ITEMS_PER_PAGE = 10
const IMPORT_STEPS = {
  PREPARING: { progress: 10, message: 'Preparing import...' },
  VALIDATING: { progress: 20, message: 'Validating data...' },
  PROCESSING: { progress: 40, message: 'Processing lessons...' },
  SAVING: { progress: 70, message: 'Saving to database...' },
  FINALIZING: { progress: 90, message: 'Finalizing...' },
  COMPLETED: { progress: 100, message: 'Import completed!' }
}

// Types
interface Lesson {
  _id?: string
  id: string
  title: string
  subject: string
  module: string
  instructor?: string
  duration?: string
  description?: string
  videoUrl?: string
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  week?: string
  grade?: string
}

interface LessonStats {
  totalLessons: number
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
  module: string
  instructor: string
  duration: string
  description: string
  videoUrl: string
}

// Utility functions
const createEmptyFormData = (): LessonFormData => ({
  title: "",
  subject: "",
  module: "",
  instructor: "",
  duration: "",
  description: "",
  videoUrl: ""
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
    ['Title', 'Subject', 'Module', 'Instructor', 'Duration', 'Created', 'Description', 'Video URL'],
    ...lessons.map(lesson => [
      lesson.title,
      lesson.subject,
      lesson.module,
      lesson.instructor || '',
      lesson.duration || '',
      new Date(lesson.createdAt).toLocaleDateString(),
      lesson.description || '',
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

// CSV parsing utility
const parseCSVLine = (line: string): string[] => {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLessons, setTotalLessons] = useState(0)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  
  // Bulk operations
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
  // Import states  
  const [isImporting, setIsImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<Lesson[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState('')
  const [selectedImportRows, setSelectedImportRows] = useState<string[]>([])
  const [importPreviewFilter, setImportPreviewFilter] = useState("")
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editRowData, setEditRowData] = useState<Partial<Lesson>>({})
  const [previewCurrentPage, setPreviewCurrentPage] = useState(1)
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
        instructor: selectedInstructor
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
  }, [currentPage, searchTerm, selectedSubject, selectedInstructor])

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
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create lesson')
      
      toast.success('Lesson created successfully!')
      setIsCreateDialogOpen(false)
      setFormData(createEmptyFormData())
      fetchLessons()
      fetchStats()
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
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update lesson')
      
      toast.success('Lesson updated successfully!')
      setIsEditDialogOpen(false)
      setSelectedLesson(null)
      setFormData(createEmptyFormData())
      fetchLessons()
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
      fetchLessons()
      fetchStats()
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

  const handleEditLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson)
    setFormData({
      title: lesson.title,
      subject: lesson.subject,
      module: lesson.module,
      instructor: lesson.instructor || "",
      duration: lesson.duration || "",
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || ""
    })
    setIsEditDialogOpen(true)
  }, [])

  const handleViewLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsViewDialogOpen(true)
  }, [])

  const handleDuplicateLesson = useCallback(async (lesson: Lesson) => {
    try {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${lesson.title} (Copy)`,
          subject: lesson.subject,
          module: lesson.module,
          instructor: lesson.instructor || "",
          duration: lesson.duration || "",
          description: lesson.description || "",
          videoUrl: lesson.videoUrl || ""
        })
      })

      if (!response.ok) throw new Error('Failed to duplicate lesson')
      
      toast.success('Lesson duplicated successfully!')
      fetchLessons()
      fetchStats()
    } catch (error) {
      console.error('Error duplicating lesson:', error)
      toast.error('Failed to duplicate lesson')
    }
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
      fetchLessons()
      fetchStats()
    } catch (error) {
      console.error('Error bulk deleting lessons:', error)
      toast.error('Failed to delete lessons')
    } finally {
      setBulkActionLoading(false)
    }
  }, [selectedLessons])

  const handleBulkDuplicate = useCallback(async () => {
    if (selectedLessons.length === 0) return
    
    setBulkActionLoading(true)
    try {
      const selectedLessonObjects = lessons.filter(lesson => selectedLessons.includes(lesson.id))
      
      const duplicatePromises = selectedLessonObjects.map(lesson =>
        fetch('/api/admin/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${lesson.title} (Copy)`,
            subject: lesson.subject,
            module: lesson.module,
            instructor: lesson.instructor || "",
            duration: lesson.duration || "",
            description: lesson.description || "",
            videoUrl: lesson.videoUrl || ""
          })
        })
      )
      
      const results = await Promise.all(duplicatePromises)
      const successCount = results.filter(r => r.ok).length
      
      if (successCount === selectedLessons.length) {
        toast.success(`Successfully duplicated ${successCount} lesson(s)`)
      } else {
        toast.warning(`Duplicated ${successCount} out of ${selectedLessons.length} lesson(s)`)
      }
      
      setSelectedLessons([])
      fetchLessons()
      fetchStats()
    } catch (error) {
      console.error('Error bulk duplicating lessons:', error)
      toast.error('Failed to duplicate lessons')
    } finally {
      setBulkActionLoading(false)
    }
  }, [selectedLessons, lessons])

  // Export handler with optimization
  const handleExportLessons = useCallback(() => {
    const lessonsToExport = selectedLessons.length > 0 
      ? lessons.filter(lesson => selectedLessons.includes(lesson.id))
      : lessons

    exportToCSV(lessonsToExport, `lessons_export_${new Date().toISOString().split('T')[0]}.csv`)
    toast.success(`Exported ${lessonsToExport.length} lesson(s)`)
  }, [selectedLessons, lessons])

  // Optimized import handlers with better error handling
  const parseCSV = useCallback((csvText: string): Lesson[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length === 0) return []
    
    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
    console.log('CSV Headers found:', headers)
    
    const data = lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line)
      const row: any = {}
      
      headers.forEach((header, i) => {
        const cleanHeader = header.replace(/[^a-z0-9]/g, '')
        row[cleanHeader] = (values[i] || '').replace(/^"|"$/g, '').trim()
      })
      
      // Map CSV columns according to expected format: Week, Date, Topic, Sub-topic, Grade
      const lesson: Lesson = {
        id: generateUniqueId(),
        title: row.subtopic || row.title || `Lesson ${index + 1}`,
        subject: row.topic || row.subject || '',
        module: row.subtopic || row.module || row.topic || '',
        instructor: row.instructor || '',
        duration: row.duration || '',
        videoUrl: row.videourl || row.video || row.videolink || '',
        description: row.description || '',
        scheduledDate: row.date || '',
        week: row.week || '',
        grade: row.grade || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return lesson
    })
    
    return data
  }, [])

  const handleImport = useCallback(async () => {
    const lessonsToImport = selectedImportRows.length > 0 
      ? importPreview.filter(lesson => selectedImportRows.includes(lesson.id))
      : importPreview
    
    if (lessonsToImport.length === 0) return
    
    setIsImporting(true)
    setImportProgress(IMPORT_STEPS.PREPARING.progress)
    setImportStatus(IMPORT_STEPS.PREPARING.message)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setImportProgress(IMPORT_STEPS.VALIDATING.progress)
      setImportStatus(IMPORT_STEPS.VALIDATING.message)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setImportProgress(IMPORT_STEPS.PROCESSING.progress)
      setImportStatus(IMPORT_STEPS.PROCESSING.message)
      
      const response = await fetch('/api/admin/lessons/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: lessonsToImport })
      })

      if (!response.ok) throw new Error('Failed to import lessons')
      
      setImportProgress(IMPORT_STEPS.SAVING.progress)
      setImportStatus(IMPORT_STEPS.SAVING.message)
      
      const data = await response.json()
      
      setImportProgress(IMPORT_STEPS.FINALIZING.progress)
      setImportStatus(IMPORT_STEPS.FINALIZING.message)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setImportProgress(IMPORT_STEPS.COMPLETED.progress)
      setImportStatus(IMPORT_STEPS.COMPLETED.message)
      
      toast.success(`Successfully imported ${data.count} lessons!`)
      
      setTimeout(() => {
        setIsImportDialogOpen(false)
        setImportPreview([])
        setCsvFile(null)
        setSelectedImportRows([])
        setImportPreviewFilter("")
        setPreviewCurrentPage(1)
        setImportProgress(0)
        setImportStatus('')
      }, 1000)
      
      fetchLessons()
      fetchStats()
    } catch (error) {
      console.error('Error importing lessons:', error)
      setImportStatus('Import failed!')
      toast.error('Failed to import lessons')
      setTimeout(() => {
        setImportProgress(0)
        setImportStatus('')
      }, 2000)
    } finally {
      setTimeout(() => {
        setIsImporting(false)
      }, 1000)
    }
  }, [selectedImportRows, importPreview])

  // Memoized computed values for better performance
  const filteredImportRows = useMemo(() => {
    let filtered = importPreview
    
    if (importPreviewFilter) {
      filtered = filtered.filter(row =>
        row.title.toLowerCase().includes(importPreviewFilter.toLowerCase()) ||
        row.subject.toLowerCase().includes(importPreviewFilter.toLowerCase()) ||
        (row.instructor && row.instructor.toLowerCase().includes(importPreviewFilter.toLowerCase()))
      )
    }
    
    return filtered
  }, [importPreview, importPreviewFilter])

  const paginatedImportRows = useMemo(() => {
    const startIndex = (previewCurrentPage - 1) * PREVIEW_ITEMS_PER_PAGE
    const endIndex = startIndex + PREVIEW_ITEMS_PER_PAGE
    return filteredImportRows.slice(startIndex, endIndex)
  }, [filteredImportRows, previewCurrentPage])

  const importStats = useMemo(() => {
    const total = importPreview.length
    const selected = selectedImportRows.length
    const withErrors = importPreview.filter(row => {
      const errors = []
      if (!row.title || row.title.trim() === '') errors.push('Title required')
      if (!row.subject || row.subject.trim() === '') errors.push('Subject required')
      if (row.videoUrl && row.videoUrl.trim() !== '' && !isValidVideoUrl(row.videoUrl)) {
        errors.push('Invalid video URL')
      }
      return errors.length > 0
    }).length
    const valid = total - withErrors
    
    return { total, selected: selected || total, withErrors, valid }
  }, [importPreview, selectedImportRows])

  // Enhanced helper functions
  const handleSelectImportRow = useCallback((rowId: string) => {
    setSelectedImportRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    )
  }, [])

  const handleSelectAllImportRows = useCallback(() => {
    if (selectedImportRows.length === filteredImportRows.length) {
      setSelectedImportRows([])
    } else {
      setSelectedImportRows(filteredImportRows.map(row => row.id))
    }
  }, [selectedImportRows.length, filteredImportRows])

  const validateImportRow = useCallback((row: Lesson) => {
    const errors = []
    if (!row.title || row.title.trim() === '') errors.push('Title (Sub-topic) is required')
    if (!row.subject || row.subject.trim() === '') errors.push('Subject (Topic) is required')
    
    if (row.videoUrl && row.videoUrl.trim() !== '' && !isValidVideoUrl(row.videoUrl)) {
      errors.push('Invalid video URL format')
    }
    
    return errors
  }, [])

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }
    
    setCsvFile(file)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const csvText = e.target?.result as string
      console.log('CSV file content:', csvText)
      
      try {
        const parsed = parseCSV(csvText)
        console.log('Parsed CSV data:', parsed)
        
        if (parsed.length === 0) {
          toast.error('No data found in CSV file')
          return
        }
        
        setImportPreview(parsed)
        toast.success(`Loaded ${parsed.length} lessons for preview`)
      } catch (error) {
        console.error('Error parsing CSV:', error)
        toast.error('Error parsing CSV file. Please check the format.')
      }
    }
    
    reader.onerror = () => {
      console.error('Error reading file')
      toast.error('Error reading file')
    }
    
    reader.readAsText(file)
  }, [parseCSV])

  // Import row editing handlers
  const handleEditImportRow = useCallback((row: Lesson) => {
    setEditingRow(row.id)
    setEditRowData({
      title: row.title,
      subject: row.subject,
      module: row.module,
      instructor: row.instructor,
      duration: row.duration,
      description: row.description,
      videoUrl: row.videoUrl
    })
  }, [])

  const handleSaveEditRow = useCallback(() => {
    if (!editingRow) return
    
    setImportPreview(prev => prev.map(row => 
      row.id === editingRow 
        ? { ...row, ...editRowData }
        : row
    ))
    setEditingRow(null)
    setEditRowData({})
    toast.success('Row updated successfully')
  }, [editingRow, editRowData])

  const handleDeleteImportRow = useCallback((rowId: string) => {
    setImportPreview(prev => prev.filter(row => row.id !== rowId))
    setSelectedImportRows(prev => prev.filter(id => id !== rowId))
    toast.success('Row removed from import')
  }, [])

  return (
    <div className="p-4 lg:p-8 lg:pt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Lesson Management</h1>
        <p className="text-muted-foreground">Create, edit, and manage educational lessons and courses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-2xl font-bold">{stats?.totalLessons || totalLessons}</p>
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
                <p className="text-2xl font-bold text-green-400">{lessons.length}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Instructors</p>
                <p className="text-2xl font-bold text-purple-400">{stats?.totalInstructors || instructors.length}</p>
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
              {subjects.filter(subject => subject && subject.trim() !== '').map(subject => (
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
              {instructors.filter(instructor => instructor && instructor.trim() !== '').map(instructor => (
                <SelectItem key={instructor} value={instructor}>{instructor}</SelectItem>
              ))}
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
          
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-500/20 text-green-400 hover:bg-green-500/10">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
          </Dialog>
          
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
                  onClick={handleBulkDuplicate}
                  disabled={bulkActionLoading}
                  className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                >
                  {bulkActionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Duplicate
                </Button>
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
                <TableHead>Lesson</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading lessons...</p>
                  </TableCell>
                </TableRow>
              ) : lessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No lessons found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm || selectedSubject !== 'all' || selectedInstructor !== 'all' 
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
                      <div>
                        <p className="font-medium text-white">{lesson.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{lesson.module}</span>
                          {lesson.grade && (
                            <>
                              <span>•</span>
                              <span>Grade {lesson.grade}</span>
                            </>
                          )}
                          {lesson.scheduledDate && (
                            <>
                              <span>•</span>
                              <span>{lesson.scheduledDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        {lesson.subject}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-300">{lesson.instructor}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span className="text-sm text-gray-300">{lesson.duration}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </span>
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
                          className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
                          onClick={() => handleDuplicateLesson(lesson)}
                          title="Duplicate Lesson"
                        >
                          <Copy className="w-4 h-4" />
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
                    <label className="text-sm font-medium mb-2 block">Title</label>
                <Input 
                  placeholder="Lesson title" 
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Module</label>
                <Input 
                  placeholder="Module name" 
                  value={formData.module}
                  onChange={(e) => setFormData({...formData, module: e.target.value})}
                  className="glass-card border-white/20" 
                />
                  </div>
                  <div>
                <label className="text-sm font-medium mb-2 block">Instructor</label>
                <Input 
                  placeholder="Instructor name" 
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  className="glass-card border-white/20" 
                />
                  </div>
                </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Input 
                  placeholder="e.g. 45 min" 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="glass-card border-white/20" 
                />
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
            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea 
                placeholder="Lesson description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="glass-card border-white/20" 
              />
            </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600"
                onClick={handleCreateLesson}
                disabled={!formData.title || !formData.subject || !formData.module}
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
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input 
                  placeholder="Lesson title" 
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Module</label>
                <Input 
                  placeholder="Module name" 
                  value={formData.module}
                  onChange={(e) => setFormData({...formData, module: e.target.value})}
                  className="glass-card border-white/20" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Instructor</label>
                <Input 
                  placeholder="Instructor name" 
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  className="glass-card border-white/20" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Input 
                  placeholder="e.g. 45 min" 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="glass-card border-white/20" 
                />
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
            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea 
                placeholder="Lesson description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="glass-card border-white/20" 
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-500 to-green-600"
                onClick={handleUpdateLesson}
                disabled={!formData.title || !formData.subject || !formData.module}
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
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                    <p className="text-lg font-semibold">{selectedLesson.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Subject</h3>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">
                      {selectedLesson.subject}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Module</h3>
                    <p className="text-sm">{selectedLesson.module}</p>
                  </div>
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
                </div>
              </div>
              
              {selectedLesson.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm bg-white/5 p-3 rounded-lg border border-white/10">
                    {selectedLesson.description}
                  </p>
                </div>
              )}
              
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
                  <p className="text-sm">{new Date(selectedLesson.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <p className="text-sm">{new Date(selectedLesson.updatedAt).toLocaleString()}</p>
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
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleDuplicateLesson(selectedLesson)
                    setIsViewDialogOpen(false)
                  }}
                  className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={isImporting ? undefined : setIsImportDialogOpen}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] glass-card relative overflow-hidden">
          {/* Loading Overlay */}
          {isImporting && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
              <div className="bg-gray-900/90 p-6 rounded-lg border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <div>
                    <div className="font-medium text-white">Importing Lessons</div>
                    <div className="text-sm text-gray-400">{importStatus}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogHeader className="pb-4">
            <DialogTitle>Import Lessons from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">CSV File</label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 bg-gradient-to-br from-white/5 to-white/10 hover:border-white/30 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload-enhanced"
                />
                <label htmlFor="csv-upload-enhanced" className="cursor-pointer">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-sm font-medium">Click to upload CSV file</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                      <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                        <strong className="text-green-400">Required:</strong> Week, Date, Topic, Sub-topic, Grade
                      </div>
                      <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                        <strong className="text-blue-400">Optional:</strong> Instructor, Duration, Video URL
                      </div>
                    </div>
                    <p className="text-xs text-blue-400 mt-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                      Column mapping: Topic → Subject, Sub-topic → Title
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Enhanced Import Preview */}
            {importPreview.length > 0 && (
              <div className="space-y-4">
                {/* Preview Header with Stats */}
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Preview ({importStats.total} lessons)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                          <Check className="w-4 h-4 text-green-400" />
                          <div>
                            <div className="text-sm font-medium text-green-400">{importStats.valid}</div>
                            <div className="text-xs text-green-400/70">Valid</div>
                          </div>
                        </div>
                        {importStats.withErrors > 0 && (
                          <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <div>
                              <div className="text-sm font-medium text-yellow-400">{importStats.withErrors}</div>
                              <div className="text-xs text-yellow-400/70">Issues</div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                          <div>
                            <div className="text-sm font-medium text-blue-400">{importStats.selected}</div>
                            <div className="text-xs text-blue-400/70">Selected</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                        {csvFile?.name}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowValidationErrors(!showValidationErrors)}
                        className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        {showValidationErrors ? 'Hide' : 'Show'} Issues
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search preview..."
                        value={importPreviewFilter}
                        onChange={(e) => setImportPreviewFilter(e.target.value)}
                        className="pl-10 glass-card border-white/20"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllImportRows}
                    className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                  >
                    {selectedImportRows.length === filteredImportRows.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                {/* Enhanced Preview Table */}
                <div className="border border-white/20 rounded-lg overflow-hidden bg-white/5 shadow-lg">
                  <div className="overflow-x-auto">
                    <div className="max-h-80 overflow-y-auto min-w-[800px]">
                      <Table>
                        <TableHeader className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm">
                          <TableRow className="border-white/20">
                            <TableHead className="w-12 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAllImportRows}
                                className="h-6 w-6 p-0"
                              >
                                {selectedImportRows.length === filteredImportRows.length && filteredImportRows.length > 0 ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </Button>
                            </TableHead>
                            <TableHead className="w-16 text-center">Status</TableHead>
                            <TableHead className="min-w-[200px]">Title</TableHead>
                            <TableHead className="min-w-[120px]">Subject</TableHead>
                            <TableHead className="min-w-[120px]">Instructor</TableHead>
                            <TableHead className="min-w-[100px]">Duration</TableHead>
                            <TableHead className="w-20 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedImportRows.map((lesson: Lesson) => {
                            const errors = validateImportRow(lesson)
                            const hasErrors = errors.length > 0
                            const isSelected = selectedImportRows.includes(lesson.id)
                            const isEditing = editingRow === lesson.id
                            
                            return (
                              <TableRow 
                                key={lesson.id} 
                                className={`${isSelected ? "bg-blue-500/10" : ""} ${hasErrors && showValidationErrors ? "bg-red-500/5" : ""} border-white/10`}
                              >
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectImportRow(lesson.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="w-4 h-4 text-blue-400" />
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell className="text-center">
                                  {hasErrors ? (
                                    <div className="flex items-center justify-center gap-1" title={errors.join(', ')}>
                                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                      <span className="text-xs text-yellow-400">{errors.length}</span>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center">
                                      <Check className="w-4 h-4 text-green-400" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Input 
                                      value={editRowData.title || ''}
                                      onChange={(e) => setEditRowData({...editRowData, title: e.target.value})}
                                      className="h-8 text-xs"
                                    />
                                  ) : (
                                    <div className="max-w-[200px] truncate">
                                      <span className={`font-medium ${!lesson.title ? 'text-red-400' : ''}`}>
                                        {lesson.title || 'Missing Title'}
                                      </span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Input 
                                      value={editRowData.subject || ''}
                                      onChange={(e) => setEditRowData({...editRowData, subject: e.target.value})}
                                      className="h-8 text-xs"
                                    />
                                  ) : (
                                    <Badge variant="outline" className={`${!lesson.subject ? 'border-red-400 text-red-400' : 'border-blue-400 text-blue-400'} text-xs whitespace-nowrap`}>
                                      {lesson.subject || 'Missing'}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Input 
                                      value={editRowData.instructor || ''}
                                      onChange={(e) => setEditRowData({...editRowData, instructor: e.target.value})}
                                      className="h-8 text-xs"
                                      placeholder="Instructor name"
                                    />
                                  ) : (
                                    <div className="max-w-[120px] truncate">
                                      <span className={`text-sm ${!lesson.instructor || lesson.instructor.trim() === '' ? 'text-gray-500 italic' : ''}`}>
                                        {lesson.instructor && lesson.instructor.trim() !== '' ? lesson.instructor : 'Not specified'}
                                      </span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Input 
                                      value={editRowData.duration || ''}
                                      onChange={(e) => setEditRowData({...editRowData, duration: e.target.value})}
                                      className="h-8 text-xs"
                                    />
                                  ) : (
                                    <span className="text-sm whitespace-nowrap">{lesson.duration || 'N/A'}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {isEditing ? (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={handleSaveEditRow}
                                          className="h-7 w-7 p-0 text-green-400 hover:text-green-300"
                                        >
                                          <Check className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setEditingRow(null)}
                                          className="h-7 w-7 p-0 text-gray-400 hover:text-gray-300"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditImportRow(lesson)}
                                          className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300"
                                          title="Edit Row"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteImportRow(lesson.id)}
                                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                                          title="Remove Row"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                            </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  {/* Preview Pagination */}
                  {filteredImportRows.length > PREVIEW_ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between p-3 border-t border-white/20">
                      <div className="text-sm text-muted-foreground">
                        Showing {((previewCurrentPage - 1) * PREVIEW_ITEMS_PER_PAGE) + 1} to {Math.min(previewCurrentPage * PREVIEW_ITEMS_PER_PAGE, filteredImportRows.length)} of {filteredImportRows.length} rows
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewCurrentPage(Math.max(1, previewCurrentPage - 1))}
                          disabled={previewCurrentPage === 1}
                          className="glass-card border-white/20"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">{previewCurrentPage} / {Math.ceil(filteredImportRows.length / PREVIEW_ITEMS_PER_PAGE)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewCurrentPage(Math.min(Math.ceil(filteredImportRows.length / PREVIEW_ITEMS_PER_PAGE), previewCurrentPage + 1))}
                          disabled={previewCurrentPage >= Math.ceil(filteredImportRows.length / PREVIEW_ITEMS_PER_PAGE)}
                          className="glass-card border-white/20"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Import Progress Indicator */}
            {isImporting && (
              <div className="space-y-3 p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-400">Import Progress</span>
                  <span className="text-sm text-muted-foreground">{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-muted-foreground">{importStatus}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsImportDialogOpen(false)
                  setImportPreview([])
                  setCsvFile(null)
                  setSelectedImportRows([])
                  setImportPreviewFilter("")
                  setPreviewCurrentPage(1)
                  setImportProgress(0)
                  setImportStatus('')
                }}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-500 to-green-600 min-w-[160px]"
                onClick={handleImport}
                disabled={importPreview.length === 0 || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="animate-pulse">Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {importStats.selected} Lessons
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
