"use client"

import { useState, useEffect } from "react"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"
import { Navigation } from "@/components/layout/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { 
  FileText, 
  Trophy, 
  Target, 
  BookOpen, 
  Search, 
  Download, 
  Calculator,
  Atom,
  Dna,
  Globe,
  PenTool,
  Cpu,
  Languages,
  Music,
  Palette,
  Activity,
  ArrowRight,
  Eye,
  Calendar,
  Clock
} from "lucide-react"

// Animated Background Component
const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: ['#3B82F6', '#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
      speed: Math.random() * 2 + 1,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-blue-900/20" />
      
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full opacity-40 animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.id * 0.1}s`,
            animationDuration: `${4 + particle.speed}s`,
          }}
        />
      ))}

      {/* Shooting Stars */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: '8s',
          }}
        />
      ))}

      {/* Floating Geometric Shapes */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`shape-${i}`}
          className={`absolute opacity-20 animate-pulse ${
            i % 3 === 0 ? 'w-4 h-4 bg-purple-400 rounded-full' :
            i % 3 === 1 ? 'w-3 h-3 bg-indigo-400 rotate-45' :
            'w-2 h-2 bg-blue-400 rounded-full'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Large Floating Orbs */}
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full opacity-10 animate-pulse"
          style={{
            width: '300px',
            height: '300px',
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            background: `radial-gradient(circle, ${['#8B5CF6', '#6366F1', '#3B82F6'][i]} 0%, transparent 70%)`,
            animationDelay: `${i * 5}s`,
            animationDuration: `${20 + i * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

// Icon mapping for subjects
const getSubjectIcon = (subjectName: string) => {
  const name = subjectName.toLowerCase()
  if (name.includes('math')) return Calculator
  if (name.includes('physics')) return Atom
  if (name.includes('chemistry')) return Activity
  if (name.includes('biology')) return Dna
  if (name.includes('english') || name.includes('literature')) return PenTool
  if (name.includes('computer') || name.includes('science')) return Cpu
  if (name.includes('geography')) return Globe
  if (name.includes('history')) return BookOpen
  if (name.includes('language')) return Languages
  if (name.includes('art')) return Palette
  if (name.includes('music')) return Music
  return BookOpen // Default icon
}

// Subject description mapping
const getSubjectDescription = (subjectName: string) => {
  const name = subjectName.toLowerCase()
  if (name.includes('math')) return 'Algebra, Calculus, Statistics'
  if (name.includes('physics')) return 'Mechanics, Waves, Electricity'
  if (name.includes('chemistry')) return 'Organic, Inorganic, Physical'
  if (name.includes('biology')) return 'Cell Biology, Genetics, Ecology'
  if (name.includes('english') || name.includes('literature')) return 'Poetry, Prose, Drama'
  if (name.includes('computer')) return 'Programming, Algorithms, Data'
  if (name.includes('geography')) return 'Physical, Human, Environment'
  if (name.includes('history')) return 'Modern, Medieval, Ancient'
  return 'Comprehensive study materials'
}

// Dynamic subject interface
interface DynamicSubject {
  id: string
  name: string
  color: string
  isActive: boolean
  paperCount: number
  icon: any
  description: string
  dynamicStyle: React.CSSProperties
}



export default function PastPapersPage() {
  const [subjects, setSubjects] = useState<DynamicSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<DynamicSubject | null>(null)
  const [subjectPapers, setSubjectPapers] = useState<any[]>([])

  // Fetch subjects from admin API
  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const [subjectsResponse, programsMapResponse] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/subjects/programs-map')
      ])

      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json()
        if (subjectsData.success) {
          const dynamicSubjects: DynamicSubject[] = subjectsData.subjects
            .filter((subject: any) => subject.isActive)
            .map((subject: any) => {
              // Generate mock paper count (replace with real data when available)
              const paperCount = Math.floor(Math.random() * 100) + 50
              
              // Convert hex color to RGB for dynamic styling
              const hexColor = subject.color.replace('#', '')
              const r = parseInt(hexColor.substr(0, 2), 16)
              const g = parseInt(hexColor.substr(2, 2), 16)
              const b = parseInt(hexColor.substr(4, 2), 16)
              
              const dynamicStyle: React.CSSProperties = {
                background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.15), rgba(${r}, ${g}, ${b}, 0.25))`,
                borderColor: `rgba(${r}, ${g}, ${b}, 0.4)`,
                color: `rgba(${r}, ${g}, ${b}, 0.9)`
              }

              return {
                id: subject.id,
                name: subject.name,
                color: subject.color,
                isActive: subject.isActive,
                paperCount,
                icon: getSubjectIcon(subject.name),
                description: getSubjectDescription(subject.name),
                dynamicStyle
              }
            })
          
          setSubjects(dynamicSubjects)
        }
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleSubjectClick = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId)
    if (subject) {
      setSelectedSubject(subject)
      // Generate mock papers for the selected subject
      const mockPapers = Array.from({ length: subject.paperCount }, (_, i) => ({
        id: `${subjectId}-paper-${i + 1}`,
        title: `${subject.name} Paper ${i + 1}`,
        subject: subject.name,
        year: 2023 - Math.floor(i / 3),
        session: ['Summer', 'Winter', 'Spring'][i % 3],
        type: ['Question Paper', 'Mark Scheme', 'Examiner Report'][i % 3],
        duration: `${90 + (i % 3) * 15} min`,
        marks: 80 + (i % 3) * 10,
        downloads: Math.floor(Math.random() * 1000) + 100
      }))
      setSubjectPapers(mockPapers)
    }
  }

  const handleBackToSubjects = () => {
    setSelectedSubject(null)
    setSubjectPapers([])
  }

  const handlePaperView = (paperId: string) => {
    // In a real app, this would open the paper viewer
    console.log(`Viewing paper ${paperId}`)
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #581c87 40%, #312e81 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Extended Background Coverage to prevent white background on over-scroll */}
      <div 
        className="fixed pointer-events-none z-0"
        style={{ 
          top: '-100vh', 
          left: '-50vw', 
          right: '-50vw', 
          bottom: '-100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #581c87 40%, #312e81 100%)'
        }}
      />
      
      <AnimatedBackground />
      <Navigation />
      
      <div className="lg:ml-80 relative z-10">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            
            {/* Enhanced Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-6 p-3 rounded-full bg-white/5 border border-white/10">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-purple-300 font-medium tracking-wider uppercase">Academic Resources</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 tracking-tight">
                Past Papers
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
                Access comprehensive past papers and study materials for your exam preparation
              </p>
              <div className="mt-6 h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto animate-pulse"></div>
            </div>



            {/* Enhanced Main Content */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5"></div>
                <div className="relative p-6 lg:p-8 border-b border-white/10 bg-gradient-to-r from-slate-900/50 to-purple-900/30">
                  <div className="flex items-center justify-between mb-6">
                    {selectedSubject ? (
                      <div className="flex items-center gap-6">
                        <Button
                          onClick={handleBackToSubjects}
                          variant="outline"
                          className="bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                                   focus:ring-4 focus:ring-purple-400/20 rounded-xl transition-all duration-300 h-12 px-6"
                        >
                          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                          Back to Subjects
                        </Button>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: selectedSubject.color }}
                            >
                              <selectedSubject.icon className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                              {selectedSubject.name} Papers
                            </h2>
                          </div>
                          <p className="text-purple-200 text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {subjectPapers.length} papers available for download
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                          Browse Papers
                        </h2>
                        <p className="text-purple-200 text-sm">Select a subject to explore available past papers</p>
                      </div>
                    )}
                  </div>
                </div>

                              <div className="relative p-6 lg:p-8">
                  {!selectedSubject ? (
                    // Enhanced Subjects Grid
                    <div>
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-white/10">
                              <BookOpen className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">Select Subject</h3>
                              <p className="text-purple-200 text-sm">Choose from available academic subjects</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            className="text-purple-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                          >
                            View All
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Enhanced Subject Cards Grid */}
                      {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="group">
                              <div className="h-64 bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-3xl animate-pulse border border-white/10"></div>
                            </div>
                          ))}
                        </div>
                      ) : subjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {subjects.map((subject) => {
                            const IconComponent = subject.icon
                            return (
                              <div
                                key={subject.id}
                                onClick={() => handleSubjectClick(subject.id)}
                                className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                              >
                                {/* Card Background with Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-3xl transition-all duration-500 group-hover:from-white/[0.12] group-hover:to-white/[0.04]"></div>
                                <div className="absolute inset-0 border border-white/10 rounded-3xl transition-all duration-500 group-hover:border-white/20"></div>
                                <div 
                                  className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-3xl blur-xl transition-all duration-500"
                                  style={{ backgroundColor: `${subject.color}20` }}
                                ></div>
                                
                                {/* Card Content */}
                                <div className="relative p-6 h-full">
                                  {/* Header */}
                                  <div className="flex items-center justify-between mb-6">
                                    <div className="relative">
                                      <div 
                                        className="w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white/20 relative overflow-hidden transition-all duration-300 group-hover:scale-110"
                                        style={{ backgroundColor: subject.color }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                        <IconComponent className="w-8 h-8 text-white relative z-10" />
                                      </div>
                                      <div 
                                        className="absolute inset-0 w-16 h-16 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                                        style={{ backgroundColor: subject.color }}
                                      />
                                    </div>
                                    <Badge 
                                      className="bg-white/10 text-white border border-white/20 px-3 py-1.5 text-sm font-medium rounded-full"
                                    >
                                      {subject.paperCount}
                                    </Badge>
                                  </div>
                                  
                                  {/* Subject Info */}
                                  <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300 capitalize">
                                      {subject.name}
                                    </h3>
                                    <p className="text-sm text-slate-300 mb-4 group-hover:text-slate-200 transition-colors">
                                      {subject.description}
                                    </p>
                                  </div>
                                  
                                  {/* Footer */}
                                  <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300 transition-colors">
                                      <FileText className="w-4 h-4" />
                                      <span className="text-sm font-medium">
                                        {subject.paperCount} papers
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:translate-x-1">
                                      <span className="text-sm font-medium">Browse</span>
                                      <ArrowRight className="w-4 h-4" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-purple-400/50" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3">No subjects available</h3>
                          <p className="text-purple-200/70 max-w-md mx-auto">Contact your administrator to set up subjects and start accessing past papers</p>
                        </div>
                      )}
                    </div>
                                  ) : (
                    // Enhanced Papers List for Selected Subject
                    <div className="space-y-6">
                      {subjectPapers.map((paper, index) => (
                        <div key={paper.id} className="group relative">
                          {/* Card Background with Glow */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-white/[0.01] rounded-3xl transition-all duration-500 group-hover:from-white/[0.08] group-hover:to-white/[0.03]"></div>
                          <div className="absolute inset-0 border border-white/10 rounded-3xl transition-all duration-500 group-hover:border-white/20"></div>
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-3xl blur-xl transition-all duration-500"
                            style={{ backgroundColor: `${selectedSubject.color}15` }}
                          ></div>
                          
                          {/* Card Content */}
                          <div className="relative p-6 lg:p-8">
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1 min-w-0">
                                {/* Header */}
                                <div className="flex items-start gap-4 mb-6">
                                  <div className="flex-shrink-0">
                                    <div 
                                      className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-300"
                                      style={{ backgroundColor: selectedSubject.color }}
                                    >
                                      <span className="text-white font-bold text-lg">
                                        {(index + 1).toString().padStart(2, '0')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-3">
                                      <h3 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300 truncate">
                                        {paper.title}
                                      </h3>
                                      <Badge 
                                        className="bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1.5 text-sm font-medium rounded-full flex-shrink-0"
                                      >
                                        {paper.type}
                                      </Badge>
                                    </div>
                                    
                                    {/* Paper Details Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                                      <div className="flex items-center gap-2 text-slate-300 group-hover:text-slate-200 transition-colors">
                                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                          <BookOpen className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <span className="font-medium">{paper.subject}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-slate-300 group-hover:text-slate-200 transition-colors">
                                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                          <Calendar className="w-4 h-4 text-green-400" />
                                        </div>
                                        <span className="font-medium">{paper.year} {paper.session}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-slate-300 group-hover:text-slate-200 transition-colors">
                                        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                          <Clock className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <span className="font-medium">{paper.duration}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-slate-300 group-hover:text-slate-200 transition-colors">
                                        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                          <Target className="w-4 h-4 text-red-400" />
                                        </div>
                                        <span className="font-medium">{paper.marks} marks</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-slate-300 group-hover:text-slate-200 transition-colors">
                                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                          <Download className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <span className="font-medium">{paper.downloads} downloads</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                                           text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-10 px-6 rounded-xl"
                                  onClick={() => handlePaperView(paper.id)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Paper
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                                           h-10 px-6 rounded-xl transition-all duration-300"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Load More Button */}
                      {subjectPapers.length > 6 && (
                        <div className="text-center pt-8">
                          <Button
                            variant="outline"
                            className="bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 
                                     h-12 px-8 rounded-xl transition-all duration-300"
                          >
                            Load More Papers
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
