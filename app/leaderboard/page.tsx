"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Crown, Zap, TrendingUp, Users, Target, Calendar, Award, Star, Flame, Rocket, Settings, Filter, ChevronUp, ChevronDown } from "lucide-react"

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-purple-900/40"></div>
      
      {/* Large floating orbs with movement */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-float-slow opacity-60"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-bl from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-slow-reverse opacity-60" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-40 left-1/4 w-72 h-72 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-float-slow opacity-60" style={{ animationDelay: '4s' }}></div>
      
      {/* Moving particles */}
      {[...Array(70)].map((_, i) => {
        const size = Math.random() * 4 + 2;
        const colors = [
          'from-yellow-400/60 to-orange-400/60',
          'from-purple-400/60 to-pink-400/60',
          'from-emerald-400/60 to-teal-400/60',
          'from-blue-400/60 to-cyan-400/60',
          'from-violet-400/60 to-fuchsia-400/60'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${randomColor} animate-particle-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${Math.random() * 15 + 10}s`,
              filter: `blur(${Math.random() * 1}px)`,
            }}
          />
        );
      })}
      
      {/* Shooting stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: '3s'
          }}
        />
      ))}
    </div>
  )
}

// Mock data
const leaderboardStats = [
  {
    id: "rank",
    title: "Your Rank",
    value: "#12",
    icon: Trophy,
    color: "orange" as const,
    trend: { value: 3, isPositive: true },
  },
  {
    id: "xp",
    title: "Total XP",
    value: "2,450",
    icon: Zap,
    color: "purple" as const,
    trend: { value: 15.2, isPositive: true },
  },
  {
    id: "streak",
    title: "Best Streak",
    value: "12 days",
    icon: Calendar,
    color: "green" as const,
    trend: { value: 8.3, isPositive: true },
  },
  {
    id: "accuracy",
    title: "Avg Accuracy",
    value: "87%",
    icon: Target,
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
    change: "+1",
  },
  {
    rank: 2,
    name: "Michael Kim",
    xp: 3890,
    level: 16,
    streak: 12,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Physics Pro",
    change: "-1",
  },
  {
    rank: 3,
    name: "Emma Rodriguez",
    xp: 3654,
    level: 15,
    streak: 10,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Chemistry Star",
    change: "+2",
  },
  {
    rank: 4,
    name: "David Wilson",
    xp: 3421,
    level: 14,
    streak: 8,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Bio Expert",
    change: "0",
  },
  {
    rank: 5,
    name: "Lisa Zhang",
    xp: 3198,
    level: 13,
    streak: 9,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "All-Rounder",
    change: "+3",
  },
  {
    rank: 6,
    name: "James Thompson",
    xp: 2980,
    level: 12,
    streak: 7,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Quick Learner",
    change: "-2",
  },
  {
    rank: 7,
    name: "Maria Garcia",
    xp: 2850,
    level: 11,
    streak: 11,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Consistent",
    change: "+1",
  },
  {
    rank: 8,
    name: "Ryan O'Connor",
    xp: 2720,
    level: 11,
    streak: 6,
    avatar: "/placeholder.svg?height=40&width=40",
    badge: "Problem Solver",
    change: "+4",
  },
]

const achievements = [
  { title: "Top 15 Global", description: "Reached top 15 in global rankings", rarity: "Legendary", icon: Crown },
  { title: "Math Master", description: "Completed all math modules", rarity: "Epic", icon: Trophy },
  { title: "Speed Demon", description: "Fastest lesson completion", rarity: "Rare", icon: Rocket },
  { title: "Consistent Learner", description: "30-day study streak", rarity: "Common", icon: Flame },
]

const rarityColors = {
  Legendary: "border-yellow-500 text-yellow-400 bg-yellow-500/20",
  Epic: "border-purple-500 text-purple-400 bg-purple-500/20",
  Rare: "border-blue-500 text-blue-400 bg-blue-500/20",
  Common: "border-gray-500 text-gray-400 bg-gray-500/20",
}

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("all-time")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedTab, setSelectedTab] = useState("global")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-white">#{rank}</span>
    }
  }

  const getChangeIcon = (change: string) => {
    if (change.startsWith("+")) {
      return <ChevronUp className="w-4 h-4 text-green-400" />
    } else if (change.startsWith("-")) {
      return <ChevronDown className="w-4 h-4 text-red-400" />
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
      <AnimatedBackground />
      <Navigation />
      
      <div className="lg:ml-80 relative z-10">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl mb-6 shadow-2xl">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold text-white mb-4">
                  Global Leaderboard
                </h1>
                <p className="text-xl text-blue-100/80 mb-6">
                  Compete with students worldwide and track your progress
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2 text-blue-100">
                    <Trophy className="w-5 h-5" />
                    <span className="font-medium">Global Competition</span>
                  </div>
                  <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                  <div className="flex items-center space-x-2 text-blue-100">
                    <Target className="w-5 h-5" />
                    <span className="font-medium">Track Progress</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Filter className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Filters</span>
                </div>
                <div className="flex gap-4">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">All Time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
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
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                    <Settings className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {leaderboardStats.map((stat, index) => {
                const Icon = stat.icon;
                const cardStyles = {
                  orange: "from-orange-500/20 to-red-500/20 border-orange-300/20",
                  purple: "from-purple-500/20 to-pink-500/20 border-purple-300/20",
                  green: "from-green-500/20 to-emerald-500/20 border-green-300/20",
                  blue: "from-blue-500/20 to-cyan-500/20 border-blue-300/20"
                };
                
                return (
                  <div key={stat.id} className={`backdrop-blur-xl bg-gradient-to-br ${cardStyles[stat.color]} border rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-${stat.color}-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-300`} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                        <div className={`text-${stat.color}-200 text-sm`}>{stat.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Change</span>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">+{stat.trend.value}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Global Leaderboard */}
              <div className="lg:col-span-2">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <div className="p-8 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                          <Trophy className="h-8 w-8 text-yellow-400" />
                          Top Performers
                        </h2>
                        <p className="text-blue-100/70">Global rankings across all subjects</p>
                      </div>
                      <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0 shadow-lg">
                        <Star className="w-4 h-4 mr-2" />
                        View All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="space-y-4">
                      {globalLeaderboard.map((user, index) => (
                        <div
                          key={user.rank}
                          className="flex items-center justify-between p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 group border border-white/10"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 flex items-center justify-center">
                              {getRankIcon(user.rank)}
                            </div>
                            <Avatar className="h-12 w-12 ring-2 ring-white/20">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-white text-lg">{user.name}</h4>
                              <div className="flex items-center space-x-3 text-sm">
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-300/20">
                                  {user.badge}
                                </Badge>
                                <span className="text-blue-100/70">Level {user.level}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Zap className="w-5 h-5 text-purple-400" />
                              <span className="font-bold text-white text-xl">{user.xp.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                              <div className="flex items-center space-x-1 text-xs text-blue-100/70">
                                <Calendar className="w-4 h-4" />
                                <span>{user.streak} day streak</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {getChangeIcon(user.change)}
                                <span className={`text-xs font-medium ${
                                  user.change.startsWith("+") ? "text-green-400" : 
                                  user.change.startsWith("-") ? "text-red-400" : "text-gray-400"
                                }`}>
                                  {user.change === "0" ? "=" : user.change}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-8">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6 text-purple-400" />
                    Your Achievements
                  </h3>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      return (
                        <div
                          key={achievement.title}
                          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Icon className="w-5 h-5 text-purple-300" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white">{achievement.title}</h4>
                                <p className="text-xs text-blue-100/70">{achievement.description}</p>
                              </div>
                            </div>
                            <Badge className={rarityColors[achievement.rarity as keyof typeof rarityColors]}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100/70">Your Position</span>
                      <span className="font-bold text-orange-400">#12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100/70">Points Behind #1</span>
                      <span className="font-bold text-white">1,800 XP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100/70">Next Rank in</span>
                      <span className="font-bold text-green-400">250 XP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100/70">Weekly Progress</span>
                      <span className="font-bold text-purple-400">+15.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Rankings Tabs */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-white/10">
                <h2 className="text-3xl font-bold text-white">Detailed Rankings</h2>
                <p className="text-blue-100/70 mt-2">Explore rankings across different categories</p>
              </div>
              
              <div className="p-8">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-4 bg-white/5 backdrop-blur-sm border border-white/10">
                    <TabsTrigger value="global" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                      Global
                    </TabsTrigger>
                    <TabsTrigger value="friends" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                      Friends
                    </TabsTrigger>
                    <TabsTrigger value="class" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                      Class
                    </TabsTrigger>
                    <TabsTrigger value="school" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                      School
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="global" className="mt-8">
                    <div className="space-y-3">
                      {globalLeaderboard.map((user) => (
                        <div
                          key={user.rank}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-white w-8">#{user.rank}</span>
                            <Avatar className="h-10 w-10 ring-2 ring-white/20">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-bold text-white">{user.name}</span>
                              <div className="text-sm text-blue-100/70">Level {user.level}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-4 h-4 text-purple-400" />
                              <span className="font-medium text-white">{user.xp.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getChangeIcon(user.change)}
                              <span className={`text-sm font-medium ${
                                user.change.startsWith("+") ? "text-green-400" : 
                                user.change.startsWith("-") ? "text-red-400" : "text-gray-400"
                              }`}>
                                {user.change === "0" ? "=" : user.change}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="friends" className="mt-8">
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-blue-400" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Connect with Friends</h4>
                      <p className="text-blue-100/70 mb-6">Add friends to see their rankings and compete together</p>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                        <Users className="w-4 h-4 mr-2" />
                        Add Friends
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="class" className="mt-8">
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-12 h-12 text-orange-400" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Class Rankings</h4>
                      <p className="text-blue-100/70 mb-6">Class rankings will appear here once you join a class</p>
                      <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg">
                        <Target className="w-4 h-4 mr-2" />
                        Join Class
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="school" className="mt-8">
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Medal className="w-12 h-12 text-green-400" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">School Rankings</h4>
                      <p className="text-blue-100/70 mb-6">School rankings will appear here once you verify your school</p>
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                        <Award className="w-4 h-4 mr-2" />
                        Verify School
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
