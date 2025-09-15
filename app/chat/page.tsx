"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"

export const dynamic = 'force-dynamic'
import { Navigation } from "@/components/layout/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Sparkles, Loader2, Mic, Paperclip, MoreVertical, MessageSquare, Zap, BookOpen, Calculator, Lightbulb, History, Star, Settings, Bot, User, Cpu, Globe, TrendingUp, Rocket, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Ultra-Modern Animated Background
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-gray-900 to-black"></div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-cyan-600/30 animate-gradient-x"></div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-bl from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float-slow-reverse" style={{ animationDelay: '3s' }}></div>
      <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '6s' }}></div>
      
      {/* Geometric shapes */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`geo-${i}`}
          className="absolute animate-float-slow opacity-5"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        >
          <div className="w-6 h-6 border border-blue-400/20 rotate-45 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-sm"></div>
        </div>
      ))}
    </div>
  )
}

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "suggestion"
  category?: string
}

const mockUser = {
  name: "Student",
  avatar: "/placeholder.svg?height=40&width=40",
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  content: "👋 Hello! I'm Lex, your advanced AI learning companion.\n\nI'm powered by cutting-edge neural networks and specialize in:\n• 🔢 Mathematics & Calculus\n• ⚡ Physics & Engineering\n• 🧪 Chemistry & Molecular Science\n• 🧬 Biology & Life Sciences\n• 📚 Study Techniques & Learning Strategies\n\nI'm here to provide detailed explanations, solve complex problems, and help you master any academic challenge. What would you like to explore today?",
  sender: "ai",
  timestamp: new Date(),
  category: "greeting"
}

// Enhanced AI responses
const AI_RESPONSES = {
  math: [
    "🔢 **Mathematical Analysis**\n\nExcellent question! Let me break this down systematically:\n\n**Step 1:** Identify the core principle\n**Step 2:** Apply the appropriate theorem\n**Step 3:** Verify our solution\n\nMathematics is about recognizing patterns and logical relationships. Each equation tells a story about how quantities relate to each other.\n\nWould you like me to walk through a specific example with detailed steps?",
    "📐 **Geometric Insight**\n\nThis is a fascinating spatial problem! The key is understanding how shapes and spaces interact.\n\n**Essential Tools:**\n• Coordinate systems for mapping positions\n• Trigonometric ratios for angle relationships\n• Pythagorean theorem for distance calculations\n\nGeometry helps us visualize abstract concepts. Let me show you the step-by-step approach...",
    "∫ **Calculus Concepts**\n\nCalculus is the mathematics of change and accumulation!\n\n**Key Understanding:**\n• **Derivative** = instantaneous rate of change (slope)\n• **Integral** = accumulated change (area under curve)\n\nThink of derivatives as 'zooming in' to see the exact slope at any point, while integrals 'zoom out' to see the total effect over an interval.\n\nShall we dive deeper into the mechanics?"
  ],
  physics: [
    "⚡ **Physics Principles**\n\nBrilliant physics question! Physics reveals how our universe operates at its most fundamental level.\n\n**This concept involves:**\n🔸 Energy conservation laws\n🔸 Force and motion relationships  \n🔸 Mathematical modeling of natural phenomena\n\nPhysics equations aren't just formulas—they're the language of nature itself. Let me explain the underlying principles and show you practical applications...",
    "🌊 **Electromagnetic Phenomena**\n\nFascinating! Maxwell's equations govern all electromagnetic behavior in our universe.\n\n**Core Concepts:**\n• Electric fields create forces on charged particles\n• Magnetic fields affect moving charges\n• Changing fields propagate as electromagnetic waves\n\nThe mathematics here reveals the beautiful symmetry of nature. From radio waves to light to X-rays—it's all the same phenomenon! Would you like to explore the equations?",
    "🚀 **Classical Mechanics**\n\nNewton's laws are the foundation of classical physics!\n\n**The Three Laws:**\n1️⃣ **Inertia:** Objects in motion stay in motion\n2️⃣ **Force:** F = ma (acceleration proportional to force)\n3️⃣ **Action-Reaction:** Every action has equal opposite reaction\n\nThese simple statements explain everything from a falling apple to spacecraft trajectories. Let's apply them to your specific scenario..."
  ],
  chemistry: [
    "🧪 **Chemical Analysis**\n\nExcellent chemistry question! Chemistry is the science of molecular transformation.\n\n**This reaction involves:**\n⚗️ Electron transfer or sharing between atoms\n⚗️ Energy changes (bonds breaking/forming)\n⚗️ Molecular geometry rearrangements\n\nEvery chemical reaction is essentially atoms seeking more stable arrangements. Let me show you what's happening at the molecular level...",
    "🔬 **Organic Chemistry**\n\nFascinating! Carbon's unique ability to form four bonds creates infinite molecular possibilities.\n\n**Key Principles:**\n• Electronegativity differences determine bond polarity\n• Functional groups dictate chemical reactivity\n• 3D molecular shape affects biological activity\n\nOrganic chemistry is like molecular architecture—understanding how atoms connect to build complex structures. Let's analyze the mechanism step by step..."
  ],
  biology: [
    "🧬 **Biological Systems**\n\nAmazing biological question! Life operates through incredibly sophisticated molecular machinery.\n\n**This process involves:**\n🔬 Cellular mechanisms and signaling\n🔬 Protein interactions and enzymes\n🔬 Genetic regulation and expression\n\nBiology is essentially chemistry optimized by billions of years of evolution. Let me explain the step-by-step biological pathway...",
    "🦠 **Cellular Biology**\n\nCellular biology reveals life's incredible organization! Each cell is like a highly efficient molecular factory.\n\n**Key Components:**\n• **Nucleus:** Control center containing DNA\n• **Mitochondria:** Powerhouses producing ATP energy\n• **Ribosomes:** Protein synthesis machinery\n• **Cell membrane:** Selective barrier controlling entry/exit\n\nLet's trace the molecular pathway through these amazing organelles..."
  ],
  study: [
    "🎯 **Learning Science**\n\nOutstanding study strategy question! Cognitive science reveals how the brain learns most effectively.\n\n**Evidence-Based Techniques:**\n📚 **Spaced repetition** - Review at optimal intervals\n🧠 **Active recall** - Test yourself frequently\n🎨 **Interleaving** - Mix different topics/skills\n💤 **Sleep consolidation** - Let your brain strengthen memories\n\nYour brain is literally rewiring itself as you learn! Let me design a personalized study plan for your goals...",
    "🧠 **The Feynman Technique**\n\nIncredibly powerful! If you can explain something simply, you truly understand it.\n\n**The Process:**\n1️⃣ Choose a concept to learn\n2️⃣ Explain it in simple terms (as if teaching a child)\n3️⃣ Identify gaps in your understanding\n4️⃣ Go back to sources and simplify further\n\nThis technique forces clear thinking and reveals weak spots in knowledge. Would you like to practice with a specific topic?"
  ],
  general: [
    "💡 **Deep Learning Connection**\n\nThoughtful question! I can see you're making connections between concepts—that's exactly how breakthrough understanding happens.\n\n**Cross-Disciplinary Thinking:**\n🔗 Patterns repeat across different fields\n🔗 Methods transfer between domains\n🔗 Novel solutions emerge from unexpected combinations\n\nThe most exciting discoveries happen at the intersections of subjects. Let me help you explore these connections further...",
    "🌟 **Intellectual Growth**\n\nOutstanding progress! You're demonstrating the kind of synthesis that leads to mastery.\n\n**Your Development Shows:**\n🧩 Advanced pattern recognition\n🧩 Analytical thinking skills\n🧩 Creative problem-solving approach\n🧩 Systematic learning methodology\n\nYou're developing the mindset of a lifelong learner. What's your next learning goal?"
  ]
}

