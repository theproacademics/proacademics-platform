"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, User, BookOpen, Plus, ChevronLeft, ChevronRight, Video, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const mockSchedule = {
  Monday: [
    {
      id: "1",
      title: "Advanced Mathematics",
      subject: "Mathematics",
      time: "09:00 - 10:30",
      instructor: "Dr. Sarah Chen",
      location: "Room 101",
      type: "live",
      color: "blue",
    },
    {
      id: "2",
      title: "Physics Lab",
      subject: "Physics",
      time: "14:00 - 15:30",
      instructor: "Prof. Michael Rodriguez",
      location: "Lab 2",
      type: "in-person",
      color: "green",
    },
  ],
  Tuesday: [
    {
      id: "3",
      title: "Organic Chemistry",
      subject: "Chemistry",
      time: "10:00 - 11:30",
      instructor: "Dr. Emily Watson",
      location: "Room 203",
      type: "live",
      color: "purple",
    },
    {
      id: "4",
      title: "Biology Study Group",
      subject: "Biology",
      time: "15:00 - 16:00",
      instructor: "Dr. James Liu",
      location: "Virtual",
      type: "group",
      color: "orange",
    },
  ],
  Wednesday: [
    {
      id: "5",
      title: "Calculus Workshop",
      subject: "Mathematics",
      time: "11:00 - 12:30",
      instructor: "Dr. Sarah Chen",
      location: "Room 101",
      type: "workshop",
      color: "blue",
    },
  ],
  Thursday: [
    {
      id: "6",
      title: "Physics Theory",
      subject: "Physics",
      time: "09:30 - 11:00",
      instructor: "Prof. Michael Rodriguez",
      location: "Room 105",
      type: "live",
      color: "green",
    },
    {
      id: "7",
      title: "Chemistry Lab",
      subject: "Chemistry",
      time: "13:00 - 14:30",
      instructor: "Dr. Emily Watson",
      location: "Lab 1",
      type: "in-person",
      color: "purple",
    },
  ],
  Friday: [
    {
      id: "8",
      title: "Math Quiz",
      subject: "Mathematics",
      time: "10:00 - 11:00",
      instructor: "Dr. Sarah Chen",
      location: "Room 101",
      type: "assessment",
      color: "red",
    },
  ],
  Saturday: [],
  Sunday: [],
}

const upcomingClasses = [
  {
    id: "next-1",
    title: "Advanced Mathematics",
    subject: "Mathematics",
    time: "Tomorrow 09:00",
    instructor: "Dr. Sarah Chen",
    type: "live",
  },
  {
    id: "next-2",
    title: "Organic Chemistry",
    subject: "Chemistry",
    time: "Tomorrow 10:00",
    instructor: "Dr. Emily Watson",
    type: "live",
  },
  {
    id: "next-3",
    title: "Physics Lab",
    subject: "Physics",
    time: "Tomorrow 14:00",
    instructor: "Prof. Michael Rodriguez",
    type: "in-person",
  },
]

const typeColors = {
  live: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "in-person": "bg-green-500/20 text-green-400 border-green-500/30",
  workshop: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  group: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  assessment: "bg-red-500/20 text-red-400 border-red-500/30",
}

const typeIcons = {
  live: <Video className="w-3 h-3" />,
  "in-person": <MapPin className="w-3 h-3" />,
  workshop: <BookOpen className="w-3 h-3" />,
  group: <Users className="w-3 h-3" />,
  assessment: <Clock className="w-3 h-3" />,
}

export default function TimetablePage() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState("Monday")

  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7))
    return daysOfWeek.map((_, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      return date
    })
  }

  const weekDates = getWeekDates(currentWeek)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />

      <main className="lg:ml-72 min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="Timetable"
            description="Manage your schedule and never miss a class"
            actions={
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 button-hover">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Upcoming Classes */}
            <AnimatedCard delay={100}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  Up Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingClasses.map((class_, index) => (
                  <div
                    key={class_.id}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    style={{ animationDelay: `${(index + 2) * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">{class_.title}</h4>
                      <Badge className={typeColors[class_.type as keyof typeof typeColors]}>
                        {typeIcons[class_.type as keyof typeof typeIcons]}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {class_.time}
                      </div>
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {class_.instructor}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </AnimatedCard>

            {/* Weekly Overview */}
            <div className="lg:col-span-3">
              <AnimatedCard delay={200}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-green-400" />
                      Weekly Schedule
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentWeek(currentWeek - 1)}
                        className="hover:bg-white/10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground px-3">
                        {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentWeek(currentWeek + 1)}
                        className="hover:bg-white/10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
                    <TabsList className="glass-card border-white/20 grid grid-cols-7 w-full">
                      {daysOfWeek.map((day, index) => (
                        <TabsTrigger key={day} value={day} className="text-xs">
                          <div className="text-center">
                            <div>{day.slice(0, 3)}</div>
                            <div className="text-xs text-muted-foreground">{weekDates[index].getDate()}</div>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {daysOfWeek.map((day) => (
                      <TabsContent key={day} value={day} className="mt-6">
                        <div className="space-y-4">
                          {mockSchedule[day as keyof typeof mockSchedule].length > 0 ? (
                            mockSchedule[day as keyof typeof mockSchedule].map((class_, index) => (
                              <div
                                key={class_.id}
                                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-l-4 border-blue-500"
                                style={{ animationDelay: `${(index + 3) * 100}ms` }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="font-medium text-white">{class_.title}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {class_.subject}
                                      </Badge>
                                      <Badge className={typeColors[class_.type as keyof typeof typeColors]}>
                                        {typeIcons[class_.type as keyof typeof typeIcons]}
                                        <span className="ml-1 capitalize">{class_.type}</span>
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                      <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {class_.time}
                                      </div>
                                      <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        {class_.instructor}
                                      </div>
                                      <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {class_.location}
                                      </div>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                    Join
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                              <p className="text-muted-foreground">No classes scheduled for {day}</p>
                              <Button variant="outline" className="mt-4 button-hover">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Class
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </AnimatedCard>
            </div>
          </div>

          {/* Calendar Grid View */}
          <AnimatedCard delay={300}>
            <CardHeader>
              <CardTitle className="text-white">Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-2">
                {/* Time column */}
                <div className="space-y-2">
                  <div className="h-12"></div> {/* Header spacer */}
                  {timeSlots.map((time) => (
                    <div key={time} className="h-16 flex items-center text-xs text-muted-foreground">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {daysOfWeek.map((day, dayIndex) => (
                  <div key={day} className="space-y-2">
                    <div className="h-12 flex items-center justify-center text-sm font-medium text-white border-b border-white/10">
                      <div className="text-center">
                        <div>{day.slice(0, 3)}</div>
                        <div className="text-xs text-muted-foreground">{weekDates[dayIndex].getDate()}</div>
                      </div>
                    </div>
                    {timeSlots.map((time, timeIndex) => (
                      <div
                        key={`${day}-${time}`}
                        className="h-16 border border-white/10 rounded hover:bg-white/5 transition-colors cursor-pointer relative"
                      >
                        {/* Render classes that fall in this time slot */}
                        {mockSchedule[day as keyof typeof mockSchedule]
                          .filter((class_) => {
                            const classStartTime = class_.time.split(" - ")[0]
                            return classStartTime === time
                          })
                          .map((class_) => (
                            <div
                              key={class_.id}
                              className={cn(
                                "absolute inset-1 rounded text-xs p-1 overflow-hidden",
                                "bg-blue-500/20 border border-blue-500/30 text-blue-400",
                              )}
                            >
                              <div className="font-medium truncate">{class_.title}</div>
                              <div className="text-xs opacity-75 truncate">{class_.instructor}</div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </ResponsiveContainer>
      </main>
    </div>
  )
}
