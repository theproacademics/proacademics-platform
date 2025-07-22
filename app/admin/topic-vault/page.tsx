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
import { Video, Plus, Search, Filter, Edit, Trash2, Eye, Play, Users, Clock, Star, Upload, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, Download, MoreHorizontal, CheckSquare, Square, AlertTriangle, Check, X, FileText, Settings, Calendar, RotateCcw, Archive, FolderOpen, ExternalLink, GripVertical, BookOpen } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Constants
const ITEMS_PER_PAGE = 10

// Dynamic subject-programs mapping (loaded from database)
let SUBJECT_PROGRAMS: Record<string, string[]> = {}
let SUBJECT_COLORS: Record<string, string> = {}

// Types
interface Topic {
  _id?: string
  id: string
  topicName: string
  subject: string
  program: string
  description?: string
  status: 'draft' | 'active'
  subtopics: SubtopicVault[]
  createdAt: string
  updatedAt: string
}

interface SubtopicVault {
  id: string
  videoName: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description: string
  zoomLink?: string
  videoEmbedLink: string
  status: 'draft' | 'active'
}

interface TopicFormData {
  topicName: string
  subject: string
  program: string
  description: string
  status: 'draft' | 'active'
}

interface SubtopicFormData {
  videoName: string
  type: 'Lesson' | 'Tutorial' | 'Workshop'
  duration: string
  teacher: string
  description: string
  zoomLink: string
  videoEmbedLink: string
  status: 'draft' | 'active'
}

interface PaginatedTopics {
  topics: Topic[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Utility functions
const createEmptyTopicFormData = (): TopicFormData => ({
  topicName: "",
  subject: "",
  program: "",
  description: "",
  status: "draft"
})

const createEmptySubtopicFormData = (): SubtopicFormData => ({
  videoName: "",
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

  // Utility function to ensure URL has proper protocol
const ensureUrlProtocol = (url: string): string => {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

// Group topics based on groupBy setting
const groupTopics = (topics: Topic[], groupBy: 'none' | 'subject' | 'program' | 'subject-program') => {
  if (groupBy === 'none') return { 'All Topics': topics }
  
  const grouped: Record<string, Topic[]> = {}
  
  topics.forEach(topic => {
    let key = ''
    switch (groupBy) {
      case 'subject':
        key = topic.subject || 'Unknown Subject'
        break
      case 'program':
        key = topic.program || 'Unknown Program'
        break
      case 'subject-program':
        key = `${topic.subject || 'Unknown Subject'} - ${topic.program || 'Unknown Program'}`
        break
      default:
        key = 'All Topics'
    }
    
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(topic)
  })
  
  return grouped
}

// Create hierarchical grouping for subject-program structure
const createHierarchicalGroups = (topics: Topic[]) => {
  const hierarchical: Record<string, Record<string, Topic[]>> = {}
  
  topics.forEach(topic => {
    const subject = topic.subject || 'Unknown Subject'
    const program = topic.program || 'Unknown Program'
    
    if (!hierarchical[subject]) {
      hierarchical[subject] = {}
    }
    
    if (!hierarchical[subject][program]) {
      hierarchical[subject][program] = []
    }
    
    hierarchical[subject][program].push(topic)
  })
  
  return hierarchical
}

export default function TopicVaultPage() {
  // Core data states
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<string[]>([])
  const [teachers, setTeachers] = useState<string[]>([])
  const [programs, setPrograms] = useState<string[]>([])
  
  // Add state for admin subjects
  const [adminSubjects, setAdminSubjects] = useState<{id: string, name: string, color: string, isActive: boolean}[]>([])

  // Expanded topics state
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedTeacher, setSelectedTeacher] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedProgram, setSelectedProgram] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTopics, setTotalTopics] = useState(0)
  
  // Grouping states
  const [groupBy, setGroupBy] = useState<'none' | 'subject' | 'program' | 'subject-program'>('subject-program')
  const [showGroupControls, setShowGroupControls] = useState(false)
  
  // Group expansion states
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set())
  
  // Dialog states
  const [isCreateTopicDialogOpen, setIsCreateTopicDialogOpen] = useState(false)
  const [isAddSubtopicDialogOpen, setIsAddSubtopicDialogOpen] = useState(false)
  const [isEditTopicDialogOpen, setIsEditTopicDialogOpen] = useState(false)
  const [isViewTopicDialogOpen, setIsViewTopicDialogOpen] = useState(false)
  const [isEditSubtopicDialogOpen, setIsEditSubtopicDialogOpen] = useState(false)
  const [isDeleteSubtopicDialogOpen, setIsDeleteSubtopicDialogOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubtopicVault | null>(null)
  const [selectedSubtopicIndex, setSelectedSubtopicIndex] = useState<number>(-1)
  
  // Bulk operations
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
  // Form states
  const [topicFormData, setTopicFormData] = useState<TopicFormData>(createEmptyTopicFormData())
  const [subtopicFormData, setSubtopicFormData] = useState<SubtopicFormData>(createEmptySubtopicFormData())

  // Drag and drop states
  const [draggedItem, setDraggedItem] = useState<{topicId: string, subtopicIndex: number} | null>(null)
  const [dragOverItem, setDragOverItem] = useState<{topicId: string, subtopicIndex: number} | null>(null)

  // Toggle expanded state for topics
  const toggleExpanded = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  // Toggle expanded state for groups
  const toggleGroupExpanded = (groupName: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName)
    } else {
      newExpanded.add(groupName)
    }
    setExpandedGroups(newExpanded)
  }

