"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Calendar,
  TrendingUp,
  Zap,
  BookOpen,
  X,
  Phone,
  School,
  User,
} from "lucide-react"

interface Student {
  id: string
  name: string
  nickname?: string
  email: string
  phone?: string
  dateOfBirth?: string
  schoolName?: string
  uniqueToken?: string
  avatar: string
  level: number
  xp: number
  joinDate: string
  lastActive: string
  status: "active" | "inactive" | "suspended"
  grade: string
  subjects: string[]
  totalLessons: number
  completionRate: number
  role?: string
  timezone?: string
  userAgent?: string
  deviceFingerprint?: string
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    level: 12,
    xp: 2450,
    joinDate: "2024-01-15",
    lastActive: "2024-01-20",
    status: "active",
    grade: "A*",
    subjects: ["Mathematics", "Physics"],
    totalLessons: 45,
    completionRate: 87,
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    level: 18,
    xp: 4250,
    joinDate: "2023-12-10",
    lastActive: "2024-01-20",
    status: "active",
    grade: "A*",
    subjects: ["Mathematics", "Chemistry", "Biology"],
    totalLessons: 78,
    completionRate: 95,
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    level: 16,
    xp: 3890,
    joinDate: "2024-01-05",
    lastActive: "2024-01-19",
    status: "active",
    grade: "A",
    subjects: ["Chemistry", "Biology"],
    totalLessons: 62,
    completionRate: 92,
  },
  {
    id: "4",
    name: "Michael Kim",
    email: "michael@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    level: 14,
    xp: 3200,
    joinDate: "2023-11-20",
    lastActive: "2024-01-18",
    status: "inactive",
    grade: "B+",
    subjects: ["Mathematics", "Physics"],
    totalLessons: 38,
    completionRate: 78,
  },
]

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Fetch dynamic data from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/students')
        const data = await response.json()
        
        if (data.students) {
          // Combine static mock data with dynamic data
          const combinedStudents = [
            ...mockStudents, // Keep existing static data
            ...data.students.filter((dynamicStudent: Student) => 
              !mockStudents.some(mockStudent => mockStudent.email === dynamicStudent.email)
            ) // Add new dynamic students that don't exist in mock data
          ]
          setStudents(combinedStudents)
        } else {
          // Fallback to mock data if API fails
          setStudents(mockStudents)
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        // Fallback to mock data on error
        setStudents(mockStudents)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400"
      case "inactive":
        return "bg-yellow-500/20 text-yellow-400"
      case "suspended":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const totalStudents = students.length
  const activeStudents = students.filter((s) => s.status === "active").length
  const avgCompletion = Math.round(students.reduce((acc, s) => acc + s.completionRate, 0) / students.length)

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
          <div className="mb-4 lg:mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-3 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-5 h-5 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="text-xs lg:text-sm text-purple-300 font-medium tracking-wider uppercase">Admin Panel</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2 tracking-tight">
              Student Management
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl mx-auto leading-relaxed px-2">
              Manage and monitor student accounts and progress
            </p>
            <div className="mt-3 h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto animate-pulse"></div>
          </div>

          {/* Enhanced Stats with Mobile Optimization */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-6 mb-4 lg:mb-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <Card className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-2 sm:p-3 lg:p-6 hover:bg-white/[0.05] transition-all duration-300 hover:scale-105 hover:border-blue-400/30">
                <div className="text-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg mx-auto mb-1 sm:mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-blue-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mb-1">Total</p>
                  <p className="text-lg sm:text-xl lg:text-3xl font-bold text-white">{totalStudents}</p>
                  <div className="text-xs text-blue-400 mt-1 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                    Students
                  </div>
                </div>
              </Card>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <Card className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-2 sm:p-3 lg:p-6 hover:bg-white/[0.05] transition-all duration-300 hover:scale-105 hover:border-green-400/30">
                <div className="text-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg mx-auto mb-1 sm:mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mb-1">Active</p>
                  <p className="text-lg sm:text-xl lg:text-3xl font-bold text-white">{activeStudents}</p>
                  <div className="text-xs text-green-400 mt-1 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                    Learning
                  </div>
                </div>
              </Card>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <Card className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-2 sm:p-3 lg:p-6 hover:bg-white/[0.05] transition-all duration-300 hover:scale-105 hover:border-purple-400/30">
                <div className="text-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg mx-auto mb-1 sm:mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-purple-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mb-1">Avg Rate</p>
                  <p className="text-lg sm:text-xl lg:text-3xl font-bold text-white">{avgCompletion}%</p>
                  <div className="text-xs text-purple-400 mt-1 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                    Progress
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Mobile-Optimized Search and Controls */}
          <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl lg:rounded-2xl mb-3 lg:mb-6 overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>
            <CardContent className="relative p-3 sm:p-4 lg:p-6">
              {/* Mobile-First Search Bar */}
              <div className="mb-3 lg:mb-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-hover:text-purple-400 transition-colors duration-200 z-10" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 py-3 bg-white/[0.03] border-2 border-white/20 rounded-xl text-white placeholder:text-slate-400 
                             focus:border-purple-400/80 focus:ring-2 focus:ring-purple-400/20 focus:bg-white/[0.08]
                             hover:bg-white/[0.05] hover:border-white/30
                             transition-all duration-300 ease-in-out
                             text-sm w-full h-12"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white 
                               hover:bg-white/10 rounded-lg p-1 transition-all duration-200 z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile-Optimized Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button 
                  className="h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                           text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300
                           text-sm font-medium rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
                <Button 
                  variant="outline" 
                  className="h-11 bg-white/[0.03] border-2 border-white/20 text-white hover:bg-white/[0.08] hover:border-white/30 
                           transition-all duration-300 text-sm font-medium rounded-xl"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-Optimized Students List */}
          <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl lg:rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>
            <CardHeader className="relative border-b border-white/10 pb-3 lg:pb-4">
              <CardTitle className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Students ({filteredStudents.length})
                {loading && <span className="text-xs text-muted-foreground ml-2">(Loading...)</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative p-0">
              {/* Mobile Card Layout for Small Screens */}
              <div className="block sm:hidden">
                <div className="space-y-2 p-3">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-3 hover:bg-white/[0.05] transition-all duration-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-white text-sm truncate">{student.name}</h3>
                              <p className="text-xs text-gray-400 truncate">{student.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-purple-400 text-purple-400 bg-purple-500/10 text-xs">
                              Level {student.level}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                student.grade.includes("A")
                                  ? "border-green-500 text-green-400 bg-green-500/10"
                                  : student.grade.includes("B")
                                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                                    : "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                              }`}
                            >
                              {student.grade}
                            </Badge>
                            <Badge className={`${getStatusColor(student.status)} border-0 text-xs`}>
                              {student.status}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400">Progress:</span>
                            <span className="text-white font-medium">{student.completionRate}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${student.completionRate}%` }}
                            />
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-purple-400" />
                              {student.xp} XP
                            </span>
                            <span>•</span>
                            <span>{student.totalLessons} lessons</span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10 ml-2">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl">
                            <DropdownMenuItem onClick={() => setSelectedStudent(student)} className="hover:bg-white/10">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/10">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/10">
                              <Mail className="w-4 h-4 mr-2" />
                              Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Layout for Larger Screens */}
              <div className="hidden sm:block overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-white/[0.02]">
                      <TableHead className="text-slate-300 font-semibold">Student</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Level & Grade</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Progress</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200">
                        <TableCell className="min-w-0 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-semibold text-white text-sm truncate">
                                  {student.name}
                                </p>
                                {student.nickname && (
                                  <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                                    {student.nickname}
                                  </span>
                                )}
                                {!mockStudents.some(mock => mock.email === student.email) && (
                                  <Badge variant="outline" className="text-xs border-blue-400 text-blue-400 bg-blue-500/10 flex-shrink-0">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs text-gray-400 truncate">{student.email}</p>
                                {student.schoolName && (
                                  <p className="text-xs text-blue-400 truncate flex items-center gap-1">
                                    <School className="w-3 h-3" />
                                    {student.schoolName}
                                  </p>
                                )}
                                {student.phone && (
                                  <p className="text-xs text-green-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {student.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="border-purple-400 text-purple-400 bg-purple-500/10">
                                Level {student.level}
                              </Badge>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Zap className="w-3 h-3 mr-1 text-purple-400" />
                                {student.xp}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                student.grade.includes("A")
                                  ? "border-green-500 text-green-400 bg-green-500/10"
                                  : student.grade.includes("B")
                                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                                    : "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                              }
                            >
                              {student.grade}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white font-medium">{student.completionRate}%</span>
                              <span className="text-muted-foreground text-xs">{student.totalLessons} lessons</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${student.completionRate}%` }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {student.subjects.slice(0, 2).map((subject) => (
                                <Badge key={subject} variant="secondary" className="text-xs bg-white/10 text-slate-300">
                                  {subject}
                                </Badge>
                              ))}
                              {student.subjects.length > 2 && (
                                <Badge variant="secondary" className="text-xs bg-white/10 text-slate-300">
                                  +{student.subjects.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            <Badge className={`${getStatusColor(student.status)} border-0`}>{student.status}</Badge>
                            <div className="text-xs text-muted-foreground">
                              {new Date(student.lastActive).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl">
                              <DropdownMenuItem onClick={() => setSelectedStudent(student)} className="hover:bg-white/10">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-white/10">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-white/10">
                                <Mail className="w-4 h-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl sm:max-w-4xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto mx-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10 rounded-2xl sm:rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="pb-4 sm:pb-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-white">Student Details</DialogTitle>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Complete student information and progress</p>
                </div>
              </div>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">{selectedStudent.name}</h3>
                    <p className="text-sm sm:text-base text-slate-400">{selectedStudent.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="border-purple-400 text-purple-400 bg-purple-500/10 text-xs">Level {selectedStudent.level}</Badge>
                      <Badge className={`${getStatusColor(selectedStudent.status)} border-0 text-xs`}>{selectedStudent.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-slate-300">
                          <Mail className="w-4 h-4 mr-2 text-blue-400" />
                          <span className="truncate">{selectedStudent.email}</span>
                        </div>
                        {selectedStudent.phone && (
                          <div className="flex items-center text-slate-300">
                            <Phone className="w-4 h-4 mr-2 text-green-400" />
                            <span>{selectedStudent.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center text-slate-300">
                          <Calendar className="w-4 h-4 mr-2 text-green-400" />
                          Joined {new Date(selectedStudent.joinDate).toLocaleDateString()}
                        </div>
                        {selectedStudent.dateOfBirth && (
                          <div className="text-slate-300">DOB: {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                    {selectedStudent.schoolName && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">School</h3>
                        <p className="text-sm text-slate-300 flex items-center gap-2">
                          <School className="w-4 h-4 text-blue-400" />
                          {selectedStudent.schoolName}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Academic Progress</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Grade:</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              selectedStudent.grade.includes("A")
                                ? "border-green-500 text-green-400 bg-green-500/10"
                                : selectedStudent.grade.includes("B")
                                  ? "border-blue-500 text-blue-400 bg-blue-500/10"
                                  : "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                            }`}
                          >
                            {selectedStudent.grade}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Total XP:</span>
                          <span className="flex items-center">
                            <Zap className="w-3 h-3 mr-1 text-purple-400" />
                            {selectedStudent.xp}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Completion Rate:</span>
                          <span>{selectedStudent.completionRate}%</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Total Lessons:</span>
                          <span>{selectedStudent.totalLessons}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedStudent.uniqueToken && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Access Information</p>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium text-green-400">Unique Token:</span>
                        <span className="ml-2 font-mono text-green-300 text-xs break-all">{selectedStudent.uniqueToken}</span>
                      </div>
                      {selectedStudent.timezone && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Timezone: {selectedStudent.timezone}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Enrolled Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="bg-white/10 text-slate-300 text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  <Button variant="outline" onClick={() => setSelectedStudent(null)} className="border-white/20 text-white hover:bg-white/10 text-sm">
                    Close
                  </Button>
                  <Button variant="outline" className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 text-sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" className="border-green-500/20 text-green-400 hover:bg-green-500/10 text-sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Progress
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
