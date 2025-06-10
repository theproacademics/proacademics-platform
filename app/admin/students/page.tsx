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
    <div className="p-4 lg:p-8 lg:pt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Student Management</h1>
        <p className="text-muted-foreground">Manage and monitor student accounts and progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-green-400">{activeStudents}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold text-purple-400">{avgCompletion}%</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-400" />
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
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-white/20"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <Card className="glass-card futuristic-border">
        <CardHeader>
          <CardTitle>
            Students ({filteredStudents.length})
            {loading && <span className="text-sm text-muted-foreground ml-2">(Loading...)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="min-w-0">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white/10 flex-shrink-0">
                        <AvatarImage src={student.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
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
                            <p className="text-xs text-blue-400 truncate">🏫 {student.schoolName}</p>
                          )}
                          {student.phone && (
                            <p className="text-xs text-green-400">📞 {student.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-purple-400 text-purple-400">
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
                            ? "border-green-500 text-green-400"
                            : student.grade.includes("B")
                              ? "border-blue-500 text-blue-400"
                              : "border-yellow-500 text-yellow-400"
                        }
                      >
                        {student.grade}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">{student.completionRate}%</span>
                        <span className="text-muted-foreground text-xs">{student.totalLessons} lessons</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${student.completionRate}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {student.subjects.slice(0, 2).map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {student.subjects.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{student.subjects.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(student.lastActive).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">
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
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl glass-card">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {selectedStudent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                  <p className="text-muted-foreground">{selectedStudent.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline">Level {selectedStudent.level}</Badge>
                    <Badge className={getStatusColor(selectedStudent.status)}>{selectedStudent.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Contact Information</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {selectedStudent.email}
                    </div>
                    {selectedStudent.phone && (
                      <div className="flex items-center">
                        📱 <span className="ml-2">{selectedStudent.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {new Date(selectedStudent.joinDate).toLocaleDateString()}
                    </div>
                    {selectedStudent.dateOfBirth && (
                      <div>DOB: {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Academic Progress</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Current Grade: {selectedStudent.grade}</div>
                    <div>Total XP: {selectedStudent.xp}</div>
                    <div>Completion Rate: {selectedStudent.completionRate}%</div>
                    {selectedStudent.schoolName && (
                      <div>School: {selectedStudent.schoolName}</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedStudent.uniqueToken && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Access Information</p>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium text-green-400">Unique Token:</span>
                      <span className="ml-2 font-mono text-green-300">{selectedStudent.uniqueToken}</span>
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
                <p className="text-sm font-medium mb-2">Enrolled Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Student
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Progress
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