  // Toggle expanded state for subjects
  const toggleSubjectExpanded = (subject: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject)
    } else {
      newExpanded.add(subject)
    }
    setExpandedSubjects(newExpanded)
  }

  // Toggle expanded state for programs
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

  // Fetch topics data
  const fetchTopics = async () => {
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
      if (!response.ok) throw new Error('Failed to fetch topics')
      
      const data: PaginatedTopics = await response.json()
      setTopics(data.topics || [])
      setTotalPages(data.totalPages || 1)
      setTotalTopics(data.total || 0)
    } catch (error) {
      console.error('Error fetching topics:', error)
      toast.error('Failed to fetch topics')
      setTopics([]) // Ensure topics is always an array
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
        setSubjects(Array.isArray(subjectsData.subjects) ? subjectsData.subjects : [])
      }
      
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(Array.isArray(teachersData.teachers) ? teachersData.teachers : [])
      }

      if (programsRes.ok) {
        const programsData = await programsRes.json()
        setPrograms(Array.isArray(programsData.programs) ? programsData.programs : [])
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
          setAdminSubjects(Array.isArray(adminSubjectsData.subjects) ? adminSubjectsData.subjects : [])
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
      // Ensure arrays are always initialized
      setSubjects([])
      setTeachers([])
      setPrograms([])
      setAdminSubjects([])
    }
  }

  // Effect hooks
  useEffect(() => {
    fetchTopics()
  }, [currentPage, searchTerm, selectedSubject, selectedTeacher, selectedStatus, selectedType, selectedProgram])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Auto-expand all groups when groupBy is subject-program and topics are loaded
  useEffect(() => {
    if (groupBy === 'subject-program' && topics && topics.length > 0) {
      const hierarchical = createHierarchicalGroups(topics)
      const allSubjects = Object.keys(hierarchical)
      const allPrograms = Object.entries(hierarchical).flatMap(([subject, programs]) => 
        Object.keys(programs).map(program => `${subject}::${program}`)
      )
      
      setExpandedSubjects(new Set(allSubjects))
      setExpandedPrograms(new Set(allPrograms))
    } else if (groupBy !== 'subject-program' && topics && topics.length > 0) {
      const grouped = groupTopics(topics, groupBy)
      const allGroupNames = Object.keys(grouped)
      setExpandedGroups(new Set(allGroupNames))
    }
  }, [topics, groupBy])

  // Create new topic
  const handleCreateTopic = useCallback(async () => {
    try {
      if (!topicFormData.topicName.trim()) {
        toast.error('Topic name is required')
        return
      }
      if (!topicFormData.subject.trim()) {
        toast.error('Subject is required')
        return
      }
      if (!topicFormData.program.trim()) {
        toast.error('Program is required')
        return
      }

      const response = await fetch('/api/admin/topic-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...topicFormData,
          subtopics: [] // Start with empty subtopics array
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create topic')
      }
      
      toast.success('Topic created successfully!')
      setIsCreateTopicDialogOpen(false)
      setTopicFormData(createEmptyTopicFormData())
      
      // Refresh data and filters
      await Promise.all([
        fetchTopics(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error creating topic:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create topic')
    }
  }, [topicFormData])

  // Add subtopic to topic
  const handleAddSubtopic = async () => {
    if (!selectedTopic) return

    try {
      if (!subtopicFormData.videoName.trim()) {
        toast.error('Video name is required')
        return
      }
      if (!subtopicFormData.teacher.trim()) {
        toast.error('Teacher is required')
        return
      }
      if (!subtopicFormData.videoEmbedLink.trim()) {
        toast.error('Video embed link is required')
        return
      }

      const updatedSubtopics = [...(selectedTopic.subtopics || []), {...subtopicFormData, id: `subtopic-${Date.now()}`}]

      const response = await fetch(`/api/admin/topic-vault/${selectedTopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedTopic,
          subtopics: updatedSubtopics
        })
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add subtopic')
      }
      
      setIsAddSubtopicDialogOpen(false)
      setSubtopicFormData(createEmptySubtopicFormData())
      setSelectedTopic(null)
      toast.success('Subtopic added successfully!')
      fetchTopics()
    } catch (error) {
      console.error('Error adding subtopic:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add subtopic')
    }
  }

  // Edit subtopic
  const handleEditSubtopic = async () => {
    if (!selectedTopic || selectedSubtopicIndex === -1) return

    try {
      if (!subtopicFormData.videoName.trim()) {
        toast.error('Video name is required')
        return
      }
      if (!subtopicFormData.teacher.trim()) {
        toast.error('Teacher is required')
        return
      }
      if (!subtopicFormData.videoEmbedLink.trim()) {
        toast.error('Video embed link is required')
        return
      }

      const updatedSubtopics = [...(selectedTopic.subtopics || [])]
      updatedSubtopics[selectedSubtopicIndex] = {...subtopicFormData, id: selectedSubtopic?.id || `subtopic-${Date.now()}`}

      const response = await fetch(`/api/admin/topic-vault/${selectedTopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedTopic,
          subtopics: updatedSubtopics
        })
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update subtopic')
      }
      
      setIsEditSubtopicDialogOpen(false)
      setSubtopicFormData(createEmptySubtopicFormData())
      setSelectedTopic(null)
      setSelectedSubtopic(null)
      setSelectedSubtopicIndex(-1)
      toast.success('Subtopic updated successfully!')
      fetchTopics()
    } catch (error) {
      console.error('Error updating subtopic:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update subtopic')
    }
  }

  // Delete subtopic
  const handleDeleteSubtopic = async () => {
    if (!selectedTopic || selectedSubtopicIndex === -1) return

    try {
      const updatedSubtopics = [...(selectedTopic.subtopics || [])]
      updatedSubtopics.splice(selectedSubtopicIndex, 1)

      const response = await fetch(`/api/admin/topic-vault/${selectedTopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedTopic,
          subtopics: updatedSubtopics
        })
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete subtopic')
      }
      
      setIsDeleteSubtopicDialogOpen(false)
      setSelectedTopic(null)
      setSelectedSubtopic(null)
      setSelectedSubtopicIndex(-1)
      toast.success('Subtopic deleted successfully!')
      fetchTopics()
    } catch (error) {
      console.error('Error deleting subtopic:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete subtopic')
    }
  }

  // Open edit subtopic dialog
  const openEditSubtopicDialog = (topic: Topic, subtopic: SubtopicVault, index: number) => {
    setSelectedTopic(topic)
    setSelectedSubtopic(subtopic)
    setSelectedSubtopicIndex(index)
    setSubtopicFormData({
      videoName: subtopic.videoName,
      type: subtopic.type,
      duration: subtopic.duration,
      teacher: subtopic.teacher,
      description: subtopic.description,
      zoomLink: subtopic.zoomLink || '',
      videoEmbedLink: subtopic.videoEmbedLink,
      status: subtopic.status
    })
    setIsEditSubtopicDialogOpen(true)
  }

  // Open delete subtopic dialog
  const openDeleteSubtopicDialog = (topic: Topic, subtopic: SubtopicVault, index: number) => {
    setSelectedTopic(topic)
    setSelectedSubtopic(subtopic)
    setSelectedSubtopicIndex(index)
    setIsDeleteSubtopicDialogOpen(true)
  }

  const handleUpdateTopic = useCallback(async () => {
    if (!selectedTopic) return
    
    try {
      const response = await fetch(`/api/admin/topic-vault/${selectedTopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...topicFormData,
          subtopics: selectedTopic.subtopics
        })
      })

      if (!response.ok) throw new Error('Failed to update topic')
      
      toast.success('Topic updated successfully!')
      setIsEditTopicDialogOpen(false)
      setSelectedTopic(null)
      setTopicFormData(createEmptyTopicFormData())
      
      // Refresh data and filters
      await Promise.all([
        fetchTopics(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error updating topic:', error)
      toast.error('Failed to update topic')
    }
  }, [selectedTopic, topicFormData])

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null)

  const confirmDeleteTopic = useCallback((topicId: string) => {
    setTopicToDelete(topicId)
    setDeleteConfirmOpen(true)
  }, [])

  const handleDeleteTopic = useCallback(async () => {
    if (!topicToDelete) return
    
    try {
      const response = await fetch(`/api/admin/topic-vault/${topicToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete topic')
      
      toast.success('Topic deleted successfully!')
      
      // Refresh data and filters
      await Promise.all([
        fetchTopics(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error deleting topic:', error)
      toast.error('Failed to delete topic')
    } finally {
      setDeleteConfirmOpen(false)
      setTopicToDelete(null)
    }
  }, [topicToDelete])

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
    setGroupBy("subject-program")
    setCurrentPage(1)
  }, [])

  const handleGroupByChange = useCallback((value: 'none' | 'subject' | 'program' | 'subject-program') => {
    setGroupBy(value)
    setCurrentPage(1)
  }, [])

  const handleEditTopic = useCallback((topic: Topic) => {
    setSelectedTopic(topic)
    setTopicFormData({
      topicName: topic.topicName || "",
      subject: topic.subject || "",
      program: topic.program || "",
      description: topic.description || "",
      status: topic.status || "draft"
    })

    setIsEditTopicDialogOpen(true)
  }, [])

  const handleViewTopic = useCallback((topic: Topic) => {
    setSelectedTopic(topic)
    setIsViewTopicDialogOpen(true)
  }, [])

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, topicId: string, subtopicIndex: number) => {
    setDraggedItem({ topicId, subtopicIndex })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
    
    // Add some visual feedback
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5'
      }
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent, topicId: string, subtopicIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    // Only allow dropping within the same topic
    if (draggedItem && draggedItem.topicId === topicId) {
      setDragOverItem({ topicId, subtopicIndex })
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverItem(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, topicId: string, subtopicIndex: number) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.topicId !== topicId) return
    
    const fromIndex = draggedItem.subtopicIndex
    const toIndex = subtopicIndex
    
    if (fromIndex === toIndex) return

    // Find the topic
    const topic = topics.find(t => t.id === topicId)
    if (!topic || !topic.subtopics) return

    const subtopics = [...topic.subtopics]
    
    // Remove the dragged item and insert it at the new position
    const draggedSubtopic = subtopics.splice(fromIndex, 1)[0]
    subtopics.splice(toIndex, 0, draggedSubtopic)

    try {
      const response = await fetch(`/api/admin/topic-vault/${topicId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...topic,
          subtopics: subtopics
        })
      })

      if (response.ok) {
        toast.success('Subtopics reordered successfully!')
        await fetchTopics()
      } else {
        toast.error('Failed to reorder subtopics')
      }
    } catch (error) {
      console.error('Error reordering subtopics:', error)
      toast.error('Failed to reorder subtopics')
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

  // Bulk operations
  const handleSelectTopic = useCallback((topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (!topics || topics.length === 0) return
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([])
    } else {
      setSelectedTopics(topics.map(topic => topic.id))
    }
  }, [selectedTopics.length, topics])

  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const confirmBulkDelete = useCallback(() => {
    if (!selectedTopics || selectedTopics.length === 0) return
    setBulkDeleteConfirmOpen(true)
  }, [selectedTopics])

  const handleBulkDelete = useCallback(async () => {
    if (!selectedTopics || selectedTopics.length === 0) return
    
    setBulkActionLoading(true)
    try {
      const deletePromises = selectedTopics.map(id => 
        fetch(`/api/admin/topic-vault/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      toast.success(`Successfully deleted ${selectedTopics.length} topics`)
      setSelectedTopics([])
      
      // Refresh data and filters
      await Promise.all([
        fetchTopics(),
        fetchFilterOptions()
      ])
    } catch (error) {
      console.error('Error bulk deleting topics:', error)
      toast.error('Failed to delete selected topics')
    } finally {
      setBulkActionLoading(false)
      setBulkDeleteConfirmOpen(false)
    }
  }, [selectedTopics])

  // Get available programs for selected subject
  const getAvailablePrograms = useMemo(() => {
    if (!topicFormData.subject || topicFormData.subject === 'all') return []
    return SUBJECT_PROGRAMS[topicFormData.subject] || []
  }, [topicFormData.subject])

  // Pagination component
  const PaginationControls = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalTopics)} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalTopics)} of {totalTopics} results
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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
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
        
        /* Hide dialog close buttons */
        [data-radix-dialog-content] [data-radix-dialog-close] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        [data-radix-dialog-content] button[aria-label="Close"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        [data-radix-dialog-content] > button.absolute {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Scrollable Content Container */}
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-14 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden">

          {/* Enhanced Header */}
          <div className="mb-6 lg:mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="text-xs lg:text-sm text-blue-300 font-medium tracking-wider uppercase">Admin Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 tracking-tight">
              Topic Vault Management
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
              Organize topics with subtopic videos in a structured learning format
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
                    <p className="text-sm text-muted-foreground">Filter and search through topics</p>
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
                  placeholder="Search topics by name, subject, program..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="glass-input pl-10 h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                {/* Group By Filter */}
                <Select value={groupBy} onValueChange={handleGroupByChange}>
                  <SelectTrigger className="glass-select-trigger h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white">
                    <SelectValue placeholder="Group By" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl">
                    <SelectItem value="none" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">No Grouping</SelectItem>
                    <SelectItem value="subject" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Group by Subject</SelectItem>
                    <SelectItem value="program" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Group by Program</SelectItem>
                    <SelectItem value="subject-program" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Group by Subject & Program</SelectItem>
                  </SelectContent>
                </Select>
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
              
              {/* Quick Filter Tags */}
              {(subjects.length > 0 || programs.length > 0) && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-white/60 font-medium">Quick Filters:</span>
                    
                    {/* Subject Quick Filters */}
                    {subjects.slice(0, 4).map((subject) => (
                      <Button
                        key={`subject-${subject}`}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubject(subject)
                          setGroupBy('subject')
                          setCurrentPage(1)
                        }}
                        className={`h-7 px-3 text-xs transition-all duration-200 ${
                          selectedSubject === subject && groupBy === 'subject'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                            : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {subject}
                      </Button>
                    ))}
                    
                    {/* Program Quick Filters */}
                    {programs.slice(0, 3).map((program) => (
                      <Button
                        key={`program-${program}`}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProgram(program)
                          setGroupBy('program')
                          setCurrentPage(1)
                        }}
                        className={`h-7 px-3 text-xs transition-all duration-200 ${
                          selectedProgram === program && groupBy === 'program'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                            : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {program}
                      </Button>
                    ))}
                    
                    {/* Group by Subject-Program Quick Filter */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGroupBy('subject-program')
                        setCurrentPage(1)
                      }}
                      className={`h-7 px-3 text-xs transition-all duration-200 ${
                        groupBy === 'subject-program'
                          ? 'bg-green-500/20 text-green-400 border-green-500/40'
                          : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      🗂️ Group All (Default)
                    </Button>
                  </div>
                </div>
              )}
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
                        {totalTopics} total topics
                        {groupBy !== 'none' && (() => {
                          const grouped = groupTopics(topics || [], groupBy)
                          const groupCount = Object.keys(grouped).length
                          return ` • ${groupCount} ${groupBy.includes('-') ? 'groups' : groupBy + 's'}`
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedTopics && selectedTopics.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {selectedTopics.length} selected
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
                  {groupBy !== 'none' && (() => {
                    if (groupBy === 'subject-program') {
                      const hierarchical = createHierarchicalGroups(topics || [])
                      const allSubjects = Object.keys(hierarchical)
                      const allPrograms = Object.entries(hierarchical).flatMap(([subject, programs]) => 
                        Object.keys(programs).map(program => `${subject}::${program}`)
                      )
                      const allExpanded = allSubjects.every(name => expandedSubjects.has(name)) && 
                                         allPrograms.every(name => expandedPrograms.has(name))
                      
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (allExpanded) {
                              setExpandedSubjects(new Set())
                              setExpandedPrograms(new Set())
                            } else {
                              setExpandedSubjects(new Set(allSubjects))
                              setExpandedPrograms(new Set(allPrograms))
                            }
                          }}
                          className="glass-button text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                        >
                          {allExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Collapse All
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Expand All
                            </>
                          )}
                        </Button>
                      )
                    } else {
                      const grouped = groupTopics(topics || [], groupBy)
                      const allGroupNames = Object.keys(grouped)
                      const allExpanded = allGroupNames.every(name => expandedGroups.has(name))
                      
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (allExpanded) {
                              setExpandedGroups(new Set())
                            } else {
                              setExpandedGroups(new Set(allGroupNames))
                            }
                          }}
                          className="glass-button text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                        >
                          {allExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Collapse All
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Expand All
                            </>
                          )}
                        </Button>
                      )
                    }
                  })()}
                  
                  <Link href="/admin/topic-vault/import">
                    <Button variant="outline" className="glass-button text-green-400 border-green-500/30 hover:bg-green-500/10">
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                    </Button>
                  </Link>
                  <Dialog open={isCreateTopicDialogOpen} onOpenChange={setIsCreateTopicDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Topic
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Topics List */}
          <Card className="relative bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-800/30 to-purple-800/20">
              <CardTitle className="text-white font-semibold text-lg flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Topics ({totalTopics})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading topics...</p>
                </div>
              ) : !topics || topics.length === 0 ? (
                <div className="p-8 text-center">
                  <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No topics yet</h3>
                  <p className="text-slate-400 mb-6">Create your first topic to get started</p>
                  <Button 
                    onClick={() => setIsCreateTopicDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                        <Plus className="w-4 h-4 mr-2" />
                    Create Topic
                      </Button>
                </div>
              ) : (
                                <div className="space-y-0">
                  {(() => {
                    if (groupBy === 'subject-program') {
                      const hierarchical = createHierarchicalGroups(topics || [])
                      return Object.entries(hierarchical).map(([subject, programs]) => (
                        <div key={subject} className="space-y-0">
                          {/* Subject Header */}
                          <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-800/95 to-slate-700/95 backdrop-blur-sm border-b border-white/20 shadow-lg">
                            <button
                              onClick={() => toggleSubjectExpanded(subject)}
                              className="w-full px-6 py-4 hover:bg-white/5 transition-all duration-200 text-left group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-200">
                                  {expandedSubjects.has(subject) ? (
                                    <FolderOpen className="w-5 h-5 text-blue-400" />
                                  ) : (
                                    <div className="text-lg">📁</div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-white font-bold text-xl group-hover:text-blue-200 transition-colors duration-200">
                                        📚 {subject}
                                      </h3>
                                      <p className="text-slate-400 text-sm mt-1">
                                        {Object.keys(programs).length} program{Object.keys(programs).length !== 1 ? 's' : ''} • 
                                        {Object.values(programs).flat().length} total topics
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        expandedSubjects.has(subject) 
                                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                      }`}>
                                        Subject
                                      </div>
                                      <div className="text-slate-400 group-hover:text-white transition-colors duration-200">
                                        {expandedSubjects.has(subject) ? (
                                          <ChevronDown className="w-5 h-5" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>

                          {/* Programs under this subject */}
                          {expandedSubjects.has(subject) && Object.entries(programs).map(([program, programTopics]) => (
                            <div key={`${subject}-${program}`} className="ml-8">
                              {/* Program Header */}
                              <div className="sticky top-16 z-10 bg-gradient-to-r from-slate-700/90 to-slate-600/90 backdrop-blur-sm border-b border-white/10">
                                <button
                                  onClick={() => toggleProgramExpanded(subject, program)}
                                  className="w-full px-6 py-3 hover:bg-white/5 transition-all duration-200 text-left group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-200">
                                      {expandedPrograms.has(`${subject}::${program}`) ? (
                                        <FolderOpen className="w-4 h-4 text-purple-400" />
                                      ) : (
                                        <div className="text-sm">📂</div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h4 className="text-white font-semibold text-lg group-hover:text-purple-200 transition-colors duration-200">
                                            🎯 {program}
                                          </h4>
                                          <p className="text-slate-400 text-xs mt-1">
                                            {programTopics.length} topic{programTopics.length !== 1 ? 's' : ''} • 
                                            {programTopics.filter(t => t.status === 'active').length} active
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            expandedPrograms.has(`${subject}::${program}`) 
                                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                          }`}>
                                            Program
                                          </div>
                                          <div className="text-slate-400 group-hover:text-white transition-colors duration-200">
                                            {expandedPrograms.has(`${subject}::${program}`) ? (
                                              <ChevronDown className="w-4 h-4" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </div>

                              {/* Topics under this program */}
                              {expandedPrograms.has(`${subject}::${program}`) && programTopics.map((topic) => {
                                const isExpanded = expandedTopics.has(topic.id)
                                return (
                                  <div key={topic.id} className="border-b border-white/10 last:border-b-0">
                                    {/* Main Topic Row */}
                                    <div className="p-4 hover:bg-white/5 transition-colors ml-16 border-l-2 border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectTopic(topic.id)}
                                className="p-1 h-auto"
                              >
                                {selectedTopics.includes(topic.id) ? (
                                  <CheckSquare className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400" />
                                )}
                              </Button>
                              
                                <Button
                                  variant="ghost"
                                  size="sm"
                                onClick={() => toggleExpanded(topic.id)}
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
                                <h3 className="text-white font-medium">{topic.topicName}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                  <span>{topic.subject}</span>
                                  <span>{topic.program}</span>
                                  <Badge 
                                    className={`px-2 py-1 text-xs ${getStatusColor(topic.status)}`}
                                  >
                                    {topic.status}
                                  </Badge>
                                  <span className="text-xs">
                                    {topic.subtopics?.length || 0} subtopics
                                  </span>
                                                                    </div>
                                    </div>
                                  </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTopic(topic)
                                  setSubtopicFormData(createEmptySubtopicFormData())
                                  setIsAddSubtopicDialogOpen(true)
                                }}
                                className="text-blue-400 border-blue-400/30 hover:bg-blue-500/10"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Subtopic
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTopic(topic)}
                                className="text-yellow-400 border-yellow-400/30 hover:bg-yellow-500/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-500/10">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-900 border-white/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete Topic</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                      This will permanently delete "{topic.topicName}" and all its subtopics. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => confirmDeleteTopic(topic.id)}
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

                                    {/* Expanded Subtopics List */}
                                    {isExpanded && (
                                      <div className="bg-slate-800/30 border-t border-white/10 ml-16">
                                        {topic.subtopics && topic.subtopics.length > 0 ? (
                                          <div className="space-y-0">
                                            {topic.subtopics.map((subtopic, index) => (
                                              <div
                                                key={subtopic.id || index}
                                                className={`group p-4 border-b border-white/5 last:border-b-0 ml-12 
                                                           ${draggedItem?.topicId === topic.id && draggedItem.subtopicIndex === index ? 'opacity-50' : ''}
                                                           ${dragOverItem?.topicId === topic.id && dragOverItem.subtopicIndex === index ? 'bg-blue-500/10' : ''}`}
                                                onDragStart={(e) => handleDragStart(e, topic.id, index)}
                                                onDragOver={(e) => handleDragOver(e, topic.id, index)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, topic.id, index)}
                                                onDragEnd={handleDragEnd}
                                                draggable={true}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-3">
                                                    <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors">
                                                      <GripVertical className="w-4 h-4 text-slate-400 hover:text-white" />
                                                    </div>
                                                    <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center text-xs font-medium text-purple-400">
                                                      {index + 1}
                                                    </div>
                                                    <Video className="w-4 h-4 text-purple-400" />
                                                    <div>
                                                      <h4 className="text-white font-medium">{subtopic.videoName}</h4>
                                                      <div className="flex items-center gap-4 text-xs mt-2">
                                                        <Badge className={`${getTypeColor(subtopic.type)} border text-xs`}>
                                                          {subtopic.type}
                                                        </Badge>
                                                        <span className="text-slate-400">{subtopic.teacher}</span>
                                                        <span className="text-slate-400">{subtopic.duration}</span>
                                                        <Badge className={`${getStatusColor(subtopic.status)} border text-xs`}>
                                                          {subtopic.status}
                                                        </Badge>
                                                        {subtopic.videoEmbedLink && (
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation()
                                                              window.open(ensureUrlProtocol(subtopic.videoEmbedLink), '_blank', 'noopener,noreferrer')
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 
                                                                     border border-blue-500/30 hover:border-blue-500/50 rounded-lg
                                                                     text-blue-400 hover:text-blue-300 transition-all duration-200"
                                                          >
                                                            <Play className="w-3 h-3" />
                                                            Watch Video
                                                            <ExternalLink className="w-3 h-3" />
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Edit and Delete buttons */}
                                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        openEditSubtopicDialog(topic, subtopic, index)
                                                      }}
                                                      className="h-8 w-8 p-0 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300"
                                                    >
                                                      <Edit className="w-4 h-4" />
                                                    </Button>
                                                    
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        openDeleteSubtopicDialog(topic, subtopic, index)
                                                      }}
                                                      className="h-8 w-8 p-0 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300"
                                                    >
                                                      <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="p-8 text-center ml-12">
                                            <Video className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                            <p className="text-slate-400 text-sm">No subtopics added yet</p>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setSelectedTopic(topic)
                                                setSubtopicFormData(createEmptySubtopicFormData())
                                                setIsAddSubtopicDialogOpen(true)
                                              }}
                                              className="mt-3 text-blue-400 border-blue-400/30"
                                            >
                                              <Plus className="w-4 h-4 mr-1" />
                                              Add First Subtopic
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      ))
                    } else {
                      // Handle other groupBy types (subject, program, none)
                      const groupedTopics = groupTopics(topics || [], groupBy)
                      return Object.entries(groupedTopics).map(([groupName, groupTopics]) => (
                        <div key={groupName} className="space-y-0">
                          {groupBy !== 'none' && (
                            <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-b border-white/20 shadow-lg">
                              <button
                                onClick={() => toggleGroupExpanded(groupName)}
                                className="w-full px-6 py-4 hover:bg-white/5 transition-all duration-200 text-left group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-200">
                                    {expandedGroups.has(groupName) ? (
                                      <FolderOpen className="w-5 h-5 text-blue-400" />
                                    ) : (
                                      <div className="text-lg">📁</div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="text-white font-semibold text-xl group-hover:text-blue-200 transition-colors duration-200">
                                          {groupName}
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-1">
                                          {groupTopics.length} topic{groupTopics.length !== 1 ? 's' : ''} • 
                                          {groupTopics.filter(t => t.status === 'active').length} active
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          expandedGroups.has(groupName) 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                        }`}>
                                          {expandedGroups.has(groupName) ? 'Expanded' : 'Collapsed'}
                                        </div>
                                        <div className="text-slate-400 group-hover:text-white transition-colors duration-200">
                                          {expandedGroups.has(groupName) ? (
                                            <ChevronDown className="w-5 h-5" />
                                          ) : (
                                            <ChevronRight className="w-5 h-5" />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          )}
                          {(groupBy === 'none' || expandedGroups.has(groupName)) && groupTopics.map((topic) => {
                            const isExpanded = expandedTopics.has(topic.id)
                            return (
                              <div key={topic.id} className="border-b border-white/10 last:border-b-0">
                                {/* Main Topic Row */}
                                <div className={`p-4 hover:bg-white/5 transition-colors ${groupBy !== 'none' ? 'ml-8 border-l-2 border-white/10' : ''}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSelectTopic(topic.id)}
                                        className="p-1 h-auto"
                                      >
                                        {selectedTopics.includes(topic.id) ? (
                                          <CheckSquare className="w-4 h-4 text-blue-400" />
                                        ) : (
                                          <Square className="w-4 h-4 text-slate-400" />
                                        )}
                                      </Button>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpanded(topic.id)}
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
                                        <h3 className="text-white font-medium">{topic.topicName}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                          <span>{topic.subject}</span>
                                          <span>{topic.program}</span>
                                          <Badge 
                                            className={`px-2 py-1 text-xs ${getStatusColor(topic.status)}`}
                                          >
                                            {topic.status}
                                          </Badge>
                                          <span className="text-xs">
                                            {topic.subtopics?.length || 0} subtopics
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                              
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedTopic(topic)
                                          setSubtopicFormData(createEmptySubtopicFormData())
                                          setIsAddSubtopicDialogOpen(true)
                                        }}
                                        className="text-blue-400 border-blue-400/30 hover:bg-blue-500/10"
                                      >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Subtopic
                                      </Button>
                                      
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditTopic(topic)}
                                        className="text-yellow-400 border-yellow-400/30 hover:bg-yellow-500/10"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-slate-900 border-white/20">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Delete Topic</AlertDialogTitle>
                                            <AlertDialogDescription className="text-slate-400">
                                              This will permanently delete "{topic.topicName}" and all its subtopics. This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={() => confirmDeleteTopic(topic.id)}
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

                                {/* Expanded Subtopics List */}
                                {isExpanded && (
                                  <div className={`bg-slate-800/30 border-t border-white/10 ${groupBy !== 'none' ? 'ml-8' : ''}`}>
                                    {topic.subtopics && topic.subtopics.length > 0 ? (
                                      <div className="space-y-0">
                                        {topic.subtopics.map((subtopic, index) => (
                                          <div
                                            key={subtopic.id || index}
                                            className={`group p-4 border-b border-white/5 last:border-b-0 ml-12 
                                                       ${draggedItem?.topicId === topic.id && draggedItem.subtopicIndex === index ? 'opacity-50' : ''}
                                                       ${dragOverItem?.topicId === topic.id && dragOverItem.subtopicIndex === index ? 'bg-blue-500/10' : ''}`}
                                            onDragStart={(e) => handleDragStart(e, topic.id, index)}
                                            onDragOver={(e) => handleDragOver(e, topic.id, index)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, topic.id, index)}
                                            onDragEnd={handleDragEnd}
                                            draggable={true}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors">
                                                  <GripVertical className="w-4 h-4 text-slate-400 hover:text-white" />
                                                </div>
                                                <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center text-xs font-medium text-purple-400">
                                                  {index + 1}
                                                </div>
                                                <Video className="w-4 h-4 text-purple-400" />
                                                <div>
                                                  <h4 className="text-white font-medium">{subtopic.videoName}</h4>
                                                  <div className="flex items-center gap-4 text-xs mt-2">
                                                    <Badge className={`${getTypeColor(subtopic.type)} border text-xs`}>
                                                      {subtopic.type}
                                                    </Badge>
                                                    <span className="text-slate-400">{subtopic.teacher}</span>
                                                    <span className="text-slate-400">{subtopic.duration}</span>
                                                    <Badge className={`${getStatusColor(subtopic.status)} border text-xs`}>
                                                      {subtopic.status}
                                                    </Badge>
                                                    {subtopic.videoEmbedLink && (
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          window.open(ensureUrlProtocol(subtopic.videoEmbedLink), '_blank', 'noopener,noreferrer')
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 
                                                                 border border-blue-500/30 hover:border-blue-500/50 rounded-lg
                                                                 text-blue-400 hover:text-blue-300 transition-all duration-200"
                                                      >
                                                        <Play className="w-3 h-3" />
                                                        Watch Video
                                                        <ExternalLink className="w-3 h-3" />
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              
                                              {/* Edit and Delete buttons */}
                                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    openEditSubtopicDialog(topic, subtopic, index)
                                                  }}
                                                  className="h-8 w-8 p-0 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300"
                                                >
                                                  <Edit className="w-4 h-4" />
                                                </Button>
                                                
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    openDeleteSubtopicDialog(topic, subtopic, index)
                                                  }}
                                                  className="h-8 w-8 p-0 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="p-8 text-center ml-12">
                                        <Video className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                        <p className="text-slate-400 text-sm">No subtopics added yet</p>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedTopic(topic)
                                            setSubtopicFormData(createEmptySubtopicFormData())
                                            setIsAddSubtopicDialogOpen(true)
                                          }}
                                          className="mt-3 text-blue-400 border-blue-400/30"
                                        >
                                          <Plus className="w-4 h-4 mr-1" />
                                          Add First Subtopic
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ))
                    }
                  })()}
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
                  
      {/* Create Topic Dialog */}
      <Dialog open={isCreateTopicDialogOpen} onOpenChange={setIsCreateTopicDialogOpen}>
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
                    <DialogTitle className="text-xl font-semibold text-white">Create New Topic</DialogTitle>
                </div>
        </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTopicFormData(createEmptyTopicFormData())}
                    className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 px-3 text-xs transition-all duration-200"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreateTopicDialogOpen(false)}
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
                    <BookOpen className="w-3 h-3 text-blue-400" />
                </div>
                  <h3 className="text-sm font-medium text-white/90">Topic Information</h3>
              </div>
              
                {/* Topic Name - Full Width */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                    Topic Name *
                </label>
                <Input 
                    placeholder="e.g., Calculus Fundamentals" 
                    value={topicFormData.topicName}
                    onChange={(e) => setTopicFormData({...topicFormData, topicName: e.target.value})}
                  className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                />
              </div>

                {/* Subject and Program */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                      Subject *
                  </label>
                    <Select 
                      value={topicFormData.subject} 
                      onValueChange={(value) => setTopicFormData({...topicFormData, subject: value, program: ""})}
                    >
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
                      value={topicFormData.program} 
                      onValueChange={(value) => setTopicFormData({...topicFormData, program: value})}
                      disabled={!topicFormData.subject}
                  >
                      <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10 disabled:opacity-50">
                        <SelectValue placeholder={topicFormData.subject ? "Select program" : "Select subject first"} />
                    </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                        {getAvailablePrograms.map((program) => (
                          <SelectItem key={program} value={program} className="text-white hover:bg-white/10">
                            {program}
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
                    placeholder="Enter topic description (optional)" 
                    value={topicFormData.description}
                    onChange={(e) => setTopicFormData({...topicFormData, description: e.target.value})}
                  className="glass-input min-h-[80px] bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10 resize-none" 
                  rows={3}
                />
              </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Status *
                  </label>
                  <Select 
                    value={topicFormData.status} 
                    onValueChange={(value: 'draft' | 'active') => setTopicFormData({...topicFormData, status: value})}
                  >
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
                onClick={() => setIsCreateTopicDialogOpen(false)} 
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
                onClick={handleCreateTopic}
                disabled={!topicFormData.topicName || !topicFormData.subject || !topicFormData.program}
              >
                <Plus className="w-3 h-3 mr-1" />
                Create Topic
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subtopic Dialog */}
      <Dialog open={isAddSubtopicDialogOpen} onOpenChange={setIsAddSubtopicDialogOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border-white/20 max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:!hidden">
          
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
                      Add Subtopic to "{selectedTopic?.topicName}"
                    </DialogTitle>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubtopicFormData(createEmptySubtopicFormData())}
                    className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 px-3 text-xs transition-all duration-200"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddSubtopicDialogOpen(false)}
                    className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Subtopic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Video className="w-3 h-3 text-green-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Subtopic Information</h3>
                </div>
                
                {/* Video Name */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Video Name *
                  </label>
                  <Input 
                    placeholder="e.g., Introduction to Derivatives" 
                    value={subtopicFormData.videoName}
                    onChange={(e) => setSubtopicFormData({...subtopicFormData, videoName: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>

                {/* Type and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">
                      Type *
                  </label>
                  <Select 
                      value={subtopicFormData.type} 
                      onValueChange={(value) => setSubtopicFormData({...subtopicFormData, type: value as 'Lesson' | 'Tutorial' | 'Workshop'})}
                  >
                      <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
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

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Duration
                  </label>
                  <Input 
                    placeholder="e.g., 45 minutes" 
                      value={subtopicFormData.duration}
                      onChange={(e) => setSubtopicFormData({...subtopicFormData, duration: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                  </div>
                </div>
                
                {/* Teacher */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Teacher *
                  </label>
                  <Input 
                    placeholder="Enter teacher name" 
                    value={subtopicFormData.teacher}
                    onChange={(e) => setSubtopicFormData({...subtopicFormData, teacher: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Description
                  </label>
                  <Textarea 
                    placeholder="Enter description (optional)" 
                    value={subtopicFormData.description}
                    onChange={(e) => setSubtopicFormData({...subtopicFormData, description: e.target.value})}
                    className="glass-input min-h-[80px] bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10 resize-none" 
                    rows={3}
                  />
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
                      Video Embed Link *
                  </label>
                  <Input 
                    placeholder="Enter video embed link (required)" 
                      value={subtopicFormData.videoEmbedLink}
                      onChange={(e) => setSubtopicFormData({...subtopicFormData, videoEmbedLink: e.target.value})}
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
                      value={subtopicFormData.zoomLink}
                      onChange={(e) => setSubtopicFormData({...subtopicFormData, zoomLink: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                    Status *
                </label>
                <Select 
                    value={subtopicFormData.status} 
                    onValueChange={(value) => setSubtopicFormData({...subtopicFormData, status: value as 'draft' | 'active'})}
                >
                    <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
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

            {/* Footer */}
            <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 -m-6 mt-0 border-t border-white/10 flex gap-3 justify-end">
            <Button 
                variant="outline" 
                onClick={() => setIsAddSubtopicDialogOpen(false)} 
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
                onClick={handleAddSubtopic}
                disabled={!subtopicFormData.videoName || !subtopicFormData.teacher || !subtopicFormData.videoEmbedLink}
            >
              <Plus className="w-3 h-3 mr-1" />
                Add Subtopic
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Topic Dialog */}
      <Dialog open={isEditTopicDialogOpen} onOpenChange={setIsEditTopicDialogOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center">
              <Edit className="w-5 h-5 mr-2 text-yellow-400" />
              Edit Topic
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
                  value={topicFormData.topicName}
                  onChange={(e) => setTopicFormData({...topicFormData, topicName: e.target.value})}
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
                    value={topicFormData.topicName}
                    onChange={(e) => setTopicFormData({...topicFormData, topicName: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Subject
                  </label>
                  <Select 
                    value={topicFormData.subject} 
                    onValueChange={(value) => setTopicFormData({...topicFormData, subject: value, program: ""})}
                  >
                    <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
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
                  value={topicFormData.description}
                  onChange={(e) => setTopicFormData({...topicFormData, description: e.target.value})}
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
                    value={topicFormData.program} 
                    onValueChange={(value) => setTopicFormData({...topicFormData, program: value})}
                    disabled={!topicFormData.subject}
                  >
                    <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
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
                    Status
                  </label>
                  <Select 
                    value={topicFormData.status} 
                    onValueChange={(value) => setTopicFormData({...topicFormData, status: value as 'draft' | 'active'})}
                  >
                    <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select type" />
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

              {/* Created and Updated Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Created At
                  </label>
                  <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                    {selectedTopic ? formatDate(selectedTopic.createdAt) : 'Not specified'}
                </div>
              </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Updated At
                  </label>
                  <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                    {selectedTopic ? formatDate(selectedTopic.updatedAt) : 'Not specified'}
                </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  Status
                </label>
                <Select 
                  value={topicFormData.status} 
                  onValueChange={(value) => setTopicFormData({...topicFormData, status: value as 'draft' | 'active'})}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
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
              onClick={() => setIsEditTopicDialogOpen(false)}
              className="glass-button text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       text-white disabled:opacity-50 disabled:cursor-not-allowed h-9 px-6 rounded-lg text-sm
                       transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              onClick={handleUpdateTopic}
              disabled={!topicFormData.topicName || !topicFormData.subject || !topicFormData.program}
            >
              <Check className="w-3 h-3 mr-1" />
              Update Topic
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Topic Dialog */}
      <Dialog open={isViewTopicDialogOpen} onOpenChange={setIsViewTopicDialogOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center">
              <Eye className="w-5 h-5 mr-2 text-green-400" />
              View Topic Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTopic && (
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

                  {/* Topic Name - Full Width */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">Topic Name</label>
                    <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                      {selectedTopic.topicName || 'Not specified'}
                    </div>
                  </div>

                  {/* Subject and Program - 2 Column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Subject</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {selectedTopic.subject || 'Not specified'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Program</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {selectedTopic.program || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {/* Description - Full Width */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">Description</label>
                    <div className="glass-input min-h-[80px] bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-start p-3">
                      {selectedTopic.description || 'No description provided'}
                    </div>
                  </div>

                  {/* Subtopics Info - 2 Column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Total Subtopics</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {selectedTopic.subtopics?.length || 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Active Subtopics</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {selectedTopic.subtopics?.filter(s => s.status === 'active').length || 0}
                      </div>
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
                        <Badge className={`${getStatusColor(selectedTopic.status)} border text-xs`}>
                          {selectedTopic.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/80 block">Created</label>
                      <div className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 flex items-center px-3">
                        {formatDate(selectedTopic.createdAt)}
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
              onClick={() => setIsViewTopicDialogOpen(false)}
              className="glass-button text-white hover:bg-white/10"
            >
              Close
            </Button>
            {selectedTopic && (
              <Button 
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 
                         text-white h-9 px-6 rounded-lg text-sm transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                onClick={() => {
                  setIsViewTopicDialogOpen(false)
                  handleEditTopic(selectedTopic)
                }}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit Topic
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
              Delete Topic
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this topic? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTopic}
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
              Delete Multiple Topics
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete {selectedTopics?.length || 0} topics? This action cannot be undone.
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

      {/* Edit Subtopic Dialog */}
      <Dialog open={isEditSubtopicDialogOpen} onOpenChange={setIsEditSubtopicDialogOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border-white/20 max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:!hidden">
          
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10 rounded-3xl"></div>
          <div className="relative">
            {/* Header */}
            <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl px-6 py-4 -m-6 mb-0 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-white">
                      Edit Subtopic: "{selectedSubtopic?.videoName}"
                    </DialogTitle>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditSubtopicDialogOpen(false)}
                    className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Subtopic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Video className="w-3 h-3 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Subtopic Information</h3>
                </div>
                
                {/* Video Name */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Video Name *
                  </label>
                  <Input 
                    placeholder="e.g., Introduction to Derivatives" 
                    value={subtopicFormData.videoName}
                    onChange={(e) => setSubtopicFormData({...subtopicFormData, videoName: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>

                {/* Type and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">
                      Type *
                    </label>
                    <Select 
                      value={subtopicFormData.type} 
                      onValueChange={(value) => setSubtopicFormData({...subtopicFormData, type: value as 'Lesson' | 'Tutorial' | 'Workshop'})}
                    >
                      <SelectTrigger className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                              rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                        <SelectItem value="Lesson" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Lesson</SelectItem>
                        <SelectItem value="Tutorial" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Tutorial</SelectItem>
                        <SelectItem value="Workshop" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80 block">
                      Duration *
                    </label>
                    <Input 
                      placeholder="e.g., 30 min" 
                      value={subtopicFormData.duration}
                      onChange={(e) => setSubtopicFormData({...subtopicFormData, duration: e.target.value})}
                      className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                               rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                    />
                  </div>
                </div>

                {/* Teacher */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Teacher *
                  </label>
                  <Input 
                    placeholder="e.g., Dr. Smith" 
                    value={subtopicFormData.teacher}
                    onChange={(e) => setSubtopicFormData({...subtopicFormData, teacher: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Description
                  </label>
                  <Textarea 
                    placeholder="Brief description of the subtopic..." 
                    value={subtopicFormData.description}
                    onChange={(e) => setSubtopicFormData({...subtopicFormData, description: e.target.value})}
                    className="glass-input min-h-[80px] bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10 resize-none" 
                    rows={3}
                  />
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-3 h-3 text-green-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Links & Resources</h3>
                </div>

                {/* Video Embed Link */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Video Embed Link *
                  </label>
                  <Input 
                    placeholder="https://youtube.com/watch?v=... or embed URL" 
                    value={subtopicFormData.videoEmbedLink}
                    onChange={(e) => setSubtopicFormData({...subtopicFormData, videoEmbedLink: e.target.value})}
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
                    placeholder="https://zoom.us/j/... (for live sessions)" 
                    value={subtopicFormData.zoomLink}
                    onChange={(e) => setSubtopicFormData({...subtopicFormData, zoomLink: e.target.value})}
                    className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                             rounded-lg text-sm transition-all duration-200 hover:bg-white/10" 
                  />
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Settings className="w-3 h-3 text-purple-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Status & Visibility</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 block">
                    Status *
                  </label>
                  <Select 
                    value={subtopicFormData.status} 
                    onValueChange={(value) => setSubtopicFormData({...subtopicFormData, status: value as 'draft' | 'active'})}
                  >
                    <SelectTrigger className="glass-input h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                            rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
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

            {/* Footer */}
            <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl px-6 py-4 -m-6 mt-0 border-t border-white/10 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsEditSubtopicDialogOpen(false)}
                className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg px-4 py-2 text-sm transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditSubtopic} 
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white border-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Edit className="w-4 h-4 mr-2" />
                Update Subtopic
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Subtopic Confirmation Dialog */}
      <AlertDialog open={isDeleteSubtopicDialogOpen} onOpenChange={setIsDeleteSubtopicDialogOpen}>
        <AlertDialogContent className="glass-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-400" />
              Delete Subtopic
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete the subtopic "{selectedSubtopic?.videoName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubtopic}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Subtopic
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
