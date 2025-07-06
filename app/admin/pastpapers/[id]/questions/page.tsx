"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ArrowLeft, Plus, Edit, Trash2, PlayCircle, X, FileTextIcon } from "lucide-react"
import { toast } from "sonner"
import { PastPaper, QuestionVideo, QuestionVideoFormData } from "@/types"

export default function QuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const paperId = params.id as string
  const paperIndex = searchParams.get('paper') ? parseInt(searchParams.get('paper')!) : 0

  // State management
  const [pastPaper, setPastPaper] = useState<PastPaper | null>(null)
  const [currentPaper, setCurrentPaper] = useState<{name: string, questionPaperUrl: string, markSchemeUrl: string} | null>(null)
  const [questions, setQuestions] = useState<QuestionVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [questionsLoading, setQuestionsLoading] = useState(false)

  // Dialog states
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionVideo | null>(null)
  const [questionFormData, setQuestionFormData] = useState<QuestionVideoFormData>({
    questionNumber: 1,
    topic: "",
    questionName: "",
    questionDescription: "",
    duration: "",
    teacher: "",
    videoEmbedLink: ""
  })

  // Fetch past paper details
  const fetchPastPaper = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/pastpapers`)
      if (!response.ok) throw new Error('Failed to fetch past papers')
      
      const data = await response.json()
      if (data.success) {
        const foundPaper = data.pastPapers.find((p: PastPaper) => p.id === paperId)
        if (foundPaper) {
          setPastPaper(foundPaper)
          
          // Set current paper based on index
          if (foundPaper.papers && foundPaper.papers[paperIndex]) {
            setCurrentPaper(foundPaper.papers[paperIndex])
          } else {
            throw new Error('Paper not found at specified index')
          }
        } else {
          throw new Error('Past paper not found')
        }
      } else {
        throw new Error(data.error || 'Failed to fetch past paper')
      }
    } catch (error) {
      console.error('Error fetching past paper:', error)
      toast.error('Failed to fetch past paper details')
    } finally {
      setLoading(false)
    }
  }

  // Fetch questions for specific paper
  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true)
      const response = await fetch(`/api/admin/pastpapers/${paperId}/questions?paper=${paperIndex}`)
      if (!response.ok) throw new Error('Failed to fetch questions')
      
      const data = await response.json()
      if (data.success) {
        setQuestions(data.questions || [])
      } else {
        throw new Error(data.error || 'Failed to fetch questions')
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('Failed to fetch questions')
    } finally {
      setQuestionsLoading(false)
    }
  }

  // Question management functions
  const handleAddQuestion = () => {
    setQuestionFormData({
      questionNumber: (questions?.length || 0) + 1,
      topic: "",
      questionName: "",
      questionDescription: "",
      duration: "",
      teacher: "",
      videoEmbedLink: ""
    })
    setIsQuestionDialogOpen(true)
  }

  const handleEditQuestion = (question: QuestionVideo) => {
    setSelectedQuestion(question)
    setQuestionFormData({
      questionNumber: question.questionNumber,
      topic: question.topic,
      questionName: question.questionName,
      questionDescription: question.questionDescription,
      duration: question.duration,
      teacher: question.teacher,
      videoEmbedLink: question.videoEmbedLink
    })
    setIsEditQuestionDialogOpen(true)
  }

  const handleCreateQuestion = async () => {
    try {
      const response = await fetch(`/api/admin/pastpapers/${paperId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...questionFormData,
          paperIndex: paperIndex
        })
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create question')
      }
      
      setIsQuestionDialogOpen(false)
      toast.success('Question created successfully!')
      
      // Refresh questions
      await fetchQuestions()
    } catch (error) {
      console.error('Error creating question:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create question')
    }
  }

  const handleUpdateQuestion = async () => {
    if (!selectedQuestion) return

    try {
      const response = await fetch(`/api/admin/pastpapers/${paperId}/questions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          paperIndex: paperIndex,
          ...questionFormData
        })
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update question')
      }
      
      setIsEditQuestionDialogOpen(false)
      setSelectedQuestion(null)
      toast.success('Question updated successfully!')
      
      // Refresh questions
      await fetchQuestions()
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update question')
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/pastpapers/${paperId}/questions?questionId=${questionId}&paper=${paperIndex}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete question')
      }

      toast.success('Question deleted successfully!')
      
      // Refresh questions
      await fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete question')
    }
  }

  useEffect(() => {
    if (paperId) {
      fetchPastPaper()
      fetchQuestions()
    }
  }, [paperId, paperIndex])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading past paper...</p>
        </div>
      </div>
    )
  }

  if (!pastPaper || !currentPaper) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Paper Not Found</h1>
          <p className="text-slate-400 mb-6">The requested paper could not be found or doesn't exist.</p>
          <Button onClick={() => router.push('/admin/pastpapers')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Past Papers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Scrollable Content Container */}
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen pb-8 pt-14 sm:pt-16 lg:pt-20 max-w-full overflow-x-hidden">
          
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/admin/pastpapers')}
                variant="ghost"
                className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 hover:border-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Past Papers
              </Button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4 p-2 rounded-full bg-white/5 border border-white/10">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
                <span className="text-xs lg:text-sm text-purple-300 font-medium tracking-wider uppercase">Question Videos</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3 tracking-tight">
                {pastPaper.paperName}
              </h1>
              
              {/* Current Paper Info */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 mb-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <FileTextIcon className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">{currentPaper.name}</h2>
                </div>
                <div className="flex items-center justify-center gap-6 text-sm text-slate-300">
                  <a 
                    href={currentPaper.questionPaperUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    📄 Question Paper ↗
                  </a>
                  <a 
                    href={currentPaper.markSchemeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-green-400 transition-colors flex items-center gap-1"
                  >
                    ✅ Mark Scheme ↗
                  </a>
                </div>
              </div>
              
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
                {pastPaper.board} • {pastPaper.year} • {pastPaper.subject} • {pastPaper.program}
              </p>
              <div className="mt-4 h-1 w-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Add Question Button */}
          <div className="mb-6">
            <Card className="bg-white/[0.02] border border-white/10 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>
              <CardContent className="relative p-3 sm:p-4 lg:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Question Management</h3>
                    <p className="text-sm text-slate-400">Add, edit, and manage question videos for "{currentPaper.name}"</p>
                  </div>
                  <Button
                    onClick={handleAddQuestion}
                    className="bg-blue-500/10 border border-blue-400/30 text-blue-400 hover:bg-blue-500/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions List */}
          <Card className="relative bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-800/30 to-purple-800/20">
              <CardTitle className="text-white font-semibold text-lg flex items-center gap-3">
                <PlayCircle className="w-5 h-5 text-purple-400" />
                Questions for "{currentPaper.name}" ({questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {questionsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  <p className="ml-3 text-slate-400">Loading questions...</p>
                </div>
              ) : questions.length > 0 ? (
                <div className="grid gap-6">
                  {questions.map((question) => (
                    <div key={question.id} className="bg-slate-800/40 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-purple-400 font-bold">Q{question.questionNumber}</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">{question.questionName}</h4>
                            <p className="text-sm text-slate-400">{question.topic}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditQuestion(question)}
                            className="hover:bg-green-500/20 text-green-400"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="hover:bg-red-500/20 text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-800/95 border border-white/20 rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Question</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  This will permanently delete "{question.questionName}" from "{currentPaper.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-700/80 text-white border-slate-600 hover:bg-slate-600">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Question Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <label className="text-xs font-medium text-slate-400 block mb-1">Duration</label>
                          <p className="text-white">{question.duration}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <label className="text-xs font-medium text-slate-400 block mb-1">Teacher</label>
                          <p className="text-white">{question.teacher}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <label className="text-xs font-medium text-slate-400 block mb-1">Video</label>
                          <a 
                            href={question.videoEmbedLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Watch Video
                          </a>
                        </div>
                      </div>

                      {/* Question Description */}
                      <div className="bg-slate-700/20 rounded-lg p-4">
                        <label className="text-xs font-medium text-slate-400 block mb-2">Description</label>
                        <p className="text-slate-300 leading-relaxed">{question.questionDescription}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PlayCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Question Videos</h3>
                  <p className="text-slate-400 mb-6">"{currentPaper.name}" doesn't have any question videos yet.</p>
                  <Button
                    onClick={handleAddQuestion}
                    className="bg-blue-500/10 border border-blue-400/30 text-blue-400 hover:bg-blue-500/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Question Dialogs */}
      <QuestionDialog 
        isOpen={isQuestionDialogOpen}
        onClose={() => {
          setIsQuestionDialogOpen(false)
          setQuestionFormData({
            questionNumber: 1,
            topic: "",
            questionName: "",
            questionDescription: "",
            duration: "",
            teacher: "",
            videoEmbedLink: ""
          })
        }}
        onSave={handleCreateQuestion}
        formData={questionFormData}
        setFormData={setQuestionFormData}
        title="Add Question Video"
        paperName={`${pastPaper.paperName} - ${currentPaper.name}`}
      />

      <QuestionDialog 
        isOpen={isEditQuestionDialogOpen}
        onClose={() => {
          setIsEditQuestionDialogOpen(false)
          setSelectedQuestion(null)
          setQuestionFormData({
            questionNumber: 1,
            topic: "",
            questionName: "",
            questionDescription: "",
            duration: "",
            teacher: "",
            videoEmbedLink: ""
          })
        }}
        onSave={handleUpdateQuestion}
        formData={questionFormData}
        setFormData={setQuestionFormData}
        title="Edit Question Video"
        paperName={`${pastPaper.paperName} - ${currentPaper.name}`}
      />
    </div>
  )
}

// Question Dialog Component
function QuestionDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  formData, 
  setFormData, 
  title,
  paperName
}: {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  formData: QuestionVideoFormData
  setFormData: (data: QuestionVideoFormData) => void
  title: string
  paperName: string
}) {
  const validateForm = () => {
    if (!formData.questionName.trim()) {
      toast.error('Question name is required')
      return false
    }
    if (!formData.topic.trim()) {
      toast.error('Topic is required')
      return false
    }
    if (!formData.duration.trim()) {
      toast.error('Duration is required')
      return false
    }
    if (!formData.teacher.trim()) {
      toast.error('Teacher is required')
      return false
    }
    if (!formData.videoEmbedLink.trim()) {
      toast.error('Video embed link is required')
      return false
    }
    return true
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl"></div>
        <div className="relative">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 px-6 py-4 -m-6 mb-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <PlayCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-white">
                    {title}
                  </DialogTitle>
                  <p className="text-sm text-slate-400 mt-1">
                    For: {paperName}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 hover:bg-white/10"
              >
                <X className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-6 p-6 -m-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Question Number *</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.questionNumber}
                  onChange={(e) => setFormData({...formData, questionNumber: parseInt(e.target.value) || 1})}
                  className="bg-white/10 border-white/20 text-white focus:border-blue-400/50"
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Topic *</label>
                <Input
                  placeholder="e.g., Algebra, Geometry, etc."
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="bg-white/10 border-white/20 text-white focus:border-blue-400/50"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-white text-sm font-medium mb-2 block">Question Name *</label>
                <Input
                  placeholder="e.g., Quadratic Equations Problem"
                  value={formData.questionName}
                  onChange={(e) => setFormData({...formData, questionName: e.target.value})}
                  className="bg-white/10 border-white/20 text-white focus:border-blue-400/50"
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Duration *</label>
                <Input
                  placeholder="e.g., 15 mins"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="bg-white/10 border-white/20 text-white focus:border-blue-400/50"
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Teacher *</label>
                <Input
                  placeholder="Teacher name"
                  value={formData.teacher}
                  onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  className="bg-white/10 border-white/20 text-white focus:border-blue-400/50"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-white text-sm font-medium mb-2 block">Video Embed Link *</label>
                <Input
                  placeholder="https://www.youtube.com/embed/..."
                  value={formData.videoEmbedLink}
                  onChange={(e) => setFormData({...formData, videoEmbedLink: e.target.value})}
                  className="bg-white/10 border-white/20 text-white focus:border-blue-400/50"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-white text-sm font-medium mb-2 block">Question Description</label>
                <Textarea
                  placeholder="Detailed description of the question and solution approach..."
                  value={formData.questionDescription}
                  onChange={(e) => setFormData({...formData, questionDescription: e.target.value})}
                  className="bg-white/10 border-white/20 text-white focus:border-blue-400/50 min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 -m-6 mt-0 border-t border-white/10 bg-slate-900/50">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {title.includes('Edit') ? 'Update Question' : 'Add Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 