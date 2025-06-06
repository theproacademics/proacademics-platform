"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Play, Clock, Star, Search, Zap, Users, Calendar, Filter } from "lucide-react"

// Mock data
const mockLessons = [
  {
    id: "1",
    title: "Introduction to Quadratic Equations",
    subject: "Mathematics",
    module: "Algebra",
    topic: "Quadratic Equations",
    duration: "45 min",
    difficulty: "Intermediate" as const,
    xp: 50,
    thumbnail: "/placeholder.svg?height=200&width=300",
    instructor: "Dr. Sarah Chen",
    rating: 4.8,
    students: 1247,
    isLive: false,
    description: "Master the fundamentals of quadratic equations with step-by-step examples and practice problems.",
  },
  {
    id: "2",
    title: "Calculus: Limits and Continuity",
    subject: "Mathematics",
    module: "Calculus",
    topic: "Limits",
    duration: "60 min",
    difficulty: "Advanced" as const,
    xp: 75,
    thumbnail: "/placeholder.svg?height=200&width=300",
    instructor: "Prof. Michael Rodriguez",
    rating: 4.9,
    students: 892,
    isLive: true,
    liveDate: "Today 3:00 PM",
    description: "Explore the concept of limits and continuity in calculus with real-world applications.",
  },
  {
    id: "3",
    title: "Physics: Wave Motion Fundamentals",
    subject: "Physics",
    module: "Waves",
    topic: "Wave Properties",
    duration: "50 min",
    difficulty: "Intermediate" as const,
    xp: 60,
    thumbnail: "/placeholder.svg?height=200&width=300",
    instructor: "Dr. Emily Watson",
    rating: 4.7,
    students: 634,
    isLive: false,
    description: "Understanding wave properties, frequency, amplitude, and wave equations.",
  },
]

const difficultyColors = {
  Beginner: "border-green-500 text-green-400",
  Intermediate: "border-yellow-500 text-yellow-400",
  Advanced: "border-red-500 text-red-400",
}

export default function LessonsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")

  const subjects = ["all", "Mathematics", "Physics", "Chemistry", "Biology"]
  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]

  const filteredLessons = mockLessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.topic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || lesson.subject === selectedSubject
    const matchesDifficulty = selectedDifficulty === "all" || lesson.difficulty === selectedDifficulty

    return matchesSearch && matchesSubject && matchesDifficulty
  })

  const stats = [
    {
      id: "total",
      title: "Total Lessons",
      value: mockLessons.length,
      icon: <BookOpen className="w-6 h-6" />,
      color: "blue" as const,
    },
    {
      id: "live",
      title: "Live Today",
      value: mockLessons.filter((l) => l.isLive).length,
      icon: <Calendar className="w-6 h-6" />,
      color: "green" as const,
    },
    {
      id: "xp",
      title: "Avg XP",
      value: Math.round(mockLessons.reduce((acc, l) => acc + l.xp, 0) / mockLessons.length),
      icon: <Zap className="w-6 h-6" />,
      color: "purple" as const,
    },
    {
      id: "students",
      title: "Students",
      value: mockLessons.reduce((acc, l) => acc + l.students, 0).toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: "orange" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />

      <main className="lg:ml-72 min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="Lessons Library"
            description="Explore our comprehensive collection of expert-led lessons"
            actions={
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 button-hover">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            }
          />

          {/* Stats Grid */}
          <div className="mb-8">
            <StatsGrid stats={stats} columns={4} animated />
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search lessons, topics, or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-card border-white/20 focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-40 glass-card border-white/20">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject === "all" ? "All Subjects" : subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-40 glass-card border-white/20">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty === "all" ? "All Levels" : difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLessons.map((lesson, index) => (
              <AnimatedCard key={lesson.id} hover delay={index * 100} className="group overflow-hidden">
                <div className="relative">
                  <img
                    src={lesson.thumbnail || "/placeholder.svg"}
                    alt={lesson.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  {lesson.isLive && (
                    <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                      LIVE
                    </Badge>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm">
                      <Zap className="w-3 h-3 mr-1" />
                      {lesson.xp} XP
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-t-xl">
                    <Button size="lg" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 button-hover">
                      <Play className="w-5 h-5 mr-2" />
                      {lesson.isLive ? "Join Live" : "Watch Now"}
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{lesson.subject}</Badge>
                    <Badge variant="outline" className={difficultyColors[lesson.difficulty]}>
                      {lesson.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {lesson.duration}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        {lesson.rating}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {lesson.students.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div>
                      <p className="text-xs text-muted-foreground">Instructor</p>
                      <p className="text-sm font-medium text-white">{lesson.instructor}</p>
                    </div>
                    {lesson.isLive && lesson.liveDate && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Live</p>
                        <p className="text-sm font-medium text-red-400">{lesson.liveDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>

          {filteredLessons.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2 text-white">No lessons found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </ResponsiveContainer>
      </main>
    </div>
  )
}
