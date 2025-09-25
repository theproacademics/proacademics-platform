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
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Users, Clock, Star, Upload, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, Download, MoreHorizontal, CheckSquare, Square, AlertTriangle, Check, X, FileText, Settings, Calendar, RotateCcw, Archive, FolderOpen, ExternalLink, GripVertical, Target, Award } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import MathField from "@/components/ui/math-field"
import { HomeworkDialogs } from "./dialogs"

// Constants
const ITEMS_PER_PAGE = 10

// Dynamic subject-programs mapping (loaded from database)
let SUBJECT_PROGRAMS: Record<string, string[]> = {}
let SUBJECT_COLORS: Record<string, string> = {}

// Types
interface HomeworkAssignment {
  _id?: string
  assignmentId: string
  homeworkName: string
  subject: string
  program: string
  topic: string
  subtopic: string
  level: '1' | '2' | '3'
  teacher: string
  dateAssigned: string
  dueDate: string
  estimatedTime: number
  xpAwarded: number
  questionSet: HomeworkQuestion[]
  status: 'draft' | 'active'
  totalQuestions: number
  createdAt: string
  updatedAt: string
}

interface HomeworkQuestion {
  _id?: string
  questionId: string
  topic: string
  subtopic: string
  level: '1' | '2' | '3'
  question: string
  markScheme: string
  image?: string
  hasEquation?: boolean
  questionEquation?: string
  markSchemeEquation?: string
}

interface HomeworkFormData {
  homeworkName: string
  subject: string
  program: string
  topic: string
  subtopic: string
  level: '1' | '2' | '3'
  teacher: string
  dateAssigned: string
  dueDate: string
  estimatedTime: string
  xpAwarded: string
  status: 'draft' | 'active'
}

interface QuestionFormData {
  questionId: string
  topic: string
  subtopic: string
  level: '1' | '2' | '3'
  question: string
  markScheme: string
  image: string
  hasEquation: boolean
  questionEquation?: string
  markSchemeEquation?: string
}

interface PaginatedHomework {
  homework: HomeworkAssignment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Helper functions
const getLevelColor = (level: string) => {
  switch (level) {
    case '1':
      return 'bg-green-100 text-green-800 border-green-200'
    case '2':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case '3':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Create hierarchical grouping for subject-program structure
const createHierarchicalGroups = (homework: HomeworkAssignment[]) => {
  const hierarchical: Record<string, Record<string, HomeworkAssignment[]>> = {}
  
  homework.forEach(item => {
    const subject = item.subject || 'No Subject Assigned'
    const program = item.program || 'No Program Assigned'
    
    if (!hierarchical[subject]) {
      hierarchical[subject] = {}
    }
    
    if (!hierarchical[subject][program]) {
      hierarchical[subject][program] = []
    }
    
    hierarchical[subject][program].push(item)
  })
  
  return hierarchical
}

export default function HomeworkPage() {
  // Core data states
  const [homework, setHomework] = useState<HomeworkAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<string[]>([])
  const [teachers, setTeachers] = useState<string[]>([])
  const [programs, setPrograms] = useState<string[]>([])
  
  // Add state for admin subjects and programs
  const [adminSubjects, setAdminSubjects] = useState<{id: string, name: string, color: string, isActive: boolean}[]>([])
  const [subjectPrograms, setSubjectPrograms] = useState<Record<string, string[]>>({})
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>({})

  // Expanded homework state
  const [expandedHomework, setExpandedHomework] = useState<Set<string>>(new Set())

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedTeacher, setSelectedTeacher] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedProgram, setSelectedProgram] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalHomework, setTotalHomework] = useState(0)
  
  // Grouping states
  const [groupBy, setGroupBy] = useState<'none' | 'subject' | 'program' | 'subject-program'>('subject-program')
  
