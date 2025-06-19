"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, ChevronLeft, ChevronRight, Loader2, CheckSquare, Square, AlertTriangle, Check, X, FileText, Edit, Trash2, ArrowLeft, Search } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Constants
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
interface ImportLesson {
  title: string
  subject: string
  subtopic?: string
  teacher?: string
  program?: string
  duration?: string
  videoUrl?: string
  status: 'draft' | 'active'
  scheduledDate?: string
  week?: string
  grade?: string
  description?: string
}

// Utility functions
const generateUniqueId = (): string => `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const isValidVideoUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
}



// Enhanced parsing utility to handle both CSV and TSV with multi-line content
const parseDelimitedData = (text: string): string[][] => {
  const lines = text.split('\n')
  const result: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    let j = 0

    while (j < line.length) {
      const char = line[j]

      if (char === '"') {
        if (inQuotes && j + 1 < line.length && line[j + 1] === '"') {
          // Double quote - add single quote to cell
          currentCell += '"'
          j += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          j++
        }
      } else if (!inQuotes && (char === ',' || char === '\t')) {
        // End of cell - check if tab or comma separated
        currentRow.push(currentCell.trim())
        currentCell = ''
        j++
      } else {
        currentCell += char
        j++
      }
    }

    if (inQuotes) {
      // Multi-line cell - add line break and continue to next line
      currentCell += '\n'
      i++
    } else {
      // End of row
      currentRow.push(currentCell.trim())
      result.push(currentRow)
      currentRow = []
      currentCell = ''
      i++
    }
  }

  // Handle last row if exists
  if (currentRow.length > 0 || currentCell.length > 0) {
    currentRow.push(currentCell.trim())
    result.push(currentRow)
  }

  return result
}

export default function LessonsImportPage() {
  // Import states  
  const [isImporting, setIsImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<ImportLesson[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState('')
  const [selectedImportRows, setSelectedImportRows] = useState<string[]>([])
  const [importPreviewFilter, setImportPreviewFilter] = useState("")
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editRowData, setEditRowData] = useState<Partial<ImportLesson>>({})
  const [previewCurrentPage, setPreviewCurrentPage] = useState(1)
  const [defaultStatus, setDefaultStatus] = useState<'active' | 'draft'>('active')
  const [csvText, setCsvText] = useState<string>('')

  // Enhanced parsing to handle CSV/TSV with multi-line content
  const parseCSV = useCallback((csvText: string, statusDefault: 'active' | 'draft' = 'active'): ImportLesson[] => {
    const parsedRows = parseDelimitedData(csvText)
    if (parsedRows.length === 0) return []
    
    const headers = parsedRows[0].map(h => h.trim())
    console.log('Headers found:', headers)
    console.log('Sample data rows:', parsedRows.slice(1, 3))
    

    
    // Create a header mapping function for case-insensitive lookup
    const findHeaderValue = (row: any, possibleNames: string[]) => {
      for (const name of possibleNames) {
        // Try exact match first
        if (row[name] !== undefined && row[name] !== '') {
          return row[name]
        }
        // Try case-insensitive match
        const lowerName = name.toLowerCase()
        const matchingKey = Object.keys(row).find(key => 
          key.toLowerCase() === lowerName
        )
        if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== '') {
          return row[matchingKey]
        }
      }
      return null
    }
    
    const data = parsedRows.slice(1).map((values, index) => {
      const row: any = {}
      
      // Map headers exactly as they appear
      headers.forEach((header, i) => {
        const value = (values[i] || '').replace(/^"|"$/g, '').trim()
        row[header] = value
      })
      
      // Extract values only if the corresponding headers exist
      const topicValue = findHeaderValue(row, ['Topic', 'Title', 'Lesson Title', 'Lesson Name', 'Sub-topic', 'Subtopic', 'Sub topic'])
      const subjectValue = findHeaderValue(row, ['Subject', 'Course', 'Class'])
      const moduleValue = findHeaderValue(row, ['Module', 'Topic', 'Unit', 'Chapter'])
      const subtopicValue = findHeaderValue(row, ['Sub-topic', 'Subtopic', 'Sub topic', 'Detail', 'Description'])
      const instructorValue = findHeaderValue(row, ['Instructor', 'Teacher', 'Tutor', 'Educator'])
      const durationValue = findHeaderValue(row, ['Duration', 'Time', 'Length'])
      const videoUrlValue = findHeaderValue(row, ['Video URL', 'VideoURL', 'Video Link', 'URL', 'Link'])

      const descriptionValue = findHeaderValue(row, ['Description', 'Details', 'Notes', 'Content'])
      const weekValue = findHeaderValue(row, ['Week', 'Week Number', 'Week #'])
      const dateValue = findHeaderValue(row, ['Date', 'Scheduled Date', 'Lesson Date'])
      const gradeValue = findHeaderValue(row, ['Grade', 'Class', 'Level', 'Year'])
      
      
      // Clean up multi-line content - replace line breaks with commas for better display
      const cleanTitle = topicValue ? topicValue.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim() : null
      const cleanSubtopic = subtopicValue ? subtopicValue.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim() : null
      
      // Determine the best title - prefer explicit title, then subtopic, then generate one
      let finalTitle = cleanTitle || cleanSubtopic
      if (!finalTitle) {
        // If we have a module/topic, use that with lesson number
        if (moduleValue) {
          finalTitle = `${moduleValue} - Lesson ${index + 1}`
        } else {
          finalTitle = `Lesson ${index + 1}`
        }
      }
      
      // Skip completely empty rows
      if (!finalTitle && !subjectValue && !moduleValue && !subtopicValue) {
        return null
      }
      
      // Skip break entries
      const breakTerms = ['break', 'holiday', 'vacation', 'recess']
      if (breakTerms.some(term => 
        finalTitle?.toLowerCase().includes(term) || 
        moduleValue?.toLowerCase().includes(term) ||
        subtopicValue?.toLowerCase().includes(term)
      )) {
        return null
      }
      
             // Format date if it exists
       let formattedDate = ''
       if (dateValue) {
         formattedDate = dateValue.trim()
         // Handle common date formats and clean them up
         formattedDate = formattedDate.replace(/\s+/g, ' ').trim()
       }
       
       // Clean and format week
       let formattedWeek = ''
       if (weekValue) {
         formattedWeek = weekValue.toString().trim()
         // Extract just the number if it's like "Week 1" or "1"
         const weekMatch = formattedWeek.match(/(\d+)/)
         if (weekMatch) {
           formattedWeek = weekMatch[1]
         }
       }
       
       // Clean and format grade
       let formattedGrade = ''
       if (gradeValue) {
         formattedGrade = gradeValue.toString().trim()
         // Extract grade number/level
         const gradeMatch = formattedGrade.match(/(?:Grade\s*)?(\d+|[A-Z]+)/i)
         if (gradeMatch) {
           formattedGrade = gradeMatch[1]
         }
       }
       
       // Use the selected default status for all lessons
       const formattedStatus: 'draft' | 'active' = statusDefault

       // Build lesson object with proper fallbacks and "missing" indicators
       const lesson: ImportLesson = {
         title: finalTitle,
         subject: subjectValue || '-', // Only use if Subject header exists
         subtopic: cleanSubtopic || '-',
         teacher: instructorValue || '-',
         program: moduleValue || '-',
         duration: durationValue || '-',
         videoUrl: videoUrlValue || '',
         status: formattedStatus,
         scheduledDate: formattedDate || '',
         week: formattedWeek || '',
         grade: formattedGrade || '',
         description: descriptionValue || '',
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString()
       }
      
      return lesson
    }).filter(lesson => lesson !== null) // Remove null entries
    
    return data
  }, [])

  const handleImport = useCallback(async () => {
    const lessonsToImport = selectedImportRows.length > 0 
      ? importPreview.filter(lesson => selectedImportRows.includes(lesson.title))
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
        setImportPreview([])
        setCsvFile(null)
        setSelectedImportRows([])
        setImportPreviewFilter("")
        setPreviewCurrentPage(1)
        setImportProgress(0)
        setImportStatus('')
        
        // Navigate back to lessons page after successful import
        window.location.href = '/admin/lessons'
      }, 2000)
      
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
        (row.subtopic && row.subtopic.toLowerCase().includes(importPreviewFilter.toLowerCase())) ||
        (row.teacher && row.teacher.toLowerCase().includes(importPreviewFilter.toLowerCase())) ||
        (row.duration && row.duration.toLowerCase().includes(importPreviewFilter.toLowerCase())) ||
        (row.week && row.week.toLowerCase().includes(importPreviewFilter.toLowerCase())) ||
        (row.grade && row.grade.toLowerCase().includes(importPreviewFilter.toLowerCase())) ||
        (row.scheduledDate && row.scheduledDate.toLowerCase().includes(importPreviewFilter.toLowerCase()))
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
      setSelectedImportRows(filteredImportRows.map(row => row.title))
    }
  }, [selectedImportRows.length, filteredImportRows])

  const validateImportRow = useCallback((row: ImportLesson) => {
    const errors = []
    if (!row.title || row.title.trim() === '') errors.push('Title is required')
    if (!row.subject || row.subject.trim() === '' || row.subject === '-') errors.push('Subject is missing from CSV')
    
    if (row.videoUrl && row.videoUrl.trim() !== '' && !isValidVideoUrl(row.videoUrl)) {
      errors.push('Invalid video URL format')
    }
    
    return errors
  }, [])

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validExtensions = ['.csv', '.tsv', '.txt']
    const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext)) || 
                       file.type === 'text/csv' || 
                       file.type === 'text/tab-separated-values' ||
                       file.type === 'text/plain'
    
    if (!isValidFile) {
      toast.error('Please select a valid CSV, TSV, or text file')
      return
    }

    setCsvFile(file)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const csvTextContent = e.target?.result as string
      if (csvTextContent) {
        try {
          setCsvText(csvTextContent) // Store for re-parsing
          const parsedLessons = parseCSV(csvTextContent, defaultStatus)
          setImportPreview(parsedLessons)
          setSelectedImportRows(parsedLessons.map(lesson => lesson.title))
          setPreviewCurrentPage(1)
          toast.success(`Successfully parsed ${parsedLessons.length} lessons from CSV`)
        } catch (error) {
          console.error('Error parsing CSV:', error)
          toast.error('Error parsing CSV file. Please check the format.')
        }
      }
    }
    
    reader.onerror = () => {
      toast.error('Error reading CSV file')
    }
    
    reader.readAsText(file)
  }, [parseCSV])

  // Handle default status change and re-parse CSV
  const handleDefaultStatusChange = useCallback((newStatus: 'active' | 'draft') => {
    setDefaultStatus(newStatus)
    
    if (csvText) {
      try {
        const parsedLessons = parseCSV(csvText, newStatus)
        setImportPreview(parsedLessons)
        setSelectedImportRows(parsedLessons.map(lesson => lesson.title))
        toast.success(`Updated default status to ${newStatus} for ${parsedLessons.length} lessons`)
      } catch (error) {
        console.error('Error re-parsing CSV:', error)
        toast.error('Error updating lesson status')
      }
    }
  }, [csvText, parseCSV])

  const handleEditImportRow = useCallback((lesson: ImportLesson) => {
    setEditingRow(lesson.title)
    setEditRowData(lesson)
  }, [])

  const handleSaveEditRow = useCallback(() => {
    if (!editingRow) return
    
    setImportPreview(prev => prev.map(row => 
      row.title === editingRow 
        ? { ...row, ...editRowData }
        : row
    ))
    setEditingRow(null)
    setEditRowData({})
    toast.success('Row updated successfully')
  }, [editingRow, editRowData])

  const handleDeleteImportRow = useCallback((rowId: string) => {
    setImportPreview(prev => prev.filter(row => row.title !== rowId))
    setSelectedImportRows(prev => prev.filter(id => id !== rowId))
    toast.success('Row removed from import')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/lessons">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Lessons
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Import Lessons from CSV/TSV</h1>
            <p className="text-muted-foreground mt-1">Upload and preview your lesson data before importing (supports tab-separated and comma-separated files)</p>
          </div>
        </div>

        {/* File Upload Section */}
        <Card className="glass-card futuristic-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload CSV/TSV File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {csvFile && (
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="font-medium">File uploaded: {csvFile.name}</span>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  {importPreview.length} lessons parsed
                </Badge>
              </div>
            )}
            
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 bg-gradient-to-br from-white/5 to-white/10 hover:border-white/30 transition-all duration-200">
              <input
                type="file"
                accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">Click to upload CSV/TSV file</p>
                    <p className="text-sm text-gray-400">Supports .csv, .tsv, .txt files up to 10MB</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 max-w-5xl mx-auto">
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                      <strong className="text-green-400 block text-sm">Common Headers</strong>
                      <span className="text-xs text-gray-300 mt-1 block">Title, Topic, Subject, Week, Date, Grade</span>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                      <strong className="text-blue-400 block text-sm">Alternative Names</strong>
                      <span className="text-xs text-gray-300 mt-1 block">Sub-topic, Subtopic, Module, Course, Class</span>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
                      <strong className="text-yellow-400 block text-sm">Status Column</strong>
                      <span className="text-xs text-gray-300 mt-1 block">Optional: Active, Draft, State</span>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-center">
                      <strong className="text-purple-400 block text-sm">Smart Defaults</strong>
                      <span className="text-xs text-gray-300 mt-1 block">Auto-detects columns, customizable status</span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Import Progress */}
        {isImporting && (
          <Card className="glass-card futuristic-border mb-8">
            <CardContent className="p-6">
              <div className="space-y-3">
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
            </CardContent>
          </Card>
        )}

        {/* Preview Section */}
        {importPreview.length > 0 && (
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-3">
                  <CardTitle>Preview ({importStats.total} lessons)</CardTitle>
                  
                                    {/* Default Status Selection */}
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-400 mb-2">
                          Set Default Status for Imported Lessons
                        </p>
                        <p className="text-xs text-blue-400/80 mb-3">
                          Choose the status that will be applied to all imported lessons:
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDefaultStatusChange('active')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                              defaultStatus === 'active'
                                ? 'border-green-400 bg-green-400/20 text-green-400'
                                : 'border-gray-400 bg-gray-400/10 text-gray-400 hover:border-green-400/50'
                            }`}
                          >
                            ✅ Set as Active
                          </button>
                          <button
                            onClick={() => handleDefaultStatusChange('draft')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                              defaultStatus === 'draft'
                                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                                : 'border-gray-400 bg-gray-400/10 text-gray-400 hover:border-yellow-400/50'
                            }`}
                          >
                            📝 Set as Draft
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllImportRows}
                    className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                  >
                    {selectedImportRows.length === filteredImportRows.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search Filter */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search preview..."
                    value={importPreviewFilter}
                    onChange={(e) => setImportPreviewFilter(e.target.value)}
                    className="pl-10 max-w-md glass-card border-white/20"
                  />
                </div>
              </div>
              
              {/* Preview Table */}
              <div className="border border-white/20 rounded-lg overflow-hidden bg-white/5">
                <div className="overflow-x-auto">
                  <div className="max-h-[500px] overflow-y-auto">
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
                          <TableHead className="min-w-[200px]">Title</TableHead>
                          <TableHead className="min-w-[120px]">Subject</TableHead>
                          <TableHead className="min-w-[120px]">Subtopic</TableHead>
                          <TableHead className="min-w-[120px]">Instructor</TableHead>
                          <TableHead className="min-w-[100px]">Duration</TableHead>
                          <TableHead className="min-w-[80px]">Status</TableHead>
                          <TableHead className="min-w-[100px]">Week</TableHead>
                          <TableHead className="min-w-[120px]">Date</TableHead>
                          <TableHead className="min-w-[80px]">Grade</TableHead>
                          <TableHead className="w-20 text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedImportRows.map((lesson: ImportLesson) => {
                          const errors = validateImportRow(lesson)
                          const hasErrors = errors.length > 0
                          const isSelected = selectedImportRows.includes(lesson.title)
                          const isEditing = editingRow === lesson.title
                          
                          return (
                            <TableRow 
                              key={lesson.title} 
                              className={`${isSelected ? "bg-blue-500/10" : ""} ${hasErrors ? "bg-red-500/5" : ""} border-white/10`}
                            >
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSelectImportRow(lesson.title)}
                                  className="h-6 w-6 p-0"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-blue-400" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </Button>
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
                                    value={editRowData.subtopic || ''}
                                    onChange={(e) => setEditRowData({...editRowData, subtopic: e.target.value})}
                                    className="h-8 text-xs"
                                  />
                                ) : (
                                  <Badge variant="outline" className={`${!lesson.subtopic || lesson.subtopic === '-' ? 'border-red-400 text-red-400' : 'border-purple-400 text-purple-400'} text-xs whitespace-nowrap`}>
                                    {lesson.subtopic || '-'}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input 
                                    value={editRowData.teacher || ''}
                                    onChange={(e) => setEditRowData({...editRowData, teacher: e.target.value})}
                                    className="h-8 text-xs"
                                    placeholder="Instructor name"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-300">{lesson.teacher || '-'}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input 
                                    value={editRowData.duration ? editRowData.duration.replace(/[^0-9]/g, '') : ''}
                                    onChange={(e) => {
                                      const minutes = e.target.value
                                      setEditRowData({...editRowData, duration: minutes ? `${minutes} min` : ''})
                                    }}
                                    className="h-8 text-xs"
                                    placeholder="Duration"
                                    type="number"
                                    min="1"
                                    max="300"
                                  />
                                ) : (
                                  <div className="text-center">
                                    <span className="text-sm text-gray-300">{lesson.duration || '-'}</span>
                                  </div>
                                )}
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
                                {isEditing ? (
                                  <Input 
                                    value={editRowData.week || ''}
                                    onChange={(e) => setEditRowData({...editRowData, week: e.target.value})}
                                    className="h-8 text-xs"
                                    placeholder="Week number"
                                  />
                                ) : (
                                  <div className="text-center">
                                    <span className={`text-sm font-medium ${!lesson.week || lesson.week === '' ? 'text-gray-500' : 'text-blue-400'}`}>
                                      {lesson.week || '-'}
                                    </span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input 
                                    value={editRowData.scheduledDate || ''}
                                    onChange={(e) => setEditRowData({...editRowData, scheduledDate: e.target.value})}
                                    className="h-8 text-xs"
                                    placeholder="Date"
                                  />
                                ) : (
                                  <span className={`text-sm ${!lesson.scheduledDate || lesson.scheduledDate === '' ? 'text-gray-500' : ''}`}>
                                    {lesson.scheduledDate || '-'}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input 
                                    value={editRowData.grade || ''}
                                    onChange={(e) => setEditRowData({...editRowData, grade: e.target.value})}
                                    className="h-8 text-xs"
                                    placeholder="Grade"
                                  />
                                ) : (
                                  <div className="text-center">
                                    <Badge variant="outline" className={`${!lesson.grade || lesson.grade === '' ? 'border-gray-500 text-gray-500' : 'border-green-400 text-green-400'} text-xs`}>
                                      {lesson.grade || '-'}
                                    </Badge>
                                  </div>
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
                                        onClick={() => handleDeleteImportRow(lesson.title)}
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
                
                {/* Pagination */}
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
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
                  Clear Data
                </Button>
                <Button 
                  className="bg-gradient-to-r from-green-500 to-green-600 min-w-[180px]"
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 