const QUICK_SUGGESTIONS = [
  { text: "Solve complex quadratic equations", icon: Calculator, category: "math", color: "from-blue-500 to-cyan-500" },
  { text: "Explain calculus derivatives", icon: BookOpen, category: "math", color: "from-indigo-500 to-blue-500" },
  { text: "Newton's laws with examples", icon: Zap, category: "physics", color: "from-purple-500 to-pink-500" },
  { text: "Chemical bonding explained", icon: Sparkles, category: "chemistry", color: "from-green-500 to-emerald-500" },
  { text: "DNA replication process", icon: Brain, category: "biology", color: "from-orange-500 to-red-500" },
  { text: "Advanced study methods", icon: Lightbulb, category: "study", color: "from-yellow-500 to-orange-500" },
]

const RECENT_TOPICS = [
  { name: "Quadratic Functions", icon: Calculator },
  { name: "Electromagnetic Waves", icon: Zap },
  { name: "Organic Chemistry", icon: Sparkles },
  { name: "Cell Division", icon: Brain },
  { name: "Study Strategies", icon: Lightbulb }
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [dataReady, setDataReady] = useState(false)
  const { showPreloader, mounted } = usePreloader({ 
    delay: 1200,
    dependencies: [dataReady],
    waitForImages: true,
    waitForFonts: true 
  })

  // Simulate data loading and mark as ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setDataReady(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const detectCategory = (text: string): string => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('math') || lowerText.includes('equation') || lowerText.includes('calculate') || lowerText.includes('algebra') || lowerText.includes('geometry') || lowerText.includes('calculus')) return 'math'
    if (lowerText.includes('physics') || lowerText.includes('force') || lowerText.includes('energy') || lowerText.includes('motion') || lowerText.includes('newton') || lowerText.includes('quantum')) return 'physics'
    if (lowerText.includes('chemistry') || lowerText.includes('chemical') || lowerText.includes('reaction') || lowerText.includes('molecule') || lowerText.includes('bond')) return 'chemistry'
    if (lowerText.includes('biology') || lowerText.includes('cell') || lowerText.includes('dna') || lowerText.includes('organism') || lowerText.includes('gene')) return 'biology'
    if (lowerText.includes('study') || lowerText.includes('learn') || lowerText.includes('memory') || lowerText.includes('exam') || lowerText.includes('technique')) return 'study'
    return 'general'
  }

  const simulateAIResponse = useCallback(async (userMessage: string): Promise<Message> => {
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2500))
    
    const category = detectCategory(userMessage)
    const responses = AI_RESPONSES[category as keyof typeof AI_RESPONSES] || AI_RESPONSES.general
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    return {
      id: Date.now().toString(),
      content: randomResponse,
      sender: "ai",
      timestamp: new Date(),
      category
    }
  }, [])

  const handleSendMessage = useCallback(
    async (messageText?: string, category?: string) => {
      const text = messageText || input.trim()
      if (!text || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        content: text,
        sender: "user",
        timestamp: new Date(),
        category
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)
      setShowSuggestions(false)

      try {
        const aiMessage = await simulateAIResponse(text)
        setMessages((prev) => [...prev, aiMessage])
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, simulateAIResponse, toast],
  )

  const handleSuggestionClick = (suggestion: { text: string; category: string }) => {
    handleSendMessage(suggestion.text, suggestion.category)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getCategoryInfo = (category?: string) => {
    switch (category) {
      case 'math': return { color: 'from-blue-500 to-cyan-500', emoji: '🔢', name: 'Mathematics' }
      case 'physics': return { color: 'from-purple-500 to-pink-500', emoji: '⚡', name: 'Physics' }
      case 'chemistry': return { color: 'from-green-500 to-emerald-500', emoji: '🧪', name: 'Chemistry' }
      case 'biology': return { color: 'from-orange-500 to-red-500', emoji: '🧬', name: 'Biology' }
      case 'study': return { color: 'from-yellow-500 to-orange-500', emoji: '📚', name: 'Study Tips' }
      default: return { color: 'from-indigo-500 to-purple-500', emoji: '💡', name: 'General' }
    }
  }

  // Show preloader
  if (showPreloader) {
    return <Preloader isVisible={showPreloader} colorScheme="purple" loadingText="Connecting to AI assistant" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black relative">
      <AnimatedBackground />
      <Navigation />

      {/* Main Layout */}
      <div className="lg:ml-[262px]">
        <div className="min-h-screen flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="relative backdrop-blur-xl bg-black/20 border-b border-white/10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5"></div>
              <div className="relative px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-xl">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-black animate-pulse"></div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        Lex AI Assistant
                      </h1>
                      <p className="text-gray-300">Advanced Neural Learning Companion</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-sm text-emerald-400">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span>Online</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-blue-400">
                          <Cpu className="w-3 h-3" />
                          <span>Neural Network Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                      <Globe className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                    <Button variant="ghost" size="icon" className="hover:bg-white/10 text-gray-400 hover:text-white">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex animate-fade-in opacity-0",
                      message.sender === "user" ? "justify-end" : "justify-start"
                    )}
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className={cn(
                      "flex items-start gap-3 max-w-[80%]",
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    )}>
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                          message.sender === "user" 
                            ? "bg-gradient-to-r from-blue-500 to-purple-600" 
                            : "bg-gradient-to-r from-gray-700 to-gray-800 ring-2 ring-purple-400/30"
                        )}>
                          {message.sender === "user" ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-purple-300" />
                          )}
                        </div>
                        {message.sender === "ai" && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black"></div>
                        )}
                      </div>

                      {/* Message */}
                      <div className="relative group">
                        {message.sender === "ai" && message.category && (
                          <div className="flex items-center gap-2 mb-2 ml-1">
                            <div className={`w-2 h-2 bg-gradient-to-r ${getCategoryInfo(message.category).color} rounded-full`}></div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                              {getCategoryInfo(message.category).emoji} {getCategoryInfo(message.category).name}
                            </span>
                          </div>
                        )}
                        
                        <div className={cn(
                          "relative px-4 py-3 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-200",
                          message.sender === "user"
                            ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 ml-auto text-white"
                            : "bg-gradient-to-r from-gray-800/90 to-gray-900/90 text-white border border-gray-600/30"
                        )}>
                          {/* Glow effect */}
                          <div className={cn(
                            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity blur",
                            message.sender === "user"
                              ? "bg-gradient-to-r from-blue-400 to-purple-400"
                              : "bg-gradient-to-r from-purple-500 to-pink-500"
                          )}></div>
                          
                          <div className="relative">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <div className={cn(
                              "text-xs mt-2 flex items-center gap-1",
                              message.sender === "user" ? "justify-end text-blue-100/70" : "justify-start text-gray-400"
                            )}>
                              <span>{formatTime(message.timestamp)}</span>
                              {message.sender === "ai" && (
                                <>
                                  <span>•</span>
                                  <Sparkles className="w-3 h-3" />
                                  <span>AI</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading */}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 ring-2 ring-purple-400/30 flex items-center justify-center shadow-lg">
                          <Bot className="w-5 h-5 text-purple-300 animate-pulse" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse"></div>
                      </div>
                      
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2 ml-1">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            🤖 Processing
                          </span>
                        </div>
                        
                        <div className="px-4 py-3 rounded-2xl shadow-xl backdrop-blur-sm bg-gradient-to-r from-gray-800/90 to-gray-900/90 border border-gray-600/30">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-300">Analyzing your question...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Suggestions */}
                {showSuggestions && messages.length === 1 && (
                  <div className="space-y-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-white mb-2">How can I help you learn today?</h3>
                      <p className="text-gray-400">Choose a topic or ask me anything about your studies</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {QUICK_SUGGESTIONS.map((suggestion, index) => {
                        const Icon = suggestion.icon;
                        return (
                          <div
                            key={suggestion.text}
                            className="group cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{ animationDelay: `${index * 100 + 500}ms` }}
                          >
                            <div className="relative p-4 rounded-xl backdrop-blur-sm bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${suggestion.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                              
                              <div className="relative flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg bg-gradient-to-r ${suggestion.color} shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-white group-hover:text-blue-100 transition-colors text-sm">
                                    {suggestion.text}
                                  </h4>
                                  <p className="text-xs text-gray-400 capitalize mt-0.5">
                                    {getCategoryInfo(suggestion.category).emoji} {suggestion.category}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="relative backdrop-blur-xl bg-black/20 border-t border-white/10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5"></div>
              <div className="relative p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="relative">
                    <div className="flex items-end gap-3">
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask Lex anything about your studies..."
                          className="w-full bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-600/40 focus:border-blue-400/50 rounded-2xl px-4 py-3 pr-24 text-white placeholder:text-gray-400 shadow-xl transition-all duration-200 focus:shadow-2xl"
                          disabled={isLoading}
                          maxLength={1000}
                        />
                        
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all duration-200"
                            disabled={isLoading}
                          >
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all duration-200"
                            disabled={isLoading}
                          >
                            <Mic className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="h-12 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 text-white border-0 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                          <span className="font-medium">Send</span>
                        </div>
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                      <div className="flex items-center gap-3">
                        <span>Press Enter to send • Shift + Enter for new line</span>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Powered by neural networks</span>
                        </div>
                      </div>
                      <span className={cn(
                        "font-medium",
                        input.length > 800 ? "text-orange-400" : "text-gray-500"
                      )}>
                        {input.length}/1000
                      </span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden xl:block w-80 backdrop-blur-xl bg-black/20 border-l border-white/10">
            <div className="p-6 space-y-6">
              {/* Session Stats */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Session Analytics
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Messages", value: messages.length, color: "text-blue-400" },
                    { label: "Topics", value: new Set(messages.filter(m => m.category).map(m => m.category)).size, color: "text-purple-400" },
                    { label: "Response Time", value: "~2.1s", color: "text-emerald-400" },
                    { label: "Learning Mode", value: "Advanced", color: "text-orange-400" }
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center p-3 rounded-xl bg-gray-800/40">
                      <span className="text-gray-300 text-sm">{stat.label}</span>
                      <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Topics */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Quick Topics
                </h3>
                <div className="space-y-2">
                  {RECENT_TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <Button
                        key={topic.name}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all duration-200"
                        onClick={() => handleSendMessage(`Tell me about ${topic.name}`)}
                      >
                        <Icon className="w-4 h-4 mr-3 text-purple-400" />
                        <span className="text-sm">{topic.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* AI Capabilities */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  AI Capabilities
                </h3>
                <div className="space-y-2">
                  {[
                    { name: "Mathematics", emoji: "🔢", color: "from-blue-500 to-cyan-500" },
                    { name: "Physics", emoji: "⚡", color: "from-purple-500 to-pink-500" },
                    { name: "Chemistry", emoji: "🧪", color: "from-green-500 to-emerald-500" },
                    { name: "Biology", emoji: "🧬", color: "from-orange-500 to-red-500" },
                    { name: "Study Methods", emoji: "📚", color: "from-yellow-500 to-orange-500" }
                  ].map((subject) => (
                    <div key={subject.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30">
                      <div className={`w-3 h-3 bg-gradient-to-r ${subject.color} rounded-full`}></div>
                      <span className="text-gray-300 text-sm font-medium">{subject.emoji} {subject.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