  // Group expansion states
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set())
  
  // Dialog states
  const [isCreateHomeworkDialogOpen, setIsCreateHomeworkDialogOpen] = useState(false)
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false)
  const [isEditHomeworkDialogOpen, setIsEditHomeworkDialogOpen] = useState(false)
  const [isViewHomeworkDialogOpen, setIsViewHomeworkDialogOpen] = useState(false)
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  // Form states
  const [homeworkFormData, setHomeworkFormData] = useState<HomeworkFormData>({
    homeworkName: '',
    subject: '',
    program: '',
    topic: '',
    subtopic: '',
    level: '2',
    teacher: '',
    dateAssigned: new Date().toISOString().split('T')[0],
    dueDate: '',
    estimatedTime: '30',
    xpAwarded: '100',
    status: 'draft'
  })

  const [questionFormData, setQuestionFormData] = useState<QuestionFormData>({
    questionId: '',
    topic: '',
    subtopic: '',
    level: '2',
    question: '',
    markScheme: '',
    image: 'n',
    hasEquation: false,
    questionEquation: '',
    markSchemeEquation: ''
  })

  // Selection and editing states
  const [selectedHomework, setSelectedHomework] = useState<HomeworkAssignment | null>(null)
  const [selectedHomeworkList, setSelectedHomeworkList] = useState<string[]>([])
  const [editingHomework, setEditingHomework] = useState<HomeworkAssignment | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<HomeworkQuestion | null>(null)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number>(-1)

  // Import states
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)

  // Available programs for selected subject
  const availablePrograms = useMemo(() => {
    if (!homeworkFormData.subject || homeworkFormData.subject === '') return []
    const programs = SUBJECT_PROGRAMS[homeworkFormData.subject] || []
    console.log('Calculating available programs for subject:', homeworkFormData.subject, 'Programs:', programs)
    return programs
  }, [homeworkFormData.subject])

  // Fetch filter options and dynamic subject-programs mapping
  const fetchFilterOptions = async () => {
    try {
      const [subjectsRes, teachersRes, programsRes, subjectProgramsRes, adminSubjectsRes] = await Promise.all([
        fetch('/api/admin/homework/filters/subjects'),
        fetch('/api/admin/homework/filters/teachers'),
        fetch('/api/admin/homework/filters/programs'),
        fetch('/api/admin/subjects/programs-map'),
        fetch('/api/admin/subjects')
      ])
      
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json()
        if (subjectsData.success) {
          setSubjects(subjectsData.data)
        }
      }
      
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        if (teachersData.success) {
          setTeachers(teachersData.data)
        }
      }
      
      if (programsRes.ok) {
        const programsData = await programsRes.json()
        if (programsData.success) {
          setPrograms(programsData.data)
        }
      }
      
      if (subjectProgramsRes.ok) {
        const subjectProgramsData = await subjectProgramsRes.json()
        if (subjectProgramsData.success) {
          SUBJECT_PROGRAMS = subjectProgramsData.subjectPrograms || {}
          SUBJECT_COLORS = subjectProgramsData.subjectColors || {}
          setSubjectPrograms(subjectProgramsData.subjectPrograms || {})
          setSubjectColors(subjectProgramsData.subjectColors || {})
          console.log('Loaded subject programs:', subjectProgramsData.subjectPrograms)
          console.log('Set SUBJECT_PROGRAMS to:', SUBJECT_PROGRAMS)
        }
      }
      
      if (adminSubjectsRes.ok) {
        const adminSubjectsData = await adminSubjectsRes.json()
        if (adminSubjectsData.success) {
          setAdminSubjects(adminSubjectsData.subjects || [])
          console.log('Loaded admin subjects:', adminSubjectsData.subjects)
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  // Fetch homework data
  const fetchHomework = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: searchTerm,
        subject: selectedSubject,
        program: selectedProgram,
        status: selectedStatus,
        level: selectedLevel,
        teacher: selectedTeacher
      })

      const response = await fetch(`/api/admin/homework?${params}`)
      const data = await response.json()

      if (data.success) {
        setHomework(data.data.homework)
        setTotalHomework(data.data.total)
        setTotalPages(data.data.totalPages)
      } else {
        toast.error('Failed to fetch homework')
      }
    } catch (error) {
      console.error('Error fetching homework:', error)
      toast.error('Error fetching homework')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, selectedSubject, selectedProgram, selectedStatus, selectedLevel, selectedTeacher])

  // Initial data loading
  useEffect(() => {
    fetchFilterOptions()
    fetchHomework()
  }, [fetchHomework])

  // Handle MathLive keyboard scrolling
  useEffect(() => {
    const handleKeyboardToggle = () => {
      const keyboard = document.querySelector('.ML__keyboard:not([style*="display: none"])')
      const virtualKeyboard = document.querySelector('.ML__virtual-keyboard')
      const allKeyboards = document.querySelectorAll('.ML__keyboard, .ML__virtual-keyboard')
      
      console.log('Keyboard check:', { 
        keyboard, 
        virtualKeyboard, 
        allKeyboards: allKeyboards.length,
        bodyHeight: document.body.style.height,
        htmlHeight: document.documentElement.style.height,
        bodyOverflow: document.body.style.overflow
      })
      
      if (keyboard || virtualKeyboard || allKeyboards.length > 0) {
        console.log('Keyboard is open - enabling scrolling')
        // Add keyboard-open class for CSS targeting
        document.body.classList.add('keyboard-open')
        document.documentElement.classList.add('keyboard-open')
        
        // Force immediate style changes
        document.body.style.setProperty('overflow', 'auto', 'important')
        document.documentElement.style.setProperty('overflow', 'auto', 'important')
        document.body.style.setProperty('height', 'calc(100vh + 50vh)', 'important')
        document.documentElement.style.setProperty('height', 'calc(100vh + 50vh)', 'important')
        document.body.style.setProperty('min-height', 'calc(100vh + 50vh)', 'important')
        document.documentElement.style.setProperty('min-height', 'calc(100vh + 50vh)', 'important')
        document.body.style.setProperty('max-height', 'none', 'important')
        document.documentElement.style.setProperty('max-height', 'none', 'important')
        
        console.log('Applied styles:', {
          bodyHeight: document.body.style.height,
          htmlHeight: document.documentElement.style.height,
          bodyOverflow: document.body.style.overflow
        })
        
        // Force page to be scrollable by adding content height
        const extraContent = document.createElement('div')
        extraContent.id = 'keyboard-spacer'
        extraContent.style.height = '50vh'
        extraContent.style.width = '1px'
        extraContent.style.position = 'absolute'
        extraContent.style.bottom = '0'
        extraContent.style.left = '0'
        extraContent.style.pointerEvents = 'none'
        extraContent.style.zIndex = '-1'
        document.body.appendChild(extraContent)
        
        // Make all containers scrollable with extra height
        const containers = document.querySelectorAll('.admin-homework-page, .admin-content, [data-radix-dialog-content]')
        containers.forEach(container => {
          const el = container as HTMLElement
          el.style.setProperty('overflow', 'auto', 'important')
          el.style.setProperty('max-height', 'none', 'important')
          el.style.setProperty('height', 'calc(100vh + 50vh)', 'important')
          el.style.setProperty('min-height', 'calc(100vh + 50vh)', 'important')
          el.style.setProperty('padding-bottom', '50vh', 'important')
        })
        
        // Make the main page container extra tall
        const mainContainer = document.querySelector('.admin-homework-page')
        if (mainContainer) {
          const el = mainContainer as HTMLElement
          el.style.setProperty('height', 'calc(100vh + 50vh)', 'important')
          el.style.setProperty('min-height', 'calc(100vh + 50vh)', 'important')
          el.style.setProperty('overflow-y', 'scroll', 'important')
          el.style.setProperty('padding-bottom', '50vh', 'important')
        }
        
        // Scroll to show the dialog
        const dialog = document.querySelector('[data-radix-dialog-content]')
        if (dialog) {
          dialog.scrollIntoView({ behavior: 'smooth', block: 'center' })
          
          // Also scroll the page to show the dialog
          setTimeout(() => {
            const dialogRect = dialog.getBoundingClientRect()
            const scrollTop = window.pageYOffset + dialogRect.top - 100
            window.scrollTo({ top: scrollTop, behavior: 'smooth' })
          }, 200)
        }
        
        // Force scroll on the main page to ensure content is accessible
        setTimeout(() => {
          // Scroll to a position that shows the dialog above the keyboard
          const scrollPosition = Math.max(0, window.innerHeight * 0.3)
          window.scrollTo({ top: scrollPosition, behavior: 'smooth' })
        }, 100)
      } else {
        console.log('Keyboard is closed - restoring normal behavior')
        // Remove keyboard-open class
        document.body.classList.remove('keyboard-open')
        document.documentElement.classList.remove('keyboard-open')
        
        // Remove the spacer element
        const spacer = document.getElementById('keyboard-spacer')
        if (spacer) {
          spacer.remove()
        }
        
        // Keyboard is closed - restore normal behavior
        document.body.style.removeProperty('overflow')
        document.documentElement.style.removeProperty('overflow')
        document.body.style.removeProperty('height')
        document.documentElement.style.removeProperty('height')
        document.body.style.removeProperty('min-height')
        document.documentElement.style.removeProperty('min-height')
        document.body.style.removeProperty('max-height')
        document.documentElement.style.removeProperty('max-height')
        
        // Restore container styles
        const containers = document.querySelectorAll('.admin-homework-page, .admin-content, [data-radix-dialog-content]')
        containers.forEach(container => {
          const el = container as HTMLElement
          el.style.removeProperty('overflow')
          el.style.removeProperty('max-height')
          el.style.removeProperty('height')
          el.style.removeProperty('min-height')
          el.style.removeProperty('padding-bottom')
        })
      }
    }

    // Check for keyboard changes more frequently
    const observer = new MutationObserver(() => {
      setTimeout(handleKeyboardToggle, 50) // Small delay to ensure DOM is updated
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })

    // Also check periodically
    const interval = setInterval(handleKeyboardToggle, 500)

    // Initial check
    handleKeyboardToggle()

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  // Debug state values
  useEffect(() => {
    console.log('Current adminSubjects:', adminSubjects)
    console.log('Current subjectPrograms:', subjectPrograms)
    console.log('Current SUBJECT_PROGRAMS:', SUBJECT_PROGRAMS)
  }, [adminSubjects, subjectPrograms])

  // Auto-expand all groups when groupBy is subject-program and homework are loaded
  useEffect(() => {
    if (groupBy === 'subject-program' && homework && homework.length > 0) {
      const hierarchical = createHierarchicalGroups(homework)
      const allSubjects = Object.keys(hierarchical)
      const allPrograms = Object.entries(hierarchical).flatMap(([subject, programs]) => 
        Object.keys(programs).map(program => `${subject}::${program}`)
      )
      
      setExpandedSubjects(new Set(allSubjects))
      setExpandedPrograms(new Set(allPrograms))
    }
  }, [groupBy, homework])



  // Create empty form data
  const createEmptyHomeworkFormData = (): HomeworkFormData => ({
    homeworkName: '',
    subject: '',
    program: '',
    topic: '',
    subtopic: '',
    level: '2',
    teacher: '',
    dateAssigned: new Date().toISOString().split('T')[0],
    dueDate: '',
    estimatedTime: '30',
    xpAwarded: '100',
    status: 'draft'
  })

  const createEmptyQuestionFormData = (): QuestionFormData => ({
    questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    topic: '',
    subtopic: '',
    level: '2',
    question: '',
    markScheme: '',
    image: 'n',
    hasEquation: false,
    questionEquation: '',
    markSchemeEquation: ''
  })

  // Event handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }, [])

  const handleSubjectFilter = useCallback((value: string) => {
    setSelectedSubject(value)
    setCurrentPage(1)
  }, [])

  const handleProgramFilter = useCallback((value: string) => {
    setSelectedProgram(value)
    setCurrentPage(1)
  }, [])

  const handleStatusFilter = useCallback((value: string) => {
    setSelectedStatus(value)
    setCurrentPage(1)
  }, [])

  const handleLevelFilter = useCallback((value: string) => {
    setSelectedLevel(value)
    setCurrentPage(1)
  }, [])

  const handleTeacherFilter = useCallback((value: string) => {
    setSelectedTeacher(value)
    setCurrentPage(1)
  }, [])

  const toggleExpanded = (homeworkId: string) => {
    const newExpanded = new Set(expandedHomework)
    if (newExpanded.has(homeworkId)) {
      newExpanded.delete(homeworkId)
    } else {
      newExpanded.add(homeworkId)
    }
    setExpandedHomework(newExpanded)
  }

  const toggleSubjectExpanded = (subject: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject)
    } else {
      newExpanded.add(subject)
    }
    setExpandedSubjects(newExpanded)
  }

  const toggleProgramExpanded = (subject: string, program: string) => {
    const key = `${subject}::${program}`
    const newExpanded = new Set(expandedPrograms)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedPrograms(newExpanded)
  }

  const handleSelectHomework = (homeworkId: string) => {
    const newSelected = [...selectedHomeworkList]
    const index = newSelected.indexOf(homeworkId)
    
    if (index > -1) {
      newSelected.splice(index, 1)
    } else {
      newSelected.push(homeworkId)
    }
    
    setSelectedHomeworkList(newSelected)
  }

  // CRUD operations
  const handleCreateHomework = async () => {
    try {
      const response = await fetch('/api/admin/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeworkFormData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Homework created successfully')
        setIsCreateHomeworkDialogOpen(false)
        setHomeworkFormData(createEmptyHomeworkFormData())
        fetchHomework()
      } else {
        toast.error(data.error || 'Failed to create homework')
      }
    } catch (error) {
      console.error('Error creating homework:', error)
      toast.error('Error creating homework')
    }
  }

  const handleEditHomework = (homework: HomeworkAssignment) => {
    setEditingHomework(homework)
    setHomeworkFormData({
      homeworkName: homework.homeworkName,
      subject: homework.subject,
      program: homework.program,
      topic: homework.topic,
      subtopic: homework.subtopic,
      level: homework.level,
      teacher: homework.teacher,
      dateAssigned: homework.dateAssigned.split('T')[0],
      dueDate: homework.dueDate.split('T')[0],
      estimatedTime: homework.estimatedTime.toString(),
      xpAwarded: homework.xpAwarded.toString(),
      status: homework.status
    })
    setIsEditHomeworkDialogOpen(true)
  }

  const handleUpdateHomework = async () => {
    if (!editingHomework) return

    try {
      const response = await fetch(`/api/admin/homework/${editingHomework._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeworkFormData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Homework updated successfully')
        setIsEditHomeworkDialogOpen(false)
        setEditingHomework(null)
        setHomeworkFormData(createEmptyHomeworkFormData())
        fetchHomework()
      } else {
        toast.error(data.error || 'Failed to update homework')
      }
    } catch (error) {
      console.error('Error updating homework:', error)
      toast.error('Error updating homework')
    }
  }

  const handleDeleteHomework = async (homeworkId: string) => {
    try {
      const response = await fetch(`/api/admin/homework/${homeworkId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Homework deleted successfully')
        fetchHomework()
      } else {
        toast.error(data.error || 'Failed to delete homework')
      }
    } catch (error) {
      console.error('Error deleting homework:', error)
      toast.error('Error deleting homework')
    }
  }

  const handleAddQuestion = (homework: HomeworkAssignment) => {
    setSelectedHomework(homework)
    setQuestionFormData({
      ...createEmptyQuestionFormData(),
      topic: homework.topic,
      subtopic: homework.subtopic,
      level: homework.level
    })
    setIsAddQuestionDialogOpen(true)
  }

  const handleCreateQuestion = async () => {
    if (!selectedHomework) return

    try {
      const updatedQuestionSet = [...selectedHomework.questionSet, questionFormData]
      
      const response = await fetch(`/api/admin/homework/${selectedHomework._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionSet: updatedQuestionSet })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Question added successfully')
        setIsAddQuestionDialogOpen(false)
        setQuestionFormData(createEmptyQuestionFormData())
        setSelectedHomework(null)
        fetchHomework()
      } else {
        toast.error(data.error || 'Failed to add question')
      }
    } catch (error) {
      console.error('Error adding question:', error)
      toast.error('Error adding question')
    }
  }

  const handleEditQuestion = (homework: HomeworkAssignment, question: HomeworkQuestion, index: number) => {
    setSelectedHomework(homework)
    setEditingQuestion(question)
    setEditingQuestionIndex(index)
    setQuestionFormData({
      questionId: question.questionId,
      topic: question.topic,
      subtopic: question.subtopic,
      level: question.level,
      question: question.question,
      markScheme: question.markScheme,
      image: question.image || 'n',
      hasEquation: question.hasEquation || false,
      questionEquation: question.questionEquation || '',
      markSchemeEquation: question.markSchemeEquation || ''
    })
    setIsEditQuestionDialogOpen(true)
  }

  const handleUpdateQuestion = async () => {
    if (!selectedHomework || editingQuestionIndex === -1) return

    try {
      const updatedQuestionSet = [...selectedHomework.questionSet]
      updatedQuestionSet[editingQuestionIndex] = questionFormData
      
      const response = await fetch(`/api/admin/homework/${selectedHomework._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionSet: updatedQuestionSet })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Question updated successfully')
        setIsEditQuestionDialogOpen(false)
        setQuestionFormData(createEmptyQuestionFormData())
        setSelectedHomework(null)
        setEditingQuestion(null)
        setEditingQuestionIndex(-1)
        fetchHomework()
      } else {
        toast.error(data.error || 'Failed to update question')
      }
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('Error updating question')
    }
  }

  const handleDeleteQuestion = async (homework: HomeworkAssignment, questionIndex: number) => {
    try {
      const updatedQuestionSet = homework.questionSet.filter((_, index) => index !== questionIndex)
      
      const response = await fetch(`/api/admin/homework/${homework._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionSet: updatedQuestionSet })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Question deleted successfully')
        fetchHomework()
      } else {
        toast.error(data.error || 'Failed to delete question')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Error deleting question')
    }
  }

  // CSV Import
  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import')
      return
    }

    try {
      setImportLoading(true)
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch('/api/admin/homework/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Successfully imported ${data.data.insertedCount} homework assignments`)
        setIsImportDialogOpen(false)
        setImportFile(null)
        fetchHomework()
      } else {
        toast.error(data.error || 'Failed to import homework')
      }
    } catch (error) {
      console.error('Error importing homework:', error)
      toast.error('Error importing homework')
    } finally {
      setImportLoading(false)
    }
  }

  return (
          <TooltipProvider>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
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
          `}</style>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 -right-8 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
            
            {/* Additional background elements for nav area */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-3000"></div>
            <div className="absolute top-1/2 left-5 w-48 h-48 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-4000"></div>
            
            {/* Extended background elements behind nav */}
            <div className="absolute top-1/4 left-20 w-56 h-56 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-5000"></div>
            <div className="absolute bottom-1/4 left-8 w-40 h-40 bg-indigo-500/8 rounded-full blur-3xl animate-pulse delay-6000"></div>
            
            {/* Floating particles */}
            <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce delay-500"></div>
            <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400/60 rounded-full animate-bounce delay-1000"></div>
            <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce delay-1500"></div>
            <div className="absolute top-60 left-32 w-1 h-1 bg-blue-400/60 rounded-full animate-bounce delay-2500"></div>
            <div className="absolute top-80 left-16 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce delay-3500"></div>
            <div className="absolute top-32 left-24 w-1 h-1 bg-indigo-400/60 rounded-full animate-bounce delay-7000"></div>
            <div className="absolute bottom-60 left-12 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-bounce delay-8000"></div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEyNywgNjMsIDI1NSwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          </div>
          
          {/* Scrollable Content Container */}
          <div className="absolute inset-0 z-10 overflow-y-auto admin-content" data-admin-content>
        
        <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-16 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden admin-homework-page" data-main-content>
              {/* Enhanced Header */}
              <div className="mb-6 lg:mb-12 text-center">
                <div className="inline-flex items-center gap-3 mb-4 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Target className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  </div>
                  <span className="text-xs lg:text-sm text-blue-300 font-medium tracking-wider uppercase">Admin Panel</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 tracking-tight">
                  Homework Management
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
                  Create and manage homework assignments with structured learning content
                </p>
                <div className="mt-4 h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto animate-pulse"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
                {adminSubjects.length === 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                    <div className="text-amber-300 text-xs sm:text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">No subjects found. Please create subjects and programs first.</span>
                      <span className="sm:hidden">No subjects found. Create subjects first.</span>
                    </div>
                    <Link href="/admin/subjects">
                      <Button variant="outline" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-amber-500 hover:border-amber-600 w-full sm:w-auto">
                        Go to Subjects
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg w-full sm:w-auto">
                          <Upload className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Import CSV</span>
                          <span className="sm:hidden">Import</span>
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    
                    <Dialog open={isCreateHomeworkDialogOpen} onOpenChange={setIsCreateHomeworkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Create Homework</span>
                          <span className="sm:hidden">Create</span>
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                )}
              </div>

              {/* Filters and Search */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 mx-2 sm:mx-0">
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search homework by name, topic, subtopic, teacher..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 sm:py-3 bg-white/5 border-white/20 text-white placeholder:text-slate-400 w-full"
                    />
                  </div>

                  {/* Filters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  {/* Subject Filter */}
                  <Select value={selectedSubject} onValueChange={handleSubjectFilter}>
                      <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Program Filter */}
                  <Select value={selectedProgram} onValueChange={handleProgramFilter}>
                      <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="All Programs" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="all">All Programs</SelectItem>
                      {programs.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Level Filter */}
                  <Select value={selectedLevel} onValueChange={handleLevelFilter}>
                      <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                      <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Teacher Filter */}
                  <Select value={selectedTeacher} onValueChange={handleTeacherFilter}>
                      <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="All Teachers" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="all">All Teachers</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher} value={teacher}>
                          {teacher}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                </div>
              </div>

              {/* Homework List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden mx-2 sm:mx-0">
                  {homework.length === 0 ? (
                    <div className="p-6 sm:p-12 text-center">
                      <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No homework found</h3>
                      <p className="text-slate-400 mb-6 text-sm sm:text-base">Create your first homework assignment to get started</p>
                      <Button
                        onClick={() => setIsCreateHomeworkDialogOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Homework
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {/* Subject-Program Hierarchical View */}
                      {(() => {
                        const hierarchical = createHierarchicalGroups(homework)
                        return Object.entries(hierarchical).map(([subject, programs]) => (
                          <div key={subject} className="border-b border-white/10 last:border-b-0">
                            {/* Subject Header */}
                            <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-b border-white/20">
                              <button
                                onClick={() => toggleSubjectExpanded(subject)}
                                className="w-full px-3 sm:px-6 py-3 sm:py-4 hover:bg-white/5 transition-all duration-200 text-left group"
                              >
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg sm:rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-200 flex-shrink-0">
                                    {expandedSubjects.has(subject) ? (
                                      <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                                    ) : (
                                      <div className="text-sm sm:text-lg">📚</div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <div className="min-w-0 flex-1">
                                        <h3 className="text-white font-semibold text-lg sm:text-xl group-hover:text-blue-200 transition-colors duration-200 truncate">
                                          {subject}
                                        </h3>
                                        <p className="text-slate-400 text-xs sm:text-sm mt-1">
                                          {Object.values(programs).flat().length} homework assignments
                                        </p>
                                      </div>
                                      <div className="text-slate-400 group-hover:text-white transition-colors duration-200 flex-shrink-0 ml-2">
                                        {expandedSubjects.has(subject) ? (
                                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>

                            {/* Programs under Subject */}
                            {expandedSubjects.has(subject) && Object.entries(programs).map(([program, homeworkList]) => {
                              const programKey = `${subject}::${program}`
                              const isProgramExpanded = expandedPrograms.has(programKey)
                              
                              return (
                                <div key={programKey} className="ml-4 sm:ml-8 border-l-2 border-white/10">
                                  {/* Program Header */}
                                  <div className="bg-slate-800/20">
                                    <button
                                      onClick={() => toggleProgramExpanded(subject, program)}
                                      className="w-full px-3 sm:px-6 py-2 sm:py-3 hover:bg-white/5 transition-all duration-200 text-left group"
                                    >
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500/30 to-blue-500/30 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                                          {isProgramExpanded ? (
                                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                                          ) : (
                                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-white font-medium text-sm sm:text-base group-hover:text-green-200 transition-colors truncate">
                                            {program}
                                          </h4>
                                          <p className="text-slate-400 text-xs">
                                            {homeworkList.length} homework • {homeworkList.filter(h => h.status === 'active').length} active
                                          </p>
                                        </div>
                                      </div>
                                    </button>
                                  </div>

                                  {/* Homework List under Program */}
                                  {isProgramExpanded && (
                                    <div className="space-y-0">
                                      {homeworkList.map((item) => {
                                        const isExpanded = expandedHomework.has(item.assignmentId)
                                        return (
                                          <div key={item.assignmentId} className="border-b border-white/5 last:border-b-0">
                                            {/* Homework Item */}
                                            <div className="p-3 sm:p-4 hover:bg-white/5 transition-colors ml-6 sm:ml-12">
                                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSelectHomework(item.assignmentId)}
                                                    className="p-1 h-auto flex-shrink-0"
                                                  >
                                                    {selectedHomeworkList.includes(item.assignmentId) ? (
                                                      <CheckSquare className="w-4 h-4 text-blue-400" />
                                                    ) : (
                                                      <Square className="w-4 h-4 text-slate-400" />
                                                    )}
                                                  </Button>
                                                  
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleExpanded(item.assignmentId)}
                                                    className="p-1 h-auto flex-shrink-0"
                                                  >
                                                    {isExpanded ? (
                                                      <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    ) : (
                                                      <ChevronRight className="w-4 h-4 text-slate-400" />
                                                    )}
                                                  </Button>
                                                  
                                                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                                                  
                                                  <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-medium text-sm sm:text-base truncate">{item.homeworkName}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400 mt-1">
                                                      <span className="truncate">{item.topic} • {item.subtopic}</span>
                                                      <span className="hidden sm:inline">{item.teacher}</span>
                                                      <Badge className={`px-2 py-1 text-xs ${getLevelColor(item.level)}`}>
                                                        {item.level}
                                                      </Badge>
                                                      <Badge className={`px-2 py-1 text-xs ${getStatusColor(item.status)}`}>
                                                        {item.status}
                                                      </Badge>
                                                      <span className="text-xs">
                                                        {item.questionSet?.length || 0} q
                                                      </span>
                                                      <span className="text-xs flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {item.estimatedTime}m
                                                      </span>
                                                      <span className="text-xs flex items-center gap-1">
                                                        <Award className="w-3 h-3" />
                                                        {item.xpAwarded} XP
                                                      </span>
                                                    </div>
                                                    <div className="sm:hidden text-xs text-slate-500 mt-1">
                                                      {item.teacher}
                                                    </div>
                                                  </div>
                                                </div>
                                            
                                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAddQuestion(item)}
                                                    className="text-blue-400 border-blue-400/30 hover:bg-blue-500/10 text-xs sm:text-sm px-2 sm:px-3"
                                                  >
                                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                    <span className="hidden sm:inline">Add Question</span>
                                                    <span className="sm:hidden">Add</span>
                                                  </Button>
                                                  
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditHomework(item)}
                                                    className="text-yellow-400 border-yellow-400/30 hover:bg-yellow-500/10 p-1 sm:p-2"
                                                  >
                                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                  </Button>
                                                  
                                                  <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                      <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-500/10 p-1 sm:p-2">
                                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                      </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-slate-900 border-white/20">
                                                      <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-white">Delete Homework</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-400">
                                                          This will permanently delete "{item.homeworkName}" and all its questions. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                      </AlertDialogHeader>
                                                      <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                                                          Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction 
                                                          onClick={() => handleDeleteHomework(item._id!)}
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

                                            {/* Expanded Questions List */}
                                            {isExpanded && (
                                              <div className="bg-slate-800/30 border-t border-white/10 ml-6 sm:ml-12">
                                                {item.questionSet && item.questionSet.length > 0 ? (
                                                  <div className="space-y-0">
                                                    {item.questionSet.map((question, index) => (
                                                      <div
                                                        key={question.questionId || index}
                                                        className="group p-3 sm:p-4 border-b border-white/5 last:border-b-0 ml-6 sm:ml-12"
                                                      >
                                                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                                          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500/20 rounded-md sm:rounded-lg flex items-center justify-center text-xs font-medium text-purple-400 mt-1 flex-shrink-0">
                                                              {index + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                <span className="text-white font-medium text-xs sm:text-sm truncate">Q{index + 1}: {question.questionId}</span>
                                                                <Badge className={`${getLevelColor(question.level)} text-xs`}>
                                                                  {question.level}
                                                                </Badge>
                                                              </div>
                                                              <div className="text-slate-300 text-xs sm:text-sm mb-2 line-clamp-2">
                                                                <p>{question.question}</p>
                                                                {question.hasEquation && question.questionEquation && (
                                                                  <div className="mt-2">
                                                                    <MathField
                                                                      value={question.questionEquation}
                                                                      readOnly={true}
                                                                      virtualKeyboardMode="off"
                                                                      className="bg-transparent border-none text-slate-300 text-xs sm:text-sm [&>math-field]:text-xs [&>math-field]:sm:text-sm [&>math-field]:bg-transparent [&>math-field]:border-none [&>math-field]:p-0 [&>math-field]:min-h-0"
                                                                    />
                                                                  </div>
                                                                )}
                                                              </div>
                                                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-400">
                                                                <span className="truncate">{question.topic} • {question.subtopic}</span>
                                                                {question.image && question.image !== 'n' && (
                                                                  <span className="flex items-center gap-1">
                                                                    <Eye className="w-3 h-3" />
                                                                    <span className="hidden sm:inline">Has Image</span>
                                                                    <span className="sm:hidden">Image</span>
                                                                  </span>
                                                                )}
                                                              </div>
                                                            </div>
                                                          </div>
                                                          
                                                          <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                                                            <Button
                                                              size="sm"
                                                              variant="outline"
                                                              onClick={() => handleEditQuestion(item, question, index)}
                                                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400"
                                                            >
                                                              <Edit className="w-3 h-3" />
                                                            </Button>
                                                            
                                                            <AlertDialog>
                                                              <AlertDialogTrigger asChild>
                                                                <Button
                                                                  size="sm"
                                                                  variant="outline"
                                                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
                                                                >
                                                                  <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                              </AlertDialogTrigger>
                                                              <AlertDialogContent className="bg-slate-900 border-white/20">
                                                                <AlertDialogHeader>
                                                                  <AlertDialogTitle className="text-white">Delete Question</AlertDialogTitle>
                                                                  <AlertDialogDescription className="text-slate-400">
                                                                    This will permanently delete this question. This action cannot be undone.
                                                                  </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                  <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                                                                    Cancel
                                                                  </AlertDialogCancel>
                                                                  <AlertDialogAction 
                                                                    onClick={() => handleDeleteQuestion(item, index)}
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
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <div className="p-4 sm:p-8 text-center ml-6 sm:ml-12">
                                                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 mx-auto mb-2" />
                                                    <p className="text-slate-400 text-xs sm:text-sm">No questions added yet</p>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => handleAddQuestion(item)}
                                                      className="mt-3 text-blue-400 border-blue-400/30 w-full sm:w-auto"
                                                    >
                                                      <Plus className="w-4 h-4 mr-1" />
                                                      <span className="hidden sm:inline">Add First Question</span>
                                                      <span className="sm:hidden">Add Question</span>
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
                                </div>
                              )
                            })}
                          </div>
                        ))
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 px-2 sm:px-0">
                  <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
                    <span className="hidden sm:inline">Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalHomework)} of {totalHomework} homework assignments</span>
                    <span className="sm:hidden">Page {currentPage} of {totalPages} ({totalHomework} total)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-white px-3 sm:px-4 py-2 text-sm">
                      {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-8 w-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

        {/* Dialogs */}
                        <HomeworkDialogs
                  isCreateHomeworkDialogOpen={isCreateHomeworkDialogOpen}
                  setIsCreateHomeworkDialogOpen={setIsCreateHomeworkDialogOpen}
                  homeworkFormData={homeworkFormData}
                  setHomeworkFormData={setHomeworkFormData}
                  adminSubjects={adminSubjects}
                  availablePrograms={availablePrograms}
                  subjectPrograms={subjectPrograms}
                  handleCreateHomework={handleCreateHomework}
                  createEmptyHomeworkFormData={createEmptyHomeworkFormData}
                  isEditHomeworkDialogOpen={isEditHomeworkDialogOpen}
                  setIsEditHomeworkDialogOpen={setIsEditHomeworkDialogOpen}
                  handleUpdateHomework={handleUpdateHomework}
                  isAddQuestionDialogOpen={isAddQuestionDialogOpen}
                  setIsAddQuestionDialogOpen={setIsAddQuestionDialogOpen}
                  questionFormData={questionFormData}
                  setQuestionFormData={setQuestionFormData}
                  handleCreateQuestion={handleCreateQuestion}
                  createEmptyQuestionFormData={createEmptyQuestionFormData}
                  isEditQuestionDialogOpen={isEditQuestionDialogOpen}
                  setIsEditQuestionDialogOpen={setIsEditQuestionDialogOpen}
                  handleUpdateQuestion={handleUpdateQuestion}
                  isImportDialogOpen={isImportDialogOpen}
                  setIsImportDialogOpen={setIsImportDialogOpen}
                  importFile={importFile}
                  setImportFile={setImportFile}
                  importLoading={importLoading}
                  handleImport={handleImport}
                />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
