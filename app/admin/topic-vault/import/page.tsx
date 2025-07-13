"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, ChevronLeft, ChevronRight, Loader2, CheckSquare, Square, AlertTriangle, Check, X, FileText, Edit, Trash2, ArrowLeft, Search, Video } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Constants
const PREVIEW_ITEMS_PER_PAGE = 10
const IMPORT_STEPS = {
  PREPARING: { progress: 10, message: 'Preparing import...' },
  VALIDATING: { progress: 20, message: 'Validating data...' },
  PROCESSING: { progress: 40, message: 'Processing topic vaults...' },
  SAVING: { progress: 70, message: 'Saving to database...' },
  FINALIZING: { progress: 90, message: 'Finalizing...' },
  COMPLETED: { progress: 100, message: 'Import completed!' }
}

// Types
interface ImportTopicVault {
  videoName: string
  topic: string
  subject: string
  program: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description?: string
  zoomLink?: string
  videoEmbedLink: string
  status: 'draft' | 'active'
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export default function TopicVaultImportPage() {
  // File and CSV states
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<ImportTopicVault[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showValidationErrors, setShowValidationErrors] = useState(true)
  
  // Import states
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState('')
  
  // Preview states
  const [previewCurrentPage, setPreviewCurrentPage] = useState(1)
  const [importPreviewFilter, setImportPreviewFilter] = useState("")
  const [selectedImportRows, setSelectedImportRows] = useState<string[]>([])

  // CSV parsing function
  const parseCSV = useCallback((text: string): ImportTopicVault[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data: ImportTopicVault[] = []
    const errors: ValidationError[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        // Map common header variations to our expected fields
        const normalizedHeader = header.toLowerCase().replace(/[_\s]/g, '')
        
        switch (normalizedHeader) {
          case 'videoname':
          case 'video':
          case 'name':
            row.videoName = value
            break
          case 'topic':
          case 'title':
            row.topic = value
            break
          case 'subject':
            row.subject = value
            break
          case 'program':
          case 'programme':
            row.program = value
            break
          case 'type':
          case 'contenttype':
            row.type = value || 'Lesson'
            break
          case 'duration':
          case 'length':
          case 'time':
            row.duration = value
            break
          case 'teacher':
          case 'instructor':
          case 'tutor':
            row.teacher = value
            break
          case 'description':
          case 'desc':
          case 'summary':
            row.description = value
            break
          case 'zoomlink':
          case 'zoom':
          case 'meetinglink':
            row.zoomLink = value
            break
          case 'videoembedlink':
          case 'videolink':
          case 'embedlink':
          case 'videourl':
          case 'url':
            row.videoEmbedLink = value
            break
          case 'status':
            row.status = value || 'draft'
            break
          default:
            // Handle other variations
            if (normalizedHeader.includes('video') && normalizedHeader.includes('name')) {
              row.videoName = value
            } else if (normalizedHeader.includes('embed') || normalizedHeader.includes('url')) {
              row.videoEmbedLink = value
            } else if (normalizedHeader.includes('zoom')) {
              row.zoomLink = value
            }
        }
      })

      // Validate required fields
      const requiredFields = ['videoName', 'topic', 'subject', 'program', 'teacher', 'videoEmbedLink']
      let hasError = false

      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push({
            row: i,
            field,
            message: `${field} is required`
          })
          hasError = true
        }
      })

      // Validate type
      if (row.type && !['Lesson', 'Tutorial', 'Workshop'].includes(row.type)) {
        errors.push({
          row: i,
          field: 'type',
          message: 'Type must be Lesson, Tutorial, or Workshop'
        })
        hasError = true
      }

      // Validate status
      if (row.status && !['draft', 'active'].includes(row.status)) {
        errors.push({
          row: i,
          field: 'status',
          message: 'Status must be draft or active'
        })
        hasError = true
      }

      if (!hasError) {
        data.push({
          videoName: row.videoName,
          topic: row.topic,
          subject: row.subject,
          program: row.program,
          type: row.type || 'Lesson',
          duration: row.duration || '',
          teacher: row.teacher,
          description: row.description || '',
          zoomLink: row.zoomLink || '',
          videoEmbedLink: row.videoEmbedLink,
          status: row.status || 'draft'
        })
      }
    }

    setValidationErrors(errors)
    return data
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setCsvFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setImportPreview(parsed)
      setPreviewCurrentPage(1)
      setSelectedImportRows([])
      
      if (parsed.length > 0) {
        toast.success(`Parsed ${parsed.length} topic vaults from CSV`)
      } else {
        toast.error('No valid topic vaults found in CSV')
      }
    }
    reader.readAsText(file)
  }, [parseCSV])

  // Filter preview data
  const filteredPreview = useMemo(() => {
    if (!importPreviewFilter) return importPreview
    return importPreview.filter(item => 
      item.videoName.toLowerCase().includes(importPreviewFilter.toLowerCase()) ||
      item.topic.toLowerCase().includes(importPreviewFilter.toLowerCase()) ||
      item.subject.toLowerCase().includes(importPreviewFilter.toLowerCase()) ||
      item.teacher.toLowerCase().includes(importPreviewFilter.toLowerCase())
    )
  }, [importPreview, importPreviewFilter])

  // Pagination for preview
  const previewTotalPages = Math.ceil(filteredPreview.length / PREVIEW_ITEMS_PER_PAGE)
  const previewStartIndex = (previewCurrentPage - 1) * PREVIEW_ITEMS_PER_PAGE
  const previewEndIndex = previewStartIndex + PREVIEW_ITEMS_PER_PAGE
  const currentPreviewItems = filteredPreview.slice(previewStartIndex, previewEndIndex)

  // Handle row selection
  const handleSelectImportRow = useCallback((videoName: string) => {
    setSelectedImportRows(prev => 
      prev.includes(videoName) 
        ? prev.filter(name => name !== videoName)
        : [...prev, videoName]
    )
  }, [])

  const handleSelectAllImportRows = useCallback(() => {
    if (selectedImportRows.length === currentPreviewItems.length) {
      setSelectedImportRows([])
    } else {
      setSelectedImportRows(currentPreviewItems.map(item => item.videoName))
    }
  }, [selectedImportRows.length, currentPreviewItems])

  // Handle import
  const handleImport = useCallback(async () => {
    const topicVaultsToImport = selectedImportRows.length > 0 
      ? importPreview.filter(topicVault => selectedImportRows.includes(topicVault.videoName))
      : importPreview
    
    if (topicVaultsToImport.length === 0) return
    
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
      
      const response = await fetch('/api/admin/topic-vault/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicVaults: topicVaultsToImport })
      })

      if (!response.ok) throw new Error('Failed to import topic vaults')
      
      setImportProgress(IMPORT_STEPS.SAVING.progress)
      setImportStatus(IMPORT_STEPS.SAVING.message)
      
      const data = await response.json()
      
      setImportProgress(IMPORT_STEPS.FINALIZING.progress)
      setImportStatus(IMPORT_STEPS.FINALIZING.message)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setImportProgress(IMPORT_STEPS.COMPLETED.progress)
      setImportStatus(IMPORT_STEPS.COMPLETED.message)
      
      toast.success(`Successfully imported ${data.count} topic vaults!`)
      
      setTimeout(() => {
        setImportPreview([])
        setCsvFile(null)
        setSelectedImportRows([])
        setImportPreviewFilter("")
        setPreviewCurrentPage(1)
        setImportProgress(0)
        setImportStatus('')
        
        // Navigate back to topic vault page after successful import
        window.location.href = '/admin/topic-vault'
      }, 2000)
      
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import topic vaults')
      setImportProgress(0)
      setImportStatus('')
    } finally {
      setIsImporting(false)
    }
  }, [selectedImportRows, importPreview])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/50 to-purple-900 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-800/30 via-transparent to-purple-800/30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none" />
      
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-14 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden">
          
          {/* Header */}
          <div className="mb-6 lg:mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/admin/topic-vault">
                <Button variant="ghost" className="glass-button text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Topic Vault
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Upload className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
                <span className="text-xs lg:text-sm text-blue-300 font-medium tracking-wider uppercase">CSV Import</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 tracking-tight">
                Import Topic Vaults
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
                Upload a CSV file to import multiple topic vaults at once
              </p>
            </div>
          </div>

          {/* CSV Template Download */}
          <Card className="mb-6 lg:mb-8 glass-card-transparent border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
                CSV Template & Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-medium mb-2">Required CSV Columns:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  <span className="text-green-400">• videoName (required)</span>
                  <span className="text-green-400">• topic (required)</span>
                  <span className="text-green-400">• subject (required)</span>
                  <span className="text-green-400">• program (required)</span>
                  <span className="text-green-400">• teacher (required)</span>
                  <span className="text-green-400">• videoEmbedLink (required)</span>
                  <span className="text-blue-400">• type (optional: Lesson/Tutorial/Workshop)</span>
                  <span className="text-blue-400">• duration (optional)</span>
                  <span className="text-blue-400">• description (optional)</span>
                  <span className="text-blue-400">• zoomLink (optional)</span>
                  <span className="text-blue-400">• status (optional: draft/active)</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    const csvContent = `videoName,topic,subject,program,type,duration,teacher,description,zoomLink,videoEmbedLink,status
"Introduction to Algebra","Basic Algebra","Mathematics","GCSE","Lesson","45 minutes","Mr. Smith","Introduction to algebraic concepts","https://zoom.us/j/123456789","https://youtube.com/embed/abc123","active"
"Chemical Reactions","Acids and Bases","Chemistry","A-Level","Tutorial","30 minutes","Dr. Johnson","Understanding chemical reactions","","https://youtube.com/embed/def456","draft"`
                    const blob = new Blob([csvContent], { type: 'text/csv' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'topic_vault_template.csv'
                    a.click()
                    window.URL.revokeObjectURL(url)
                  }}
                  className="glass-button bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="mb-6 lg:mb-8 glass-card-transparent border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="w-5 h-5 mr-2 text-green-400" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/30 transition-colors">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-white font-medium">Upload your topic vault CSV file</p>
                  <p className="text-sm text-muted-foreground">
                    Select a CSV file with topic vault data
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-4 glass-input bg-white/5 border-white/20 text-white file:bg-blue-500/20 file:text-blue-400 file:border-blue-500/30"
                />
                {csvFile && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-400">
                    <Check className="w-4 h-4" />
                    File uploaded: {csvFile.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Validation Errors */}
          {validationErrors.length > 0 && showValidationErrors && (
            <Card className="mb-6 lg:mb-8 glass-card-transparent border-red-500/30 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-400 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Validation Errors ({validationErrors.length})
                  </CardTitle>
                  <Button
                    onClick={() => setShowValidationErrors(false)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="bg-red-500/10 border border-red-500/20 rounded p-2 text-sm">
                      <span className="text-red-400 font-medium">Row {error.row}:</span>{' '}
                      <span className="text-white">{error.field} - {error.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Preview */}
          {importPreview.length > 0 && (
            <Card className="mb-6 lg:mb-8 glass-card-transparent border-white/10 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-white flex items-center">
                    <Video className="w-5 h-5 mr-2 text-purple-400" />
                    Import Preview ({filteredPreview.length} topic vaults)
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Filter preview..."
                        value={importPreviewFilter}
                        onChange={(e) => setImportPreviewFilter(e.target.value)}
                        className="glass-input pl-10 h-9 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSelectAllImportRows}
                        variant="ghost"
                        size="sm"
                        className="glass-button"
                      >
                        {selectedImportRows.length === currentPreviewItems.length && currentPreviewItems.length > 0 ? (
                          <CheckSquare className="w-4 h-4 mr-2" />
                        ) : (
                          <Square className="w-4 h-4 mr-2" />
                        )}
                        Select All
                      </Button>
                      {selectedImportRows.length > 0 && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {selectedImportRows.length} selected
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={handleImport}
                      disabled={isImporting || importPreview.length === 0}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Import {selectedImportRows.length > 0 ? `${selectedImportRows.length} Selected` : 'All'}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Import Progress */}
                  {isImporting && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white">{importStatus}</span>
                        <span className="text-sm text-muted-foreground">{importProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableHead className="w-12">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAllImportRows}
                                className="w-6 h-6 p-0 hover:bg-white/10"
                              >
                                {selectedImportRows.length === currentPreviewItems.length && currentPreviewItems.length > 0 ? (
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPreviewItems.map((topicVault, index) => (
                          <TableRow key={index} className="border-white/10 hover:bg-white/5 transition-colors">
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSelectImportRow(topicVault.videoName)}
                                  className="w-6 h-6 p-0 hover:bg-white/10"
                                >
                                  {selectedImportRows.includes(topicVault.videoName) ? (
                                    <CheckSquare className="w-4 h-4 text-blue-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-white font-medium">{topicVault.videoName}</div>
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
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                {topicVault.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-white">{topicVault.teacher}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-white">{topicVault.duration || '-'}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${topicVault.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'} text-xs`}>
                                {topicVault.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {previewTotalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          Showing {previewStartIndex + 1} to {Math.min(previewEndIndex, filteredPreview.length)} of {filteredPreview.length} results
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={previewCurrentPage === 1}
                          className="glass-button"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, previewTotalPages) }, (_, i) => {
                            const page = i + Math.max(1, previewCurrentPage - 2)
                            return (
                              <Button
                                key={page}
                                variant={previewCurrentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPreviewCurrentPage(page)}
                                className={previewCurrentPage === page ? "glass-button-active" : "glass-button"}
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewCurrentPage(prev => Math.min(previewTotalPages, prev + 1))}
                          disabled={previewCurrentPage === previewTotalPages}
                          className="glass-button"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 