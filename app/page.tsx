import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Trophy, Target, Clock, TrendingUp, Star, Calendar, Award, Zap } from "lucide-react"
import Link from "next/link"

// Mock data for preview (in production this would come from MongoDB)
const mockStudentData = {
  name: "Alex Johnson",
  xpTotal: 2450,
  currentLevel: 13,
  studyStreak: 7,
  currentWorkingAverage: 87.5,
  predictedGrade: "A",
  recentTopics: ["Quadratic Equations", "Trigonometry", "Statistics"],
  weakTopics: ["Calculus", "Probability"],
  strongTopics: ["Algebra", "Geometry"],
  upcomingLessons: [
    { id: 1, title: "Advanced Calculus", date: "2024-01-15", time: "14:00" },
    { id: 2, title: "Statistics Review", date: "2024-01-16", time: "15:30" },
  ],
  recentHomework: [
    { id: 1, title: "Quadratic Functions", dueDate: "2024-01-14", status: "completed", score: 92 },
    { id: 2, title: "Trigonometry Practice", dueDate: "2024-01-16", status: "pending", score: null },
  ],
  badges: [
    { id: 1, name: "Week Warrior", icon: "🔥", rarity: "rare" },
    { id: 2, name: "Math Master", icon: "🧮", rarity: "epic" },
    { id: 3, name: "Streak Keeper", icon: "⚡", rarity: "common" },
  ],
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {mockStudentData.name}! 👋</h1>
          <p className="text-lg text-gray-600">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Zap className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStudentData.xpTotal.toLocaleString()}</div>
              <p className="text-xs text-blue-100">Level {mockStudentData.currentLevel}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Target className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStudentData.studyStreak} days</div>
              <p className="text-xs text-green-100">Keep it up! 🔥</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Average</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStudentData.currentWorkingAverage}%</div>
              <p className="text-xs text-purple-100">Predicted Grade: {mockStudentData.predictedGrade}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Award className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStudentData.badges.length}</div>
              <p className="text-xs text-orange-100">Latest: {mockStudentData.badges[0].name}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Jump into your learning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/lex">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Target className="h-6 w-6" />
                      <span className="text-sm">Lex AI</span>
                    </Button>
                  </Link>
                  <Link href="/homework">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      <BookOpen className="h-6 w-6" />
                      <span className="text-sm">Homework</span>
                    </Button>
                  </Link>
                  <Link href="/lessons">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">Lessons</span>
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                      <Trophy className="h-6 w-6" />
                      <span className="text-sm">Leaderboard</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Homework */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Homework
                </CardTitle>
                <CardDescription>Your latest assignments and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStudentData.recentHomework.map((hw) => (
                    <div key={hw.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{hw.title}</h4>
                        <p className="text-sm text-gray-500">Due: {hw.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {hw.status === "completed" ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Completed - {hw.score}%
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          {hw.status === "completed" ? "Review" : "Continue"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Topic Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Topic Mastery
                </CardTitle>
                <CardDescription>Your progress across different topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Strong Topics</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Mastered
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mockStudentData.strongTopics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="border-green-200 text-green-700">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Areas for Improvement</span>
                      <Badge variant="secondary">Focus Needed</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mockStudentData.weakTopics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="border-orange-200 text-orange-700">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStudentData.upcomingLessons.map((lesson) => (
                    <div key={lesson.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{lesson.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {lesson.date}
                        <Clock className="h-3 w-3" />
                        {lesson.time}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Link href="/timetable">View Full Timetable</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStudentData.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{badge.name}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            badge.rarity === "epic"
                              ? "border-purple-200 text-purple-700"
                              : badge.rarity === "rare"
                                ? "border-blue-200 text-blue-700"
                                : "border-gray-200 text-gray-700"
                          }`}
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Link href="/progress">View All Badges</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Lex AI Recommendation */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Star className="h-5 w-5" />
                  Lex AI Recommends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 mb-4">
                  Based on your recent performance, focus on <strong>Calculus</strong> to improve your predicted grade
                  to A*.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/lex/advanced">Start Lex Session</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Level Progress */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Level Progress
            </CardTitle>
            <CardDescription>
              {2450 - (mockStudentData.currentLevel - 1) * 200} / 200 XP to Level {mockStudentData.currentLevel + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={((2450 - (mockStudentData.currentLevel - 1) * 200) / 200) * 100} className="h-3" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
