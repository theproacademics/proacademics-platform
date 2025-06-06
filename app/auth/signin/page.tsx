"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Brain, Zap, Trophy, BookOpen, ArrowRight, Shield, Users, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Particles from "@/components/ui/particles"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Prevent body scroll on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Check for error in URL params
  useEffect(() => {
    const urlError = searchParams.get("error")
    if (urlError) {
      setError("Authentication failed. Please try again.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        toast({
          title: "Sign In Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
      } else if (result?.ok) {
        // Get the session to determine redirect
        const session = await getSession()

        toast({
          title: "Welcome back! 🎉",
          description: "You have been successfully signed in.",
        })

        // Redirect based on role
        if (session?.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
        router.refresh()
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const demoCredentials = [
    { role: "Student", email: "alex@example.com", password: "password123", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
    { role: "Admin", email: "admin@proacademics.com", password: "password123", icon: Shield, color: "from-red-500 to-pink-500" },
    { role: "Teacher", email: "emily@proacademics.com", password: "password123", icon: Users, color: "from-green-500 to-emerald-500" },
  ]

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
    setError("")
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized tutoring with advanced AI technology"
    },
    {
      icon: Trophy,
      title: "Gamified Progress",
      description: "Earn XP, unlock achievements, and track your journey"
    },
    {
      icon: Zap,
      title: "Real-time Analytics",
      description: "Instant feedback and performance insights"
    }
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden relative fixed inset-0">
      {/* Particles Background */}
      <Particles
        className="absolute inset-0 pointer-events-none"
        quantity={80}
        color="#60a5fa"
        size={0.5}
      />

              {/* Main Container */}
        <div className="relative z-10 h-full flex overflow-auto">
        
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12 relative">
          {/* Animated Background Shapes */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

          <div className="relative">
            {/* Brand Logo */}
            <div className="flex items-center mb-8 animate-float-up">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 animate-glow-pulse">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold gradient-text">ProAcademics</h1>
            </div>

            {/* Hero Title */}
            <div className="mb-8 animate-float-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                Transform Your
                <span className="gradient-text block">Learning Journey</span>
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Experience the future of education with AI-powered tutoring, 
                personalized learning paths, and real-time progress tracking.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-6 mb-8 animate-float-up" style={{ animationDelay: '0.2s' }}>
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 glass-morphism rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 animate-float-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-slate-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">95%</div>
                <div className="text-slate-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">24/7</div>
                <div className="text-slate-400">AI Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            
            {/* Mobile Brand */}
            <div className="lg:hidden text-center mb-8 animate-float-up">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 animate-glow-pulse">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold gradient-text">ProAcademics</h1>
              </div>
              <p className="text-slate-300">Sign in to your account</p>
            </div>

            {/* Login Card */}
            <Card className="glass-morphism glass-morphism-hover border-0 shadow-2xl animate-float-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="glass-morphism border-0 text-white placeholder-slate-400 input-glow focus:border-blue-500 h-12"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-white font-medium">Password</Label>
                        <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="glass-morphism border-0 text-white placeholder-slate-400 input-glow focus:border-blue-500 h-12 pr-12"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 text-slate-400 hover:text-white hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 backdrop-blur-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 h-12 btn-3d"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-slate-400 text-sm">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Demo Credentials */}
            <Card className="glass-morphism border-0 mt-6 animate-float-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-sm text-white flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                  Demo Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoCredentials.map((cred, index) => (
                  <div key={index} className="glass-morphism rounded-lg p-3 group hover:bg-white/10 transition-all cursor-pointer"
                       onClick={() => fillDemoCredentials(cred.email, cred.password)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${cred.color} rounded-lg flex items-center justify-center`}>
                          <cred.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{cred.role}</div>
                          <div className="text-slate-400 text-xs">{cred.email}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          fillDemoCredentials(cred.email, cred.password)
                        }}
                        disabled={isLoading}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
