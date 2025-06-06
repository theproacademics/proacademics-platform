"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, CheckCircle, Brain, UserPlus, Shield, Check, X, ArrowRight, Star, Users, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Particles from "@/components/ui/particles"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Prevent body scroll on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    Object.values(checks).forEach(check => check && strength++)
    
    return {
      score: strength,
      checks,
      label: strength < 2 ? "Weak" : strength < 4 ? "Medium" : "Strong",
      color: strength < 2 ? "text-red-400" : strength < 4 ? "text-yellow-400" : "text-green-400"
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    if (passwordStrength.score < 3) {
      setError("Please choose a stronger password")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        toast({
          title: "Sign Up Failed",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
      } else {
        setSuccess(true)
        toast({
          title: "Account Created! 🎉",
          description: "Your account has been created successfully. You can now sign in.",
        })

        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.push("/auth/signin")
        }, 2000)
      }
    } catch (error) {
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

  const roleOptions = [
    { value: "student", label: "Student", icon: BookOpen, description: "Access personalized learning content" },
    { value: "parent", label: "Parent", icon: Users, description: "Monitor your child's progress" },
    { value: "teacher", label: "Teacher", icon: Star, description: "Create and manage courses" },
  ]

  const benefits = [
    "AI-powered personalized tutoring",
    "Real-time progress tracking",
    "Gamified learning experience",
    "24/7 support and assistance"
  ]

  if (success) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden relative fixed inset-0 flex items-center justify-center">
        <Particles
          className="absolute inset-0 pointer-events-none"
          quantity={60}
          color="#60a5fa"
          size={0.5}
        />
        <Card className="glass-morphism border-0 w-full max-w-md mx-4 animate-float-up">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-glow-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Account Created!</h2>
            <p className="text-slate-300 mb-6">
              Welcome to ProAcademics! Your account has been created successfully. 
              Redirecting to sign in...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        
        {/* Left Side - Benefits Section */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12 relative">
          {/* Animated Background Shapes */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

          <div className="relative">
            {/* Brand Logo */}
            <div className="flex items-center mb-8 animate-float-up">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 animate-glow-pulse">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold gradient-text">ProAcademics</h1>
            </div>

            {/* Hero Title */}
            <div className="mb-8 animate-float-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                Start Your
                <span className="gradient-text block">Learning Adventure</span>
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Join thousands of students already transforming their education 
                with our cutting-edge AI-powered platform.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4 mb-8 animate-float-up" style={{ animationDelay: '0.2s' }}>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 animate-float-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-slate-400">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">500+</div>
                <div className="text-slate-400">Expert Teachers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">A+</div>
                <div className="text-slate-400">Avg. Grade Improvement</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            
            {/* Mobile Brand */}
            <div className="lg:hidden text-center mb-8 animate-float-up">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 animate-glow-pulse">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold gradient-text">ProAcademics</h1>
              </div>
              <p className="text-slate-300">Create your account</p>
            </div>

            {/* Signup Card */}
            <Card className="glass-morphism glass-morphism-hover border-0 shadow-2xl animate-float-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your information to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white font-medium">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="glass-morphism border-0 text-white placeholder-slate-400 input-glow focus:border-blue-500 h-12"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="glass-morphism border-0 text-white placeholder-slate-400 input-glow focus:border-blue-500 h-12"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          placeholder="Create a password"
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
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Password strength:</span>
                            <span className={`text-xs font-medium ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 rounded-full ${
                                  i < passwordStrength.score
                                    ? passwordStrength.score < 2
                                      ? "bg-red-400"
                                      : passwordStrength.score < 4
                                      ? "bg-yellow-400"
                                      : "bg-green-400"
                                    : "bg-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-xs space-y-1">
                            {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                              <div key={key} className={`flex items-center space-x-2 ${passed ? 'text-green-400' : 'text-slate-500'}`}>
                                {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                <span>
                                  {key === 'length' && '8+ characters'}
                                  {key === 'lowercase' && 'Lowercase letter'}
                                  {key === 'uppercase' && 'Uppercase letter'}
                                  {key === 'number' && 'Number'}
                                  {key === 'special' && 'Special character'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          placeholder="Confirm your password"
                          required
                          className="glass-morphism border-0 text-white placeholder-slate-400 input-glow focus:border-blue-500 h-12 pr-12"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 text-slate-400 hover:text-white hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-400">Passwords do not match</p>
                      )}
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-white font-medium">I am a</Label>
                      <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                        <SelectTrigger className="glass-morphism border-0 text-white h-12">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <option.icon className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-slate-500">{option.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 backdrop-blur-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 h-12 btn-3d"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Create Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-slate-400 text-sm">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
