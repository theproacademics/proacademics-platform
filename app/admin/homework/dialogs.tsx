"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import MathField from "@/components/ui/math-field"
import { Upload, Loader2, Save, X, Plus, Calendar, Clock, Award, Target, AlertTriangle, Calculator } from "lucide-react"
import Link from "next/link"

interface HomeworkFormData {
  homeworkName: string
  subject: string
  program: string
  topic: string
  subtopic: string
  level: '1' | '2' | '3'
  teacher: string
  dateAssigned: string
  dueDate: string
  estimatedTime: string
  xpAwarded: string
  status: 'draft' | 'active'
}

interface QuestionFormData {
  questionId: string
  topic: string
  subtopic: string
  level: '1' | '2' | '3'
  question: string
  markScheme: string
  image: string
  hasEquation: boolean
  questionEquation?: string
  markSchemeEquation?: string
}

interface DialogProps {
  // Create Homework Dialog
  isCreateHomeworkDialogOpen: boolean
  setIsCreateHomeworkDialogOpen: (open: boolean) => void
  homeworkFormData: HomeworkFormData
  setHomeworkFormData: (data: HomeworkFormData) => void
  adminSubjects: {id: string, name: string, color: string, isActive: boolean}[]
  availablePrograms: string[]
  subjectPrograms: Record<string, string[]>
  handleCreateHomework: () => void
  createEmptyHomeworkFormData: () => HomeworkFormData

  // Edit Homework Dialog
  isEditHomeworkDialogOpen: boolean
  setIsEditHomeworkDialogOpen: (open: boolean) => void
  handleUpdateHomework: () => void

  // Add Question Dialog
  isAddQuestionDialogOpen: boolean
  setIsAddQuestionDialogOpen: (open: boolean) => void
  questionFormData: QuestionFormData
  setQuestionFormData: (data: QuestionFormData) => void
  handleCreateQuestion: () => void
  createEmptyQuestionFormData: () => QuestionFormData

  // Edit Question Dialog
  isEditQuestionDialogOpen: boolean
  setIsEditQuestionDialogOpen: (open: boolean) => void
  handleUpdateQuestion: () => void

  // Import Dialog
  isImportDialogOpen: boolean
  setIsImportDialogOpen: (open: boolean) => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  importLoading: boolean
  handleImport: () => void
}

export function HomeworkDialogs({
  isCreateHomeworkDialogOpen,
  setIsCreateHomeworkDialogOpen,
  homeworkFormData,
  setHomeworkFormData,
  adminSubjects,
  availablePrograms,
  subjectPrograms,
  handleCreateHomework,
  createEmptyHomeworkFormData,
  isEditHomeworkDialogOpen,
  setIsEditHomeworkDialogOpen,
  handleUpdateHomework,
  isAddQuestionDialogOpen,
  setIsAddQuestionDialogOpen,
  questionFormData,
  setQuestionFormData,
  handleCreateQuestion,
  createEmptyQuestionFormData,
  isEditQuestionDialogOpen,
  setIsEditQuestionDialogOpen,
  handleUpdateQuestion,
  isImportDialogOpen,
  setIsImportDialogOpen,
  importFile,
  setImportFile,
  importLoading,
  handleImport
}: DialogProps) {
  return (
    <>
      {/* Create Homework Dialog */}
      <Dialog open={isCreateHomeworkDialogOpen} onOpenChange={setIsCreateHomeworkDialogOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto mx-4 sm:mx-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="truncate">Create New Homework Assignment</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeworkName" className="text-white text-sm sm:text-base">Homework Name</Label>
                <Input
                  id="homeworkName"
                  value={homeworkFormData.homeworkName}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, homeworkName: e.target.value })}
                  placeholder="Enter homework name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher" className="text-white text-sm sm:text-base">Teacher</Label>
                <Input
                  id="teacher"
                  value={homeworkFormData.teacher}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, teacher: e.target.value })}
                  placeholder="Enter teacher name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-white text-sm sm:text-base">Subject</Label>
                {adminSubjects.length === 0 ? (
                  <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                    <div className="text-amber-300 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      No subjects available. Please create subjects first in the Subjects page.
                    </div>
                    <Link href="/admin/subjects" className="text-amber-200 hover:text-amber-100 text-xs underline mt-2 inline-block">
                      Go to Subjects
                    </Link>
                  </div>
                ) : (
                  <Select
                    value={homeworkFormData.subject}
                    onValueChange={(value) => setHomeworkFormData({ ...homeworkFormData, subject: value, program: '' })}
                  >
                    <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                      {adminSubjects.filter(s => s.isActive).map((subject) => (
                        <SelectItem key={subject.id} value={subject.name} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-4 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="program" className="text-white text-sm sm:text-base">Program</Label>
                <Select
                  value={homeworkFormData.program}
                  onValueChange={(value) => setHomeworkFormData({ ...homeworkFormData, program: value })}
                  disabled={!homeworkFormData.subject}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10 disabled:opacity-50">
                    <SelectValue placeholder={homeworkFormData.subject ? "Select program" : "Select subject first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    {(subjectPrograms[homeworkFormData.subject] || []).map((program) => (
                      <SelectItem key={program} value={program} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-white text-sm sm:text-base">Topic</Label>
                <Input
                  id="topic"
                  value={homeworkFormData.topic}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, topic: e.target.value })}
                  placeholder="Enter topic"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtopic" className="text-white text-sm sm:text-base">Subtopic</Label>
                <Input
                  id="subtopic"
                  value={homeworkFormData.subtopic}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, subtopic: e.target.value })}
                  placeholder="Enter subtopic"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-white text-sm sm:text-base">Level</Label>
                <Select
                  value={homeworkFormData.level}
                  onValueChange={(value: '1' | '2' | '3') => setHomeworkFormData({ ...homeworkFormData, level: value })}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    <SelectItem value="1" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 1 (Easy)</SelectItem>
                    <SelectItem value="2" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 2 (Medium)</SelectItem>
                    <SelectItem value="3" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 3 (Hard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white text-sm sm:text-base">Status</Label>
                <Select
                  value={homeworkFormData.status}
                  onValueChange={(value: 'draft' | 'active') => setHomeworkFormData({ ...homeworkFormData, status: value })}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    <SelectItem value="draft" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Draft</SelectItem>
                    <SelectItem value="active" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateAssigned" className="text-white text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Assigned
                </Label>
                <Input
                  id="dateAssigned"
                  type="date"
                  value={homeworkFormData.dateAssigned}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, dateAssigned: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-white text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={homeworkFormData.dueDate}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, dueDate: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime" className="text-white text-sm sm:text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Estimated Time (minutes)</span>
                  <span className="sm:hidden">Time (min)</span>
                </Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={homeworkFormData.estimatedTime}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, estimatedTime: e.target.value })}
                  placeholder="30"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xpAwarded" className="text-white text-sm sm:text-base flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  XP Awarded
                </Label>
                <Input
                  id="xpAwarded"
                  type="number"
                  value={homeworkFormData.xpAwarded}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, xpAwarded: e.target.value })}
                  placeholder="100"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateHomeworkDialogOpen(false)
                  setHomeworkFormData(createEmptyHomeworkFormData())
                }}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full sm:w-auto order-2 sm:order-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCreateHomework}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto order-1 sm:order-2"
                disabled={!homeworkFormData.homeworkName || !homeworkFormData.subject || !homeworkFormData.program}
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Homework</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Homework Dialog */}
      <Dialog open={isEditHomeworkDialogOpen} onOpenChange={setIsEditHomeworkDialogOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto mx-4 sm:mx-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              <span className="truncate">Edit Homework Assignment</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-homeworkName" className="text-white text-sm sm:text-base">Homework Name</Label>
                <Input
                  id="edit-homeworkName"
                  value={homeworkFormData.homeworkName}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, homeworkName: e.target.value })}
                  placeholder="Enter homework name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-teacher" className="text-white text-sm sm:text-base">Teacher</Label>
                <Input
                  id="edit-teacher"
                  value={homeworkFormData.teacher}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, teacher: e.target.value })}
                  placeholder="Enter teacher name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject" className="text-white text-sm sm:text-base">Subject</Label>
                <Select
                  value={homeworkFormData.subject}
                  onValueChange={(value) => setHomeworkFormData({ ...homeworkFormData, subject: value, program: '' })}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    {adminSubjects.filter(s => s.isActive).map((subject) => (
                      <SelectItem key={subject.id} value={subject.name} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-program" className="text-white text-sm sm:text-base">Program</Label>
                <Select
                  value={homeworkFormData.program}
                  onValueChange={(value) => setHomeworkFormData({ ...homeworkFormData, program: value })}
                  disabled={!homeworkFormData.subject}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10 disabled:opacity-50">
                    <SelectValue placeholder={homeworkFormData.subject ? "Select program" : "Select program"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    {(subjectPrograms[homeworkFormData.subject] || []).map((program) => (
                      <SelectItem key={program} value={program} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-topic" className="text-white text-sm sm:text-base">Topic</Label>
                <Input
                  id="edit-topic"
                  value={homeworkFormData.topic}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, topic: e.target.value })}
                  placeholder="Enter topic"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subtopic" className="text-white text-sm sm:text-base">Subtopic</Label>
                <Input
                  id="edit-subtopic"
                  value={homeworkFormData.subtopic}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, subtopic: e.target.value })}
                  placeholder="Enter subtopic"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-level" className="text-white text-sm sm:text-base">Level</Label>
                <Select
                  value={homeworkFormData.level}
                  onValueChange={(value: '1' | '2' | '3') => setHomeworkFormData({ ...homeworkFormData, level: value })}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    <SelectItem value="1" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 1 (Easy)</SelectItem>
                    <SelectItem value="2" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 2 (Medium)</SelectItem>
                    <SelectItem value="3" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 3 (Hard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-white text-sm sm:text-base">Status</Label>
                <Select
                  value={homeworkFormData.status}
                  onValueChange={(value: 'draft' | 'active') => setHomeworkFormData({ ...homeworkFormData, status: value })}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    <SelectItem value="draft" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Draft</SelectItem>
                    <SelectItem value="active" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dateAssigned" className="text-white text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Assigned
                </Label>
                <Input
                  id="edit-dateAssigned"
                  type="date"
                  value={homeworkFormData.dateAssigned}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, dateAssigned: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dueDate" className="text-white text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={homeworkFormData.dueDate}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, dueDate: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-estimatedTime" className="text-white text-sm sm:text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Estimated Time (minutes)</span>
                  <span className="sm:hidden">Time (min)</span>
                </Label>
                <Input
                  id="edit-estimatedTime"
                  type="number"
                  value={homeworkFormData.estimatedTime}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, estimatedTime: e.target.value })}
                  placeholder="30"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-xpAwarded" className="text-white text-sm sm:text-base flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  XP Awarded
                </Label>
                <Input
                  id="edit-xpAwarded"
                  type="number"
                  value={homeworkFormData.xpAwarded}
                  onChange={(e) => setHomeworkFormData({ ...homeworkFormData, xpAwarded: e.target.value })}
                  placeholder="100"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                variant="outline"
                onClick={() => setIsEditHomeworkDialogOpen(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full sm:w-auto order-2 sm:order-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdateHomework}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white w-full sm:w-auto order-1 sm:order-2"
                disabled={!homeworkFormData.homeworkName || !homeworkFormData.subject || !homeworkFormData.program}
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Update Homework</span>
                <span className="sm:hidden">Update</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
        <DialogContent 
          className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto mx-4 sm:mx-0"
          style={{
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }}
          onPointerDownOutside={(e) => {
            // Prevent dialog from closing when clicking on virtual keyboard
            const target = e.target as HTMLElement
            if (target.closest('.ML__virtual-keyboard') || target.closest('.ML__keyboard')) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="truncate">Add New Question</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionId" className="text-white text-sm sm:text-base">Question ID</Label>
                <Input
                  id="questionId"
                  value={questionFormData.questionId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, questionId: e.target.value })}
                  placeholder="Auto-generated ID"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-level" className="text-white text-sm sm:text-base">Level</Label>
                <Select
                  value={questionFormData.level}
                  onValueChange={(value: '1' | '2' | '3') => setQuestionFormData({ ...questionFormData, level: value })}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    <SelectItem value="1" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 1 (Easy)</SelectItem>
                    <SelectItem value="2" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 2 (Medium)</SelectItem>
                    <SelectItem value="3" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 3 (Hard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-topic" className="text-white text-sm sm:text-base">Topic</Label>
                <Input
                  id="q-topic"
                  value={questionFormData.topic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, topic: e.target.value })}
                  placeholder="Enter topic"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-subtopic" className="text-white text-sm sm:text-base">Subtopic</Label>
                <Input
                  id="q-subtopic"
                  value={questionFormData.subtopic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, subtopic: e.target.value })}
                  placeholder="Enter subtopic"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="q-image" className="text-white text-sm sm:text-base">Image URL (optional)</Label>
                <Input
                  id="q-image"
                  value={questionFormData.image}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, image: e.target.value })}
                  placeholder="Enter image URL or 'n' for no image"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Equation Toggle */}
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/20">
                <Calculator className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <Label htmlFor="hasEquation" className="text-white text-sm font-medium">
                    Has Equation
                  </Label>
                  <p className="text-slate-400 text-xs mt-1">
                    Enable to add mathematical expressions alongside the question
                  </p>
                </div>
                <Switch
                  id="hasEquation"
                  checked={questionFormData.hasEquation}
                  onCheckedChange={(checked) => setQuestionFormData({ ...questionFormData, hasEquation: checked })}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question" className="text-white text-sm sm:text-base">Question</Label>
                <Textarea
                  id="question"
                  value={questionFormData.question}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                  placeholder="Enter the question text"
                  rows={4}
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 resize-none"
                  onKeyDown={(e) => {
                    // Ensure backspace works properly in textarea
                    if (e.key === 'Backspace') {
                      e.stopPropagation()
                    }
                  }}
                />
                
                {questionFormData.hasEquation && (
                  <div className="mt-3">
                    <Label htmlFor="questionEquation" className="text-white text-sm sm:text-base">Question Equation (Optional)</Label>
                    <MathField
                      id="questionEquation"
                      value={questionFormData.questionEquation || ''}
                      onChange={(value: string) => setQuestionFormData({ ...questionFormData, questionEquation: value })}
                      placeholder="Enter mathematical expression (LaTeX supported)"
                      rows={3}
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                      virtualKeyboardMode="onfocus"
                      virtualKeyboards="all"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="markScheme" className="text-white text-sm sm:text-base">Mark Scheme</Label>
                <Textarea
                  id="markScheme"
                  value={questionFormData.markScheme}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestionFormData({ ...questionFormData, markScheme: e.target.value })}
                  placeholder="Enter the marking scheme"
                  rows={4}
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 resize-none"
                  onKeyDown={(e) => {
                    // Ensure backspace works properly in textarea
                    if (e.key === 'Backspace') {
                      e.stopPropagation()
                    }
                  }}
                />
                
                {questionFormData.hasEquation && (
                  <div className="mt-3">
                    <Label htmlFor="markSchemeEquation" className="text-white text-sm sm:text-base">Mark Scheme Equation (Optional)</Label>
                    <MathField
                      id="markSchemeEquation"
                      value={questionFormData.markSchemeEquation || ''}
                      onChange={(value: string) => setQuestionFormData({ ...questionFormData, markSchemeEquation: value })}
                      placeholder="Enter mathematical expression (LaTeX supported)"
                      rows={3}
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                      virtualKeyboardMode="onfocus"
                      virtualKeyboards="all"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                variant="outline"
                onClick={() => setIsAddQuestionDialogOpen(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full sm:w-auto order-2 sm:order-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCreateQuestion}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto order-1 sm:order-2"
                disabled={!questionFormData.question || !questionFormData.markScheme}
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Question</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditQuestionDialogOpen} onOpenChange={setIsEditQuestionDialogOpen}>
        <DialogContent 
          className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto mx-4 sm:mx-0"
          style={{
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }}
          onPointerDownOutside={(e) => {
            // Prevent dialog from closing when clicking on virtual keyboard
            const target = e.target as HTMLElement
            if (target.closest('.ML__virtual-keyboard') || target.closest('.ML__keyboard')) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              <span className="truncate">Edit Question</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-questionId" className="text-white text-sm sm:text-base">Question ID</Label>
                <Input
                  id="edit-questionId"
                  value={questionFormData.questionId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, questionId: e.target.value })}
                  placeholder="Auto-generated ID"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-q-level" className="text-white text-sm sm:text-base">Level</Label>
                <Select
                  value={questionFormData.level}
                  onValueChange={(value: '1' | '2' | '3') => setQuestionFormData({ ...questionFormData, level: value })}
                >
                  <SelectTrigger className="glass-input glass-select-trigger h-9 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:bg-white/10">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-[999999]">
                    <SelectItem value="1" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 1 (Easy)</SelectItem>
                    <SelectItem value="2" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 2 (Medium)</SelectItem>
                    <SelectItem value="3" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm">Level 3 (Hard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-q-topic" className="text-white text-sm sm:text-base">Topic</Label>
                <Input
                  id="edit-q-topic"
                  value={questionFormData.topic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, topic: e.target.value })}
                  placeholder="Enter topic"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-q-subtopic" className="text-white text-sm sm:text-base">Subtopic</Label>
                <Input
                  id="edit-q-subtopic"
                  value={questionFormData.subtopic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, subtopic: e.target.value })}
                  placeholder="Enter subtopic"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-q-image" className="text-white text-sm sm:text-base">Image URL (optional)</Label>
                <Input
                  id="edit-q-image"
                  value={questionFormData.image}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, image: e.target.value })}
                  placeholder="Enter image URL or 'n' for no image"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Equation Toggle */}
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/20">
                <Calculator className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <Label htmlFor="edit-hasEquation" className="text-white text-sm font-medium">
                    Has Equation
                  </Label>
                  <p className="text-slate-400 text-xs mt-1">
                    Enable to add mathematical expressions alongside the question
                  </p>
                </div>
                <Switch
                  id="edit-hasEquation"
                  checked={questionFormData.hasEquation}
                  onCheckedChange={(checked) => setQuestionFormData({ ...questionFormData, hasEquation: checked })}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-question" className="text-white text-sm sm:text-base">Question</Label>
                <Textarea
                  id="edit-question"
                  value={questionFormData.question}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                  placeholder="Enter the question text"
                  rows={4}
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 resize-none"
                  onKeyDown={(e) => {
                    // Ensure backspace works properly in textarea
                    if (e.key === 'Backspace') {
                      e.stopPropagation()
                    }
                  }}
                />
                
                {questionFormData.hasEquation && (
                  <div className="mt-3">
                    <Label htmlFor="edit-questionEquation" className="text-white text-sm sm:text-base">Question Equation (Optional)</Label>
                    <MathField
                      id="edit-questionEquation"
                      value={questionFormData.questionEquation || ''}
                      onChange={(value: string) => setQuestionFormData({ ...questionFormData, questionEquation: value })}
                      placeholder="Enter mathematical expression (LaTeX supported)"
                      rows={3}
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                      virtualKeyboardMode="onfocus"
                      virtualKeyboards="all"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-markScheme" className="text-white text-sm sm:text-base">Mark Scheme</Label>
                <Textarea
                  id="edit-markScheme"
                  value={questionFormData.markScheme}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestionFormData({ ...questionFormData, markScheme: e.target.value })}
                  placeholder="Enter the marking scheme"
                  rows={4}
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 resize-none"
                  onKeyDown={(e) => {
                    // Ensure backspace works properly in textarea
                    if (e.key === 'Backspace') {
                      e.stopPropagation()
                    }
                  }}
                />
                
                {questionFormData.hasEquation && (
                  <div className="mt-3">
                    <Label htmlFor="edit-markSchemeEquation" className="text-white text-sm sm:text-base">Mark Scheme Equation (Optional)</Label>
                    <MathField
                      id="edit-markSchemeEquation"
                      value={questionFormData.markSchemeEquation || ''}
                      onChange={(value: string) => setQuestionFormData({ ...questionFormData, markSchemeEquation: value })}
                      placeholder="Enter mathematical expression (LaTeX supported)"
                      rows={3}
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                      virtualKeyboardMode="onfocus"
                      virtualKeyboards="all"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                variant="outline"
                onClick={() => setIsEditQuestionDialogOpen(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full sm:w-auto order-2 sm:order-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdateQuestion}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white w-full sm:w-auto order-1 sm:order-2"
                disabled={!questionFormData.question || !questionFormData.markScheme}
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Update Question</span>
                <span className="sm:hidden">Update</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Homework Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto mx-4 sm:mx-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <span className="truncate">Import Homework from CSV</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file" className="text-white text-sm sm:text-base">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImportFile(e.target.files?.[0] || null)}
                  className="bg-white/5 border-white/20 text-white file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:hover:bg-blue-700"
                />
              </div>
              
              {importFile && (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-300">
                    <Upload className="w-4 h-4" />
                    <span className="font-medium">{importFile.name}</span>
                    <span className="text-sm text-green-200">({(importFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportDialogOpen(false)
                  setImportFile(null)
                }}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full sm:w-auto order-2 sm:order-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full sm:w-auto order-1 sm:order-2"
                disabled={!importFile}
              >
                {importLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Importing...</span>
                    <span className="sm:hidden">Importing</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Import Homework</span>
                    <span className="sm:hidden">Import</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
