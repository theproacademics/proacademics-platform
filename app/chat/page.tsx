"use client"

import { useState, useRef, useEffect, useCallback } from "react"

export const dynamic = 'force-dynamic'
import { Navigation } from "@/components/layout/navigation"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Sparkles, Loader2, Mic, Paperclip, MoreVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "suggestion"
}

const mockUser = {
  name: "Alex Johnson",
  avatar: "/placeholder.svg?height=40&width=40",
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  content: "Hi there! I'm Lex, your AI learning assistant. How can I help you today?",
  sender: "ai",
  timestamp: new Date(),
}

const AI_RESPONSES = [
  "That's a great question! The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a. It's used to solve quadratic equations in the form ax² + bx + c = 0.",
  "I'd recommend focusing on understanding the concepts rather than memorizing formulas. Try to visualize what's happening with each problem.",
  "Based on your recent progress, I think you're ready to tackle more advanced problems. Would you like me to suggest some challenging exercises?",
  "Let's break this down step by step. First, we need to identify the key variables in this problem...",
  "You're making excellent progress! Your understanding of this topic has improved significantly over the past week.",
]

const QUICK_SUGGESTIONS = [
  "Explain quadratic equations",
  "Help with calculus",
  "Physics homework help",
  "Study tips for exams",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const simulateAIResponse = useCallback(async (): Promise<Message> => {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))
    const randomResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]

    return {
      id: Date.now().toString(),
      content: randomResponse,
      sender: "ai",
      timestamp: new Date(),
    }
  }, [])

  const handleSendMessage = useCallback(
    async (messageText?: string) => {
      const text = messageText || input.trim()
      if (!text || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        content: text,
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)
      setShowSuggestions(false)

      try {
        const aiMessage = await simulateAIResponse()
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

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />

      <main className="lg:ml-72 min-h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <ResponsiveContainer padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Ask Lex</h1>
                  <p className="text-sm text-muted-foreground">Your AI learning assistant</p>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Online
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </ResponsiveContainer>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <ResponsiveContainer padding="md" className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn("flex animate-fade-in", message.sender === "user" ? "justify-end" : "justify-start")}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={cn(
                    "flex items-start gap-3 max-w-[85%] sm:max-w-[75%]",
                    message.sender === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <Avatar className="mt-1 flex-shrink-0 ring-2 ring-white/10">
                    {message.sender === "user" ? (
                      <>
                        <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={`${mockUser.name}'s avatar`} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {mockUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Lex AI avatar" />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Brain className="w-5 h-5" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  <AnimatedCard
                    className={cn(
                      "max-w-full",
                      message.sender === "ai" ? "gradient-border neon-glow-purple" : "glass-card",
                    )}
                    hover={false}
                  >
                    {message.sender === "ai" && (
                      <div className="flex items-center mb-2">
                        <Sparkles className="w-3 h-3 text-purple-400 mr-1" />
                        <span className="text-xs font-medium text-purple-400">Lex AI</span>
                      </div>
                    )}
                    <p className="text-sm sm:text-base text-white leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2 text-right">{formatTime(message.timestamp)}</div>
                  </AnimatedCard>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start gap-3 max-w-[75%]">
                  <Avatar className="mt-1 ring-2 ring-white/10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Lex AI avatar" />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Brain className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <AnimatedCard className="gradient-border neon-glow-purple" hover={false}>
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-3 h-3 text-purple-400 mr-1" />
                      <span className="text-xs font-medium text-purple-400">Lex AI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </AnimatedCard>
                </div>
              </div>
            )}

            {/* Quick suggestions */}
            {showSuggestions && messages.length === 1 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-muted-foreground text-center">Try asking about:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUICK_SUGGESTIONS.map((suggestion, index) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      className="glass-card border-white/20 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-200 text-left justify-start h-auto p-4"
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Brain className="w-4 h-4 mr-2 text-purple-400" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </ResponsiveContainer>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <ResponsiveContainer padding="md">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-end gap-3"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask Lex anything..."
                      className="glass-card border-white/20 focus:border-blue-500/50 pr-12 py-3 text-base"
                      disabled={isLoading}
                      maxLength={500}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/10"
                        disabled={isLoading}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/10"
                        disabled={isLoading}
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 button-hover h-12 px-6"
                    aria-label="Send message"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Press Enter to send, Shift + Enter for new line</span>
                  <span>{input.length}/500</span>
                </div>
              </div>
            </form>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}
