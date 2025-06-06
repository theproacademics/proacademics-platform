"use client"

import { useState } from "react"
import { AdminNavigation } from "@/components/admin/admin-navigation"
import { PageHeader } from "@/components/layout/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, Users, BarChart3, Activity, Brain, Clock, Target } from "lucide-react"

// Mock data for admin reports
const reportStats = [
  {
    id: "total-students",
    title: "Total Students",
    value: "1,247",
    icon: <Users className="w-6 h-6" />,
    color: "blue" as const,
    trend: { value: 12.5, isPositive: true },
  },
  {
    id: "engagement",
    title: "Avg Engagement",
    value: "87%",
    icon: <Activity className="w-6 h-6" />,
    color: "green" as const,
    trend: { value: 8.3, isPositive: true },
  },
  {
    id: "ai-interactions",
    title: "AI Interactions",
    value: "15,432",
    icon: <Brain className="w-6 h-6" />,
    color: "purple" as const,
    trend: { value: 23.7, isPositive: true },
  },
  {
    id: "completion-rate",
    title: "Completion Rate",
    value: "92%",
    icon: <Target className="w-6 h-6" />,
    color: "orange" as const,
    trend: { value: 5.1, isPositive: true },
  },
]

const studentReports = [
  {
    id: "1",
    studentName: "Alex Johnson",
    grade: "A*",
    cwa: 87.5,
    engagement: 92,
    lastGenerated: "2024-01-10",
    status: "ready",
  },
  {
    id: "2",
    studentName: "Sarah Chen",
    grade: "A*",
    cwa: 94.2,
    engagement: 88,
    lastGenerated: "2024-01-09",
    status: "ready",
  },
  {
    id: "3",
    studentName: "Michael Kim",
    grade: "A",
    cwa: 82.1,
    engagement: 85,
    lastGenerated: "2024-01-08",
    status: "generating",
  },
]

const systemReports = [
  {
    type: "Weekly Performance",
    description: "Student engagement and performance metrics",
    lastGenerated: "2024-01-10",
    size: "2.3 MB",
  },
  {
    type: "AI Usage Analytics",
    description: "Lex AI interaction patterns and effectiveness",
    lastGenerated: "2024-01-09",
    size: "1.8 MB",
  },
  {
    type: "Parent Engagement",
    description: "Parent dashboard usage and feedback",
    lastGenerated: "2024-01-08",
    size: "1.2 MB",
  },
]

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [selectedReport, setSelectedReport] = useState("all")

  const generateReport = (type: string, studentId?: string) => {
    console.log(`Generating ${type} report${studentId ? ` for student ${studentId}` : ""}`)
    // This would trigger the AI report generation via Make.com
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <AdminNavigation />

      <main className="lg:ml-72 min-h-screen">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="Reports & Analytics"
            description="Generate and manage AI-powered reports for students and parents"
            actions={
              <div className="flex gap-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32 glass-card border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="term">This Term</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateReport("bulk")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 button-hover"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Bulk Reports
                </Button>
              </div>
            }
          />

          {/* Stats Grid */}
          <div className="mb-8">
            <StatsGrid stats={reportStats} columns={4} animated />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Student Reports */}
            <div className="lg:col-span-2">
              <AnimatedCard delay={200}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Student Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {studentReports.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium text-white">{student.studentName}</h4>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <span>Grade: {student.grade}</span>
                            <span>•</span>
                            <span>CWA: {student.cwa}%</span>
                            <span>•</span>
                            <span>Engagement: {student.engagement}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={student.status === "ready" ? "secondary" : "outline"}
                          className={
                            student.status === "ready"
                              ? "bg-green-500/20 text-green-400"
                              : "border-yellow-500 text-yellow-400"
                          }
                        >
                          {student.status === "ready" ? "Ready" : "Generating..."}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {new Date(student.lastGenerated).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateReport("individual", student.id)}
                            disabled={student.status === "generating"}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Generate
                          </Button>
                          {student.status === "ready" && (
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </AnimatedCard>
            </div>

            {/* Quick Actions */}
            <AnimatedCard delay={300}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  Quick Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => generateReport("weekly-summary")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Weekly Summary
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => generateReport("engagement")}>
                  <Activity className="w-4 h-4 mr-2" />
                  Engagement Report
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => generateReport("ai-usage")}>
                  <Brain className="w-4 h-4 mr-2" />
                  AI Usage Analytics
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => generateReport("parent-summary")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Parent Summary
                </Button>
              </CardContent>
            </AnimatedCard>
          </div>

          {/* System Reports */}
          <AnimatedCard delay={400}>
            <CardHeader>
              <CardTitle className="text-white">System Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="glass-card border-white/20">
                  <TabsTrigger value="recent">Recent Reports</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                <TabsContent value="recent" className="mt-6">
                  <div className="space-y-4">
                    {systemReports.map((report, index) => (
                      <div
                        key={report.type}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        style={{ animationDelay: `${(index + 5) * 100}ms` }}
                      >
                        <div>
                          <h4 className="font-medium text-white">{report.type}</h4>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                            <span>Generated: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Size: {report.size}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="w-3 h-3 mr-1" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="scheduled" className="mt-6">
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">No scheduled reports configured</p>
                    <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Report
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="templates" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "Student Progress", description: "Individual student performance analysis" },
                      { name: "Parent Summary", description: "Weekly summary for parents" },
                      { name: "Class Overview", description: "Class-wide performance metrics" },
                      { name: "AI Effectiveness", description: "Lex AI usage and impact analysis" },
                    ].map((template, index) => (
                      <div
                        key={template.name}
                        className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        style={{ animationDelay: `${(index + 6) * 100}ms` }}
                      >
                        <h4 className="font-medium text-white mb-2">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          Use Template
                        </Button>
                      </div>
                    ))}
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
