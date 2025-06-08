"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Brain,
  TrendingUp,
  Save,
  Camera,
  Edit3,
  Award,
  Clock,
  Zap,
  Trophy,
  Star,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="lg:ml-72 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </main>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = {
    id: (session.user as any).id || "unknown",
    name: session.user.name || "User",
    email: session.user.email || "user@example.com",
    role: (session.user as any).role || "student",
    userData: (session.user as any).userData || {},
  }

  const userStats = {
    xp: user.userData.xp || user.userData.xpTotal || 2450,
    level: user.userData.level || user.userData.currentLevel || 12,
    studyStreak: user.userData.studyStreak || 15,
    completedLessons: user.userData.completedLessons || 42,
    averageGrade: user.userData.averageGrade || 87.5,
    predictedGrade: user.userData.predictedGrade || "A*",
    joinedDate: user.userData.joinedDate || "2024-01-15",
    totalStudyTime: user.userData.totalStudyTime || 156,
  }

  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first lesson", icon: BookOpen, earned: true },
    { id: 2, title: "Study Streak", description: "Study for 7 days in a row", icon: Trophy, earned: true },
    { id: 3, title: "Quick Learner", description: "Complete 10 lessons in a week", icon: Zap, earned: true },
    { id: 4, title: "Math Master", description: "Excel in mathematics", icon: Target, earned: false },
    { id: 5, title: "Science Star", description: "Top 10% in science", icon: Star, earned: false },
    { id: 6, title: "AI Enthusiast", description: "Use Lex AI 50 times", icon: Brain, earned: true },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="My Profile"
            description="Manage your account settings and view your academic progress"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <AnimatedCard delay={100}>
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                    <CardHeader className="pb-4 relative text-center">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                      <div className="relative">
                        <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-blue-500/30 hover:ring-blue-500/50 transition-all duration-300">
                          <AvatarImage src={user.userData?.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold">
                            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">{user.name}</h3>
                        <p className="text-gray-300">{user.email}</p>
                        <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-400/50">
                          Level {userStats.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-2xl font-bold text-white">{userStats.xp.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Total XP</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-2xl font-bold text-white">{userStats.studyStreak}</div>
                          <div className="text-xs text-gray-400">Day Streak</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Joined</span>
                          <span className="text-white">{new Date(userStats.joinedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Role</span>
                          <span className="text-white capitalize">{user.role}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Predicted Grade</span>
                          <span className="text-white font-semibold">{userStats.predictedGrade}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </AnimatedCard>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <AnimatedCard delay={200}>
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                    <Tabs defaultValue="overview" className="w-full">
                      <div className="border-b border-white/10">
                        <TabsList className="bg-transparent border-0 w-full justify-start h-auto p-0">
                          <TabsTrigger 
                            value="overview" 
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                          >
                            Overview
                          </TabsTrigger>
                          <TabsTrigger 
                            value="settings" 
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                          >
                            Settings
                          </TabsTrigger>
                          <TabsTrigger 
                            value="achievements" 
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                          >
                            Achievements
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="overview" className="mt-6 p-6 space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                            <BookOpen className="w-8 h-8 text-blue-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{userStats.completedLessons}</div>
                            <div className="text-xs text-gray-400">Lessons Complete</div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                            <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{userStats.averageGrade}%</div>
                            <div className="text-xs text-gray-400">Average Grade</div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                            <Clock className="w-8 h-8 text-purple-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{userStats.totalStudyTime}h</div>
                            <div className="text-xs text-gray-400">Study Time</div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                            <Award className="w-8 h-8 text-amber-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{achievements.filter(a => a.earned).length}</div>
                            <div className="text-xs text-gray-400">Achievements</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-white">Recent Activity</h4>
                          <div className="space-y-3">
                            {[
                              { action: "Completed lesson", subject: "Advanced Calculus", time: "2 hours ago" },
                              { action: "Earned achievement", subject: "Study Streak", time: "1 day ago" },
                              { action: "Submitted homework", subject: "Physics Lab Report", time: "2 days ago" },
                            ].map((activity, index) => (
                              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div>
                                  <div className="text-white font-medium">{activity.action}</div>
                                  <div className="text-gray-400 text-sm">{activity.subject}</div>
                                </div>
                                <div className="text-gray-400 text-sm">{activity.time}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="settings" className="mt-6 p-6 space-y-6">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold text-white">Account Settings</h4>
                          <Button
                            onClick={() => setIsEditing(!isEditing)}
                            variant="outline"
                            size="sm"
                            className="border-white/20 hover:bg-white/10"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            {isEditing ? "Cancel" : "Edit"}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name" className="text-white">Full Name</Label>
                              <Input
                                id="name"
                                defaultValue={user.name}
                                disabled={!isEditing}
                                className="mt-1 bg-white/10 border-white/20 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email" className="text-white">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                defaultValue={user.email}
                                disabled={!isEditing}
                                className="mt-1 bg-white/10 border-white/20 text-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="role" className="text-white">Role</Label>
                              <Input
                                id="role"
                                defaultValue={user.role}
                                disabled
                                className="mt-1 bg-white/5 border-white/10 text-gray-400"
                              />
                            </div>
                            <div>
                              <Label htmlFor="grade" className="text-white">Target Grade</Label>
                              <Input
                                id="grade"
                                defaultValue={userStats.predictedGrade}
                                disabled={!isEditing}
                                className="mt-1 bg-white/10 border-white/20 text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="flex justify-end space-x-3">
                            <Button
                              onClick={() => setIsEditing(false)}
                              variant="outline"
                              className="border-white/20 hover:bg-white/10"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSave}
                              disabled={isSaving}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            >
                              {isSaving ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="achievements" className="mt-6 p-6 space-y-6">
                        <h4 className="text-lg font-semibold text-white">Achievements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {achievements.map((achievement) => (
                            <div
                              key={achievement.id}
                              className={cn(
                                "p-4 rounded-xl border transition-all duration-300 relative overflow-hidden",
                                achievement.earned
                                  ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30"
                                  : "bg-white/5 border-white/10"
                              )}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  achievement.earned
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-gray-500/20 text-gray-400"
                                )}>
                                  <achievement.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <h5 className={cn(
                                    "font-semibold mb-1",
                                    achievement.earned ? "text-white" : "text-gray-400"
                                  )}>
                                    {achievement.title}
                                  </h5>
                                  <p className="text-sm text-gray-400">{achievement.description}</p>
                                  {achievement.earned && (
                                    <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                      Earned
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  )
} 