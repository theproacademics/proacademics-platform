"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tags, 
  BookOpen, 
  Palette,
  Save,
  X,
  Search,
  Filter,
  MoreVertical,
  Settings,
  Calendar
} from "lucide-react"
import { toast } from "sonner"

interface Subject {
  _id?: string
  id: string
  name: string
  color: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  programs: Program[]
}

interface Program {
  _id?: string
  id: string
  name: string
  subjectId: string
  color: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const predefinedColors = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F472B6", // Hot Pink
  "#A855F7", // Violet
  "#22C55E", // Green
  "#FB7185", // Rose
  "#06B6D4", // Sky
  "#FBBF24", // Yellow
  "#8B5A2B", // Brown
  "#6B7280", // Gray
  "#1F2937", // Dark Gray
  "#DC2626", // Bright Red
  "#2563EB", // Bright Blue
  "#059669", // Dark Green
  "#7C3AED", // Deep Purple
]

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  
  // Form states
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    color: predefinedColors[0],
    isActive: true
  })
  const [programForm, setProgramForm] = useState({
    name: "",
    subjectId: "",
    color: predefinedColors[0],
    isActive: true
  })
  
  // Dialog states
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false)
  const [programDialogOpen, setProgramDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])



  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/subjects')
      const data = await response.json()
      
      if (data.success) {
        setSubjects(data.subjects)
      } else {
        toast.error("Failed to fetch subjects")
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
      toast.error("Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editMode && selectedSubject 
        ? `/api/admin/subjects/${selectedSubject.id}`
        : '/api/admin/subjects'
      
      const method = editMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(editMode ? "Subject updated successfully" : "Subject created successfully")
        setSubjectDialogOpen(false)
        resetSubjectForm()
        fetchSubjects()
      } else {
        toast.error(data.error || "Failed to save subject")
      }
    } catch (error) {
      console.error("Error saving subject:", error)
      toast.error("Failed to save subject")
    }
  }

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editMode && selectedProgram 
        ? `/api/admin/programs/${selectedProgram.id}`
        : '/api/admin/programs'
      
      const method = editMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(editMode ? "Program updated successfully" : "Program created successfully")
        setProgramDialogOpen(false)
        resetProgramForm()
        fetchSubjects()
      } else {
        toast.error(data.error || "Failed to save program")
      }
    } catch (error) {
      console.error("Error saving program:", error)
      toast.error("Failed to save program")
    }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/admin/subjects/${subjectId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Subject deleted successfully")
        fetchSubjects()
      } else {
        toast.error(data.error || "Failed to delete subject")
      }
    } catch (error) {
      console.error("Error deleting subject:", error)
      toast.error("Failed to delete subject")
    }
  }

  const handleDeleteProgram = async (programId: string) => {
    try {
      const response = await fetch(`/api/admin/programs/${programId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Program deleted successfully")
        fetchSubjects()
      } else {
        toast.error(data.error || "Failed to delete program")
      }
    } catch (error) {
      console.error("Error deleting program:", error)
      toast.error("Failed to delete program")
    }
  }

  const resetSubjectForm = () => {
    setSubjectForm({
      name: "",
      color: predefinedColors[0],
      isActive: true
    })
    setSelectedSubject(null)
    setEditMode(false)
  }

  const resetProgramForm = () => {
    setProgramForm({
      name: "",
      subjectId: "",
      color: predefinedColors[0],
      isActive: true
    })
    setSelectedProgram(null)
    setEditMode(false)
  }

  const openEditSubject = (subject: Subject) => {
    setSelectedSubject(subject)
    setSubjectForm({
      name: subject.name,
      color: subject.color,
      isActive: subject.isActive
    })
    setEditMode(true)
    setSubjectDialogOpen(true)
  }

  const openEditProgram = (program: Program) => {
    setSelectedProgram(program)
    setProgramForm({
      name: program.name,
      subjectId: program.subjectId,
      color: program.color,
      isActive: program.isActive
    })
    setEditMode(true)
    setProgramDialogOpen(true)
  }

  const openNewProgram = (subjectId?: string) => {
    resetProgramForm()
    if (subjectId) {
      setProgramForm(prev => ({ ...prev, subjectId }))
    }
    setProgramDialogOpen(true)
  }

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.programs.some(program => 
                           program.name.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesFilter = filterActive === null || subject.isActive === filterActive
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 z-10 overflow-y-auto">
          <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-14 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-white/10 rounded w-1/3 mx-auto"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-white/10 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl animate-pulse delay-3000"></div>
        <div className="absolute top-1/2 left-5 w-48 h-48 bg-violet-500/8 rounded-full blur-3xl animate-pulse delay-4000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400/60 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce delay-1500"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEyNywgNjMsIDI1NSwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      </div>
      
      {/* Scrollable Content Container */}
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-14 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden">
          {/* Enhanced Header */}
          <div className="mb-6 lg:mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Tags className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="text-xs lg:text-sm text-blue-300 font-medium tracking-wider uppercase">Admin Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 tracking-tight">
              Subjects & Programs
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
              Manage subjects and their associated programs with custom colors and advanced organization
            </p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto animate-pulse"></div>
          </div>
          {/* Enhanced Filters & Actions Section */}
          <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-3xl mb-4 lg:mb-8 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
            <CardContent className="relative p-3 sm:p-4 lg:p-8">
              {/* Search Bar */}
              <div className="mb-4 lg:mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2 lg:mb-3">Search Subjects & Programs</label>
                <div className="relative group">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-400 transition-colors duration-200 z-10" />
                  <Input
                    placeholder="Search by subject name, program name, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 bg-white/[0.03] border-2 border-white/20 rounded-xl sm:rounded-2xl text-white placeholder:text-slate-400 
                             focus:border-blue-400/80 focus:ring-2 sm:focus:ring-4 focus:ring-blue-400/20 focus:bg-white/[0.08]
                             hover:bg-white/[0.05] hover:border-white/30
                             transition-all duration-300 ease-in-out
                             focus-visible:outline-none focus-visible:ring-2 sm:focus-visible:ring-4 focus-visible:ring-blue-400/20
                             text-sm w-full"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white 
                               hover:bg-white/10 rounded-lg p-1 transition-all duration-200 z-10"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Section */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</label>
                    <Select 
                      value={filterActive === null ? "all" : filterActive ? "active" : "inactive"} 
                      onValueChange={(value) => 
                        setFilterActive(value === "all" ? null : value === "active")
                      }
                    >
                      <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white 
                                             hover:bg-white/[0.05] hover:border-white/30
                                             focus:border-blue-400/80 focus:ring-4 focus:ring-blue-400/20 
                                             transition-all duration-300 ease-in-out
                                             focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/20
                                             h-11">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border border-white/20 rounded-xl z-[999999]">
                        <SelectItem value="all" className="hover:bg-white/10 text-white cursor-pointer">All Status</SelectItem>
                        <SelectItem value="active" className="hover:bg-white/10 text-white cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Active</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive" className="hover:bg-white/10 text-white cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span>Inactive</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  {(searchTerm || filterActive !== null) && (
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm("")
                          setFilterActive(null)
                        }}
                        className="bg-white/[0.03] border-2 border-red-400/30 text-red-400 
                                 hover:bg-red-500/10 hover:border-red-400/50 
                                 focus:ring-4 focus:ring-red-400/20 focus:border-red-400/60
                                 rounded-xl transition-all duration-300 ease-in-out h-11 px-6"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={resetSubjectForm}
                      className="w-full bg-blue-500/10 border border-blue-400/30 text-blue-400 
                               hover:bg-blue-500/20 hover:border-blue-400/50 
                               focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400/60
                               rounded-xl transition-all duration-200 backdrop-blur-sm h-11 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subject
                    </Button>
                  </DialogTrigger>
                <SubjectDialog 
                  form={subjectForm}
                  setForm={setSubjectForm}
                  onSubmit={handleSubjectSubmit}
                  editMode={editMode}
                  onClose={() => setSubjectDialogOpen(false)}
                />
              </Dialog>
              
                <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => openNewProgram()}
                      className="w-full bg-purple-500/10 border border-purple-400/30 text-purple-400 
                               hover:bg-purple-500/20 hover:border-purple-400/50 
                               focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400/60
                               rounded-xl transition-all duration-200 backdrop-blur-sm h-11 text-sm font-medium"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Add Program
                    </Button>
                  </DialogTrigger>
                  <ProgramDialog 
                    form={programForm}
                    setForm={setProgramForm}
                    onSubmit={handleProgramSubmit}
                    editMode={editMode}
                    subjects={subjects}
                    onClose={() => setProgramDialogOpen(false)}
                  />
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Delete Subject Section */}
          {subjects.length > 0 && (
            <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-3xl mb-4 lg:mb-8 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5"></div>
              <CardContent className="relative p-3 sm:p-4 lg:p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2">
                    <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </div>
                    <h3 className="text-sm font-medium text-white/90">Delete Subject</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select 
                      value=""
                      onValueChange={(value) => {
                        const subject = subjects.find(s => s.id === value)
                        if (subject) {
                          setSelectedSubject(subject)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white/[0.03] border-2 border-white/20 rounded-xl text-white 
                                             hover:bg-white/[0.05] hover:border-white/30
                                             focus:border-red-400/80 focus:ring-4 focus:ring-red-400/20 
                                             transition-all duration-300 ease-in-out
                                             focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/20
                                             h-11">
                        <SelectValue placeholder="Select a subject to delete" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border border-white/20 rounded-xl z-[999999]">
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id} className="hover:bg-white/10 text-white cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: subject.color }}
                              />
                              <span>{subject.name}</span>
                              <span className="text-slate-400 text-xs ml-1">
                                ({subject.programs.length} programs)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          disabled={!selectedSubject}
                          className="w-full bg-red-500/10 border border-red-400/30 text-red-400 
                                   hover:bg-red-500/20 hover:border-red-400/50 
                                   focus:ring-2 focus:ring-red-400/20 focus:border-red-400/60
                                   rounded-xl transition-all duration-200 backdrop-blur-sm h-11 text-sm font-medium
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Selected Subject
                        </Button>
                      </AlertDialogTrigger>
                      {selectedSubject && (
                        <AlertDialogContent className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Subject</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              This will permanently delete "{selectedSubject.name}" and all its {selectedSubject.programs.length} programs. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-slate-700/80 text-white border-slate-600 hover:bg-slate-600">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => {
                                handleDeleteSubject(selectedSubject.id)
                                setSelectedSubject(null)
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      )}
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Subjects Grid */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-purple-900/20 rounded-2xl blur-2xl"></div>
            <Card className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <CardHeader className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-800/30 to-purple-800/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <Tags className="w-4 h-4 text-blue-400" />
                    </div>
                    <CardTitle className="text-white font-semibold text-lg">
                      Subjects & Programs ({filteredSubjects.length})
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-3">
                    {filteredSubjects.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-lg backdrop-blur-sm">
                          <Tags className="w-3 h-3 text-blue-400" />
                          <span className="text-xs font-medium text-blue-300">
                            {filteredSubjects.length} Subject{filteredSubjects.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-400/20 rounded-lg backdrop-blur-sm">
                          <BookOpen className="w-3 h-3 text-purple-400" />
                          <span className="text-xs font-medium text-purple-300">
                            {filteredSubjects.reduce((total, subject) => total + subject.programs.length, 0)} Program{filteredSubjects.reduce((total, subject) => total + subject.programs.length, 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredSubjects.map((subject) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onEdit={openEditSubject}
                      onDelete={handleDeleteSubject}
                      onAddProgram={openNewProgram}
                      onEditProgram={openEditProgram}
                      onDeleteProgram={handleDeleteProgram}
                    />
                  ))}
                </div>

                {filteredSubjects.length === 0 && (
                  <div className="text-center py-16">
                    <Tags className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {searchTerm || filterActive !== null ? "No subjects found" : "No subjects yet"}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {searchTerm || filterActive !== null 
                        ? "Try adjusting your search or filter criteria"
                        : "Create your first subject to get started"
                      }
                    </p>
                    {(!searchTerm && filterActive === null) && (
                      <Button 
                        onClick={() => {
                          resetSubjectForm()
                          setSubjectDialogOpen(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subject
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

// Subject Card Component
function SubjectCard({ 
  subject, 
  onEdit, 
  onDelete, 
  onAddProgram, 
  onEditProgram, 
  onDeleteProgram 
}: {
  subject: Subject
  onEdit: (subject: Subject) => void
  onDelete: (id: string) => void
  onAddProgram: (subjectId: string) => void
  onEditProgram: (program: Program) => void
  onDeleteProgram: (id: string) => void
}) {
  return (
    <Card className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)] rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Modern Subject Header */}
      <CardHeader className="p-6 pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="relative group/icon">
              <div 
                className="w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden backdrop-blur-xl"
                style={{ 
                  backgroundColor: subject.color,
                  boxShadow: `0 4px 20px ${subject.color}40`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent"></div>
                <Tags className="w-7 h-7 text-white relative z-10" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-white group-hover:text-blue-200 transition-colors duration-300 capitalize mb-1">
                {subject.name}
              </h3>
              <div className="flex items-center gap-3">
                <Badge 
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border backdrop-blur-sm ${
                    subject.isActive 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/20" 
                      : "bg-gray-500/10 text-gray-400 border-gray-400/20"
                  }`}
                >
                  {subject.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-400/20 rounded-full backdrop-blur-sm">
                  <BookOpen className="w-3 h-3 text-purple-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-purple-300 whitespace-nowrap">
                    {subject.programs.length} {subject.programs.length === 1 ? 'Program' : 'Programs'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(subject)}
              className="w-8 h-8 p-0 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Subject</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This will permanently delete "{subject.name}" and all its programs. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-700/80 text-white border-slate-600 hover:bg-slate-600">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(subject.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Add Program Button */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <Button
            size="sm"
            onClick={() => onAddProgram(subject.id)}
            className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-400/20 hover:border-blue-400/30 h-9 rounded-xl transition-all duration-200 font-medium backdrop-blur-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Program
          </Button>
        </div>
      </CardHeader>
        
      
      {/* Programs Section */}
      <CardContent className="p-6 pt-0">
        {subject.programs.length > 0 ? (
          <div className="space-y-3">
            {subject.programs.map((program, index) => (
              <div
                key={program.id}
                className="group/program bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-gradient-to-br hover:from-white/[0.06] hover:to-white/[0.02] hover:border-white/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] via-transparent to-blue-500/[0.02] opacity-0 group-hover/program:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                   {/* Top section with program name and action buttons */}
                   <div className="flex items-start justify-between mb-6">
                     <div className="flex items-start gap-4 flex-1 min-w-0">
                       {/* Program color strip */}
                       <div className="relative flex-shrink-0">
                         <div 
                           className="w-1 h-12 rounded-full shadow-md"
                           style={{ 
                             backgroundColor: program.color,
                             boxShadow: `0 2px 8px ${program.color}40`
                           }}
                         />
                       </div>
                       
                       {/* Program name */}
                       <div className="flex-1 min-w-0">
                         <h4 className="text-white font-bold text-xl truncate leading-tight">
                           {program.name}
                         </h4>
                       </div>
                     </div>
                     
                     {/* Action buttons */}
                     <div className="flex items-center gap-1.5 flex-shrink-0">
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={() => onEditProgram(program)}
                               className="w-8 h-8 p-0 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-400/20 hover:border-blue-400/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                               title="Edit program (including changing subject)"
                             >
                               <Edit className="w-3.5 h-3.5" />
                             </Button>
                             
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button
                                   size="sm"
                                   variant="ghost"
                                   className="w-8 h-8 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                                 >
                                   <Trash2 className="w-3.5 h-3.5" />
                                 </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl">
                                 <AlertDialogHeader>
                                   <AlertDialogTitle className="text-white">Delete Program</AlertDialogTitle>
                                   <AlertDialogDescription className="text-slate-400">
                                     This will permanently delete "{program.name}". This action cannot be undone.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel className="bg-slate-700/80 text-white border-slate-600 hover:bg-slate-600">Cancel</AlertDialogCancel>
                                   <AlertDialogAction 
                                     onClick={() => onDeleteProgram(program.id)}
                                     className="bg-red-600 hover:bg-red-700 text-white"
                                   >
                                     Delete
                                   </AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
                     </div>
                   </div>
                   
                   {/* Bottom section with date and status */}
                   <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-500/10 to-blue-500/5 px-2.5 py-1.5 rounded-lg border border-blue-400/20">
                       <Calendar className="w-3 h-3 text-blue-400 flex-shrink-0" />
                       <span className="text-blue-300 font-medium whitespace-nowrap">
                         {new Date(program.createdAt).toLocaleDateString('en-US', { 
                           month: 'short',
                           day: '2-digit',
                           year: '2-digit' 
                         })}
                       </span>
                     </div>
                     
                     <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${
                       program.isActive 
                         ? 'bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-400/20'
                         : 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 border-gray-400/20'
                     }`}>
                       <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${program.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                       <span className={`font-medium whitespace-nowrap ${program.isActive ? 'text-green-300' : 'text-gray-300'}`}>
                         {program.isActive ? 'Active' : 'Inactive'}
                       </span>
                     </div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-slate-400 opacity-60" />
            </div>
            <h4 className="text-white font-medium text-base mb-2">No Programs Yet</h4>
            <p className="text-slate-400 text-sm mb-4 max-w-xs mx-auto">
              Create your first program under this subject to get started with course organization.
            </p>
            <Button
              onClick={() => onAddProgram(subject.id)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-9 px-5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              Create First Program
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Subject Dialog Component
function SubjectDialog({ 
  form, 
  setForm, 
  onSubmit, 
  editMode, 
  onClose 
}: {
  form: any
  setForm: any
  onSubmit: (e: React.FormEvent) => void
  editMode: boolean
  onClose: () => void
}) {
  return (
    <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-y-auto [&>button]:!hidden">
      <style jsx global>{`
        .glass-input:focus {
          outline: none !important;
          border-color: rgba(59, 130, 246, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
        }
        .glass-select-trigger:focus {
          outline: none !important;
          border-color: rgba(59, 130, 246, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
        }
      `}</style>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl"></div>
      <div className="relative">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl px-6 py-4 -m-6 mb-0 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                <Tags className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  {editMode ? "Edit Subject" : "Add Subject"}
                </DialogTitle>
                <p className="text-sm text-slate-400 mt-1">
                  {editMode ? "Update subject information" : "Create a new subject with custom color"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
      
        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Tags className="w-3 h-3 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Basic Information</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  Subject Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Mathematics"
                  className="glass-input h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10"
                  required
                />
              </div>
              

            </div>

            {/* Color Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Palette className="w-3 h-3 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Color Theme</h3>
              </div>
              
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center ${
                        form.color === color ? 'border-white scale-110 shadow-lg' : 'border-white/30 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {form.color === color && (
                        <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-3 h-3 text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Settings</h3>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-white">Active Status</label>
                  <p className="text-xs text-slate-400 mt-1">Make this subject available for use</p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 -m-6 mt-0 border-t border-white/10 flex gap-3 justify-end">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose} 
            className="bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                     h-10 px-4 rounded-lg text-sm transition-all duration-200"
          >
            <X className="w-3 h-3 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={onSubmit}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                     text-white h-10 px-6 rounded-lg text-sm
                     transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <Save className="w-3 h-3 mr-2" />
            {editMode ? "Update Subject" : "Create Subject"}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

// Program Dialog Component
function ProgramDialog({ 
  form, 
  setForm, 
  onSubmit, 
  editMode, 
  subjects, 
  onClose 
}: {
  form: any
  setForm: any
  onSubmit: (e: React.FormEvent) => void
  editMode: boolean
  subjects: Subject[]
  onClose: () => void
}) {
  return (
    <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-y-auto [&>button]:!hidden">
      <style jsx global>{`
        .glass-input:focus {
          outline: none !important;
          border-color: rgba(139, 92, 246, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2) !important;
        }
        .glass-select-trigger:focus {
          outline: none !important;
          border-color: rgba(139, 92, 246, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2) !important;
        }
      `}</style>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl"></div>
      <div className="relative">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl px-6 py-4 -m-6 mb-0 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  {editMode ? "Edit Program" : "Add Program"}
                </DialogTitle>
                <p className="text-sm text-slate-400 mt-1">
                  {editMode ? "Update program information" : "Create a new program under a subject"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30 rounded-lg h-8 w-8 p-0 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Subject Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Tags className="w-3 h-3 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Subject Assignment</h3>
                {editMode && (
                  <Badge className="ml-2 px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-400/20">
                    Change Subject
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  {editMode ? "Current Subject" : "Parent Subject"}
                </label>
                
                {/* Show current subject info when editing */}
                {editMode && form.subjectId && (
                  <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span>Currently assigned to:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subjects.find(s => s.id === form.subjectId)?.color || '#666' }}
                        />
                        <span className="font-medium text-white">
                          {subjects.find(s => s.id === form.subjectId)?.name || 'Unknown Subject'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <Select 
                  value={form.subjectId} 
                  onValueChange={(value) => {
                    console.log('Select dropdown changed to:', value)
                    setForm({ ...form, subjectId: value })
                  }}
                  required
                >
                  <SelectTrigger className="glass-select-trigger h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                                         rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder={editMode ? "Select new subject" : "Select a subject"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl" style={{ zIndex: 999999 }}>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          {subject.name}
                          {!subject.isActive && (
                            <span className="text-xs text-red-400 ml-1">(inactive)</span>
                          )}
                          {editMode && subject.id === form.subjectId && (
                            <span className="text-xs text-blue-400 ml-1">(current)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                

                
                {editMode && (
                  <p className="text-xs text-slate-400 mt-1">
                    💡 You can change which subject this program belongs to. This will update all related content.
                  </p>
                )}
                

              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Program Details</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 block">
                  Program Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Program name only"
                  className="glass-input h-10 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 
                           rounded-lg text-sm transition-all duration-200 hover:bg-white/10"
                  required
                />
              </div>
              

            </div>

            {/* Color Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Palette className="w-3 h-3 text-orange-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Color Theme</h3>
              </div>
              
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center ${
                        form.color === color ? 'border-white scale-110 shadow-lg' : 'border-white/30 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {form.color === color && (
                        <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-3 h-3 text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-white/90">Settings</h3>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-white">Active Status</label>
                  <p className="text-xs text-slate-400 mt-1">Make this program available for use</p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 -m-6 mt-0 border-t border-white/10 flex gap-3 justify-end">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose} 
            className="bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                     h-10 px-4 rounded-lg text-sm transition-all duration-200"
          >
            <X className="w-3 h-3 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={onSubmit}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                     text-white h-10 px-6 rounded-lg text-sm
                     transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <Save className="w-3 h-3 mr-2" />
            {editMode ? "Update Program" : "Create Program"}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
} 