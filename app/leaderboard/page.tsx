"use client"

import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Crown, Zap, TrendingUp, Users, Target, Calendar, Award } from "lucide-react"

// Mock data
const leaderboardStats = [
  {
    id: "rank",
    title: "Your Rank",
    value: "#12",
    icon: <Trophy className="w-6 h-6" />,
    color: "orange" as const,
    trend: { value: 3, isPositive: true },
  },
  {
    id: "xp",
    title: "Total XP",
    value: "2,450",
    icon: <Zap className="w-6 h-6" />,
    color: "purple" as const,
    trend: { value: 15.2, isPositive: true },
  },
  {
    id: "streak",
    title: "Best Streak",
    value: "12 days",
    icon: <Calendar className="w-6 h-6" />,
    color: "green" as const,
    trend: { value: 8.3, isPositive: true },
  },
  {
    id: "accuracy",
    title: "Avg Accuracy",
    value: "87%",
    icon: <Target className="w-6 h-6" />,
    color: "blue" as const,
    trend: { value: 4.1, isPositive: true },
  },
]

const globalLeaderboard = [
  {
    rank: 1,
    name: "Sarah Chen",
    xp: 4250,
    level: 18,
    streak: 15,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Math Genius",
  },
  {
    rank: 2,
    name: "Michael Kim",
    xp: 3890,
    level: 16,
    streak: 12,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Physics Pro",
  },
  {
    rank: 3,
    name: "Emma Rodriguez",
    xp: 3654,
    level: 15,
    streak: 10,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Chemistry Star",
  },
  {
    rank: 4,
    name: "David Wilson",
    xp: 3421,
    level: 14,
    streak: 8,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Bio Expert",
  },
  {
    rank: 5,
    name: "Lisa Zhang",
    xp: 3198,
    level: 13,
    streak: 9,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "All-Rounder",
  },
]

const weeklyToppers = [
  { name: "Alex Johnson", xp: 450, change: "+2" },
  { name: "Sarah Chen", xp: 420, change: "-1" },
  { name: "Michael Kim", xp: 380, change: "+1" },
]

const achievements = [
  { title: "Top 10 Global", description: "Reached top 10 in global rankings", rarity: "Legendary" },
  { title: "Math Master", description: "Completed all math modules", rarity: "Epic" },
  { title: "Speed Demon", description: "Fastest lesson completion", rarity: "Rare" },
  { title: "Consistent Learner", description: "30-day study streak", rarity: "Common" },
]

const rarityColors = {
  Legendary: "border-yellow-500 text-yellow-400 bg-yellow-500/10",
  Epic: "border-purple-500 text-purple-400 bg-purple-500/10",
  Rare: "border-blue-500 text-blue-400 bg-blue-500/10",
  Common: "border-gray-500 text-gray-400 bg-gray-500/10",
}

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("all-time")
  const [selectedSubject, setSelectedSubject] = useState("all")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />

      <main className="lg:ml-72 min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="Leaderboard"
            description="Compete with students worldwide and track your progress"
            actions={
              <div className="flex gap-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32 glass-card border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-32 glass-card border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />

          {/* Stats Grid */}
          <div className="mb-8">
            <StatsGrid stats={leaderboardStats} columns={4} animated />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Global Leaderboard */}
            <div className="lg:col-span-2">
              <AnimatedCard delay={200}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Global Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {globalLeaderboard.map((user, index) => (
                    <div
                      key={user.rank}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 flex items-center justify-center">{getRankIcon(user.rank)}</div>
                        <Avatar className="h-10 w-10 ring-2 ring-white/20">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-white">{user.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {user.badge}
                            </Badge>
                            <span>Level {user.level}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="font-medium text-white">{user.xp.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{user.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </AnimatedCard>
            </div>

            {/* Weekly Toppers & Achievements */}
            <div className="space-y-6">
              {/* Weekly Toppers */}
              <AnimatedCard delay={300}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                    Weekly Toppers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weeklyToppers.map((user, index) => (
                    <div
                      key={user.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                      style={{ animationDelay: `${(index + 4) * 100}ms` }}
                    >
                      <div>
                        <p className="font-medium text-white text-sm">{user.name}</p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3 text-purple-400" />
                          <span>{user.xp} XP</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          user.change.startsWith("+")
                            ? "border-green-500 text-green-400"
                            : "border-red-500 text-red-400"
                        }
                      >
                        {user.change}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </AnimatedCard>

              {/* Recent Achievements */}
              <AnimatedCard delay={400}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Award className="w-5 h-5 mr-2 text-purple-400" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={achievement.title}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      style={{ animationDelay: `${(index + 5) * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm">{achievement.title}</h4>
                        <Badge className={rarityColors[achievement.rarity as keyof typeof rarityColors]}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  ))}
                </CardContent>
              </AnimatedCard>
            </div>
          </div>

          {/* Detailed Rankings */}
          <AnimatedCard delay={500}>
            <CardHeader>
              <CardTitle className="text-white">Detailed Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="global" className="w-full">
                <TabsList className="glass-card border-white/20">
                  <TabsTrigger value="global">Global</TabsTrigger>
                  <TabsTrigger value="friends">Friends</TabsTrigger>
                  <TabsTrigger value="class">Class</TabsTrigger>
                  <TabsTrigger value="school">School</TabsTrigger>
                </TabsList>
                <TabsContent value="global" className="mt-6">
                  <div className="space-y-3">
                    {[...globalLeaderboard, ...Array(10)].slice(0, 15).map((user, index) => {
                      if (!user.name) {
                        return (
                          <div
                            key={`placeholder-${index}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 opacity-50"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-muted-foreground">#{index + 6}</span>
                              <div className="w-8 h-8 rounded-full bg-white/10"></div>
                              <span className="text-sm text-muted-foreground">Loading...</span>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div
                          key={user.rank}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-muted-foreground w-8">#{user.rank}</span>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-white">{user.name}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Level {user.level}</span>
                            <div className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-purple-400" />
                              <span>{user.xp.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
                <TabsContent value="friends" className="mt-6">
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">Connect with friends to see their rankings</p>
                    <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 button-hover">
                      Add Friends
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="class" className="mt-6">
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">Class rankings will appear here</p>
                  </div>
                </TabsContent>
                <TabsContent value="school" className="mt-6">
                  <div className="text-center py-8">
                    <Medal className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">School rankings will appear here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </AnimatedCard>
        </ResponsiveContainer>
      </main>
    </div>
  )
}
