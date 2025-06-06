"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import type { Session } from "next-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Brain, Trophy, Zap, ArrowRight, Shield, Users, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const DEMO_ACCOUNTS = [
  { role: "Student", email: "alex@example.com", password: "password123", icon: BookOpen, bg: "bg-blue-500" },
  { role: "Admin", email: "admin@proacademics.com", password: "password123", icon: Shield, bg: "bg-red-500" },
  { role: "Teacher", email: "emily@proacademics.com", password: "password123", icon: Users, bg: "bg-green-500" },
]

const FEATURES = [
  { icon: Brain, title: "AI-Powered", desc: "Personalized tutoring" },
  { icon: Trophy, title: "Gamified", desc: "Track progress & achievements" },
  { icon: Zap, title: "Real-time", desc: "Instant feedback" },
]

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Prevent scroll on html and body
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    
    const urlError = searchParams.get("error")
    if (urlError) setError("Authentication failed. Please try again.")
    
    return () => {
      document.documentElement.style.overflow = 'unset'
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
      document.body.style.height = 'unset'
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return setError("Please fill in all fields")
    
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        toast({ title: "Sign In Failed", description: "Please check your credentials.", variant: "destructive" })
      } else if (result?.ok) {
        const session = await getSession() as Session | null
        toast({ title: "Welcome back! 🎉", description: "Successfully signed in." })
        router.push(session?.user?.role === "admin" ? "/admin" : "/")
        router.refresh()
      }
    } catch (error) {
      setError("An unexpected error occurred")
      toast({ title: "Error", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden fixed inset-0" style={{ touchAction: 'none' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 h-full flex" style={{ overscrollBehavior: 'none' }}>
        {/* Left Panel - Hero */}
        <div className="hidden lg:flex lg:w-3/5 flex-col justify-center px-16">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="flex items-center mb-12">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ProAcademics
              </h1>
            </div>

            {/* Hero Text */}
            <h2 className="text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                Learning Journey
              </span>
            </h2>
            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
              Experience AI-powered education with personalized learning paths and real-time progress tracking.
            </p>

            {/* Features */}
            <div className="space-y-6 mb-12">
              {FEATURES.map((feature, i) => (
                <div key={i} className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              {[["10K+", "Students"], ["95%", "Success Rate"], ["24/7", "AI Support"]].map(([stat, label], i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat}
                  </div>
                  <div className="text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Login */}
        <div className="w-full lg:w-2/5 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md space-y-4 lg:space-y-6">
            
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ProAcademics
                </h1>
              </div>
              <p className="text-slate-300 text-sm">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-4 lg:pb-6">
                <CardTitle className="text-xl lg:text-2xl font-bold text-white">Welcome Back</CardTitle>
                <p className="text-slate-400 text-sm">Enter your credentials to continue</p>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6">
                <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-blue-500 h-10 lg:h-12 mt-1 lg:mt-2"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-white font-medium">Password</Label>
                      <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative mt-1 lg:mt-2">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-blue-500 h-10 lg:h-12 pr-12"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-10 lg:h-12 px-3 text-slate-400 hover:text-white hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold h-10 lg:h-12 shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <>
                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center text-slate-400 text-sm">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign up
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Demo Accounts */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm text-white">Demo Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {DEMO_ACCOUNTS.map((account, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setEmail(account.email)
                      setPassword(account.password)
                      setError("")
                    }}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all group flex items-center space-x-3"
                    disabled={isLoading}
                  >
                    <div className={`w-8 h-8 ${account.bg} rounded-lg flex items-center justify-center`}>
                      <account.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-white text-sm font-medium">{account.role}</div>
                      <div className="text-slate-400 text-xs">{account.email}</div>
                    </div>
                    <div className="text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to use
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}