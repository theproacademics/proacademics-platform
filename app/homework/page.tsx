"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, FileText, Award } from "lucide-react"

// Mock homework data
const mockHomework = [
  {
    id: 1,
    title: "Quadratic Functions Practice",
    subject: "Mathematics",
    dueDate: "2024-01-16",
    status: "pending",
    progress: 60,
    totalQuestions: 15,
    completedQuestions: 9,
    estimatedTime: 25,
    difficulty: "medium",
    xpReward: 150,
  },
  {
    id: 2,
    title: "Trigonometry Review",
    subject: "Mathematics",
    dueDate: "2024-01-18",
    status: "not_started",
    progress: 0,
    totalQuestions: 20,
    completedQuestions: 0,
    estimatedTime: 35,
    difficulty: "hard",
    xpReward: 200,
  },
  {
    id: 3,
    title: "Statistics Analysis",
    subject: "Mathematics",
    dueDate: "2024-01-14",
    status: "completed",
    progress: 100,
    totalQuestions: 12,
    completedQuestions: 12,
    score: 92,
    timeTaken: 28,
    xpEarned: 180,
  },
  {
    id: 4,
    title: "Algebra Fundamentals",
    subject: "Mathematics",
    dueDate: "2024-01-12",
    status: "overdue",
    progress: 40,
    totalQuestions: 18,
    completedQuestions: 7,
    estimatedTime: 30,
    difficulty: "easy",
    xpReward: 120,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "hard":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function HomeworkPage() {
  const [selectedTab, setSelectedTab] = useState("all")

  const filterHomework = (status?: string) => {
    if (!status || status === "all") return mockHomework
    return mockHomework.filter((hw) => hw.status === status)
  }

  const stats = {
    total: mockHomework.length,
    completed: mockHomework.filter((hw) => hw.status === "completed").length,
    pending: mockHomework.filter((hw) => hw.status === "pending").length,
    overdue: mockHomework.filter((hw) => hw.status === "overdue").length,
    avgScore:
      mockHomework.filter((hw) => hw.status === "completed").reduce((sum, hw) => sum + (hw.score || 0), 0) /
        mockHomework.filter((hw) => hw.status === "completed").length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BookOpen className="h-10 w-10 text-blue-600" />
              Homework Dashboard
            </h1>
            <p className="text-lg text-gray-600">Track your assignments and stay on top of your studies</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                <FileText className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-blue-100">All time assignments</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-green-100">Avg Score: {Math.round(stats.avgScore)}%</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-orange-100">Need attention</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overdue}</div>
                <p className="text-xs text-red-100">Requires immediate action</p>
              </CardContent>
            </Card>
          </div>

          {/* Homework List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Assignments
              </CardTitle>
              <CardDescription>Manage and track your homework progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                  <TabsTrigger value="not_started">Not Started</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="mt-6">
                  <div className="space-y-4">
                    {filterHomework(selectedTab === "all" ? undefined : selectedTab).map((homework) => (
                      <Card key={homework.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{homework.title}</h3>
                                <Badge className={getStatusColor(homework.status)}>
                                  {homework.status.replace("_", " ")}
                                </Badge>
                                <Badge variant="outline" className={getDifficultyColor(homework.difficulty)}>
                                  {homework.difficulty}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Due: {homework.dueDate}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {homework.status === "completed"
                                    ? `Completed in ${homework.timeTaken}min`
                                    : `Est. ${homework.estimatedTime}min`}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Award className="h-4 w-4" />
                                  {homework.status === "completed"
                                    ? `${homework.xpEarned} XP earned`
                                    : `${homework.xpReward} XP reward`}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>
                                      {homework.completedQuestions}/{homework.totalQuestions} questions
                                    </span>
                                  </div>
                                  <Progress value={homework.progress} className="h-2" />
                                </div>
                                {homework.status === "completed" && homework.score && (
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{homework.score}%</div>
                                    <div className="text-xs text-gray-500">Score</div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="ml-6">
                              <Button
                                className={
                                  homework.status === "completed"
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : homework.status === "overdue"
                                      ? "bg-red-600 hover:bg-red-700"
                                      : "bg-blue-600 hover:bg-blue-700"
                                }
                              >
                                {homework.status === "completed"
                                  ? "Review"
                                  : homework.status === "not_started"
                                    ? "Start"
                                    : "Continue"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <TrendingUp className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-800">Average Score</span>
                    <span className="font-medium text-blue-900">{Math.round(stats.avgScore)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-800">Completion Rate</span>
                    <span className="font-medium text-blue-900">
                      {Math.round((stats.completed / stats.total) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-800">On-time Submissions</span>
                    <span className="font-medium text-blue-900">
                      {Math.round(((stats.total - stats.overdue) / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Award className="h-5 w-5" />
                  XP Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800">XP Earned</span>
                    <span className="font-medium text-green-900">
                      {mockHomework
                        .filter((hw) => hw.status === "completed")
                        .reduce((sum, hw) => sum + (hw.xpEarned || 0), 0)}{" "}
                      XP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800">Potential XP</span>
                    <span className="font-medium text-green-900">
                      {mockHomework.filter((hw) => hw.status !== "completed").reduce((sum, hw) => sum + hw.xpReward, 0)}{" "}
                      XP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800">Total Available</span>
                    <span className="font-medium text-green-900">
                      {mockHomework.reduce((sum, hw) => sum + (hw.xpEarned || hw.xpReward), 0)} XP
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
