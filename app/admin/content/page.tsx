"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Play, Users, Clock, Star, Upload } from "lucide-react"

interface Lesson {
  id: string
  title: string
  subject: string
  module: string
  instructor: string
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  status: "published" | "draft" | "archived"
  enrollments: number
  rating: number
  createdAt: string
  lastUpdated: string
}

const mockLessons: Lesson[] = [
  {
    id: "1",
    title: "Introduction to Quadratic Equations",
    subject: "Mathematics",
    module: "Algebra",
    instructor: "Dr. Sarah Chen",
    duration: "45 min",
    difficulty: "Intermediate",
    status: "published",
    enrollments: 1247,
    rating: 4.8,
    createdAt: "2024-01-10",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    title: "Calculus: Limits and Continuity",
    subject: "Mathematics",
    module: "Calculus",
    instructor: "Prof. Michael Rodriguez",
    duration: "60 min",
    difficulty: "Advanced",
    status: "published",
    enrollments: 892,
    rating: 4.9,
    createdAt: "2024-01-08",
    lastUpdated: "2024-01-12",
  },
  {
    id: "3",
    title: "Physics: Wave Motion Fundamentals",
    subject: "Physics",
    module: "Waves",
    instructor: "Dr. Emily Watson",
    duration: "50 min",
    difficulty: "Intermediate",
    status: "draft",
    enrollments: 0,
    rating: 0,
    createdAt: "2024-01-18",
    lastUpdated: "2024-01-19",
  },
]

export default function ContentPage() {
  const [lessons, setLessons] = useState(mockLessons)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || lesson.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400"
      case "draft":
        return "bg-yellow-500/20 text-yellow-400"
      case "archived":
        return "bg-gray-500/20 text-gray-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "border-green-500 text-green-400"
      case "Intermediate":
        return "border-yellow-500 text-yellow-400"
      case "Advanced":
        return "border-red-500 text-red-400"
      default:
        return "border-gray-500 text-gray-400"
    }
  }

  const totalLessons = lessons.length
  const publishedLessons = lessons.filter((l) => l.status === "published").length
  const totalEnrollments = lessons.reduce((acc, l) => acc + l.enrollments, 0)

  return (
    <div className="p-4 lg:p-8 lg:pt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Content Management</h1>
        <p className="text-muted-foreground">Manage lessons, courses, and educational content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-2xl font-bold">{totalLessons}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-green-400">{publishedLessons}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
                <p className="text-2xl font-bold text-purple-400">{totalEnrollments.toLocaleString()}</p>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-white/20"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-40 glass-card border-white/20">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl glass-card">
              <DialogHeader>
                <DialogTitle>Create New Lesson</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input placeholder="Lesson title" className="glass-card border-white/20" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Select>
                      <SelectTrigger className="glass-card border-white/20">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Module</label>
                    <Input placeholder="Module name" className="glass-card border-white/20" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <Select>
                      <SelectTrigger className="glass-card border-white/20">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea placeholder="Lesson description" className="glass-card border-white/20" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Video Upload</label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag and drop video file or click to browse</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600">Create Lesson</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lessons Table */}
      <Card className="glass-card futuristic-border">
        <CardHeader>
          <CardTitle>Lessons ({filteredLessons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration}</span>
                        <span>•</span>
                        <span>{lesson.module}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lesson.subject}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{lesson.instructor}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getDifficultyColor(lesson.difficulty)}>
                      {lesson.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lesson.status)}>{lesson.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{lesson.enrollments.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lesson.rating > 0 ? (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-sm">{lesson.rating}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No ratings</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
