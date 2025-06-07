"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, CheckCircle, Brain, UserPlus, ArrowRight, Users, BookOpen, Star, Check, X, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [deviceFingerprint, setDeviceFingerprint] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Enhanced Memoized particles with more variety
  const particles = useMemo(() => {
    return [...Array(80)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDuration: 2 + Math.random() * 6,
      animationDelay: Math.random() * 4,
      size: Math.random() > 0.7 ? (Math.random() > 0.9 ? 3 : 2) : 1,
      color: Math.random() > 0.6 ? 'green' : Math.random() > 0.3 ? 'emerald' : 'teal'
    }))
  }, [])

  // Enhanced shooting stars with more variety
  const shootingStars = useMemo(() => {
    return [...Array(5)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 60,
      animationDelay: Math.random() * 12,
      duration: 2 + Math.random() * 3,
      direction: Math.random() > 0.5 ? 'normal' : 'reverse'
    }))
  }, [])

  // Floating orbs with complex animations
  const floatingOrbs = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDuration: 8 + Math.random() * 10,
      animationDelay: Math.random() * 5,
      size: 20 + Math.random() * 40,
      color: ['green', 'emerald', 'teal', 'cyan', 'lime', 'mint'][i] || 'green'
    }))
  }, [])

  // Generate device fingerprint for security tracking
  const generateDeviceFingerprint = () => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('Security fingerprint', 2, 2)
      }
      
      const fingerprint = btoa(JSON.stringify({
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvas: canvas.toDataURL(),
        timestamp: Date.now()
      }))
      
      return fingerprint
    } catch (e) {
      return btoa(`fallback-${Date.now()}`)
    }
  }

  // Security: Input validation and sanitization
  const sanitizeInput = (input: string) => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>\"']/g, '')
      .trim()
  }

  // Security: Email validation with multiple checks
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const isValid = emailRegex.test(email)
    const isSuspicious = email.includes('..') || email.length > 254
    return isValid && !isSuspicious
  }

  // Security: Rate limiting and account lockout
  const checkRateLimit = () => {
    try {
      const attempts = localStorage.getItem('signup_attempts')
      const lastAttempt = localStorage.getItem('last_signup_attempt')
      const now = Date.now()
      
      if (attempts && lastAttempt) {
        const attemptCount = parseInt(attempts)
        const timeDiff = now - parseInt(lastAttempt)
        
        // Reset after 1 hour
        if (timeDiff > 3600000) {
          localStorage.removeItem('signup_attempts')
          localStorage.removeItem('last_signup_attempt')
          setFailedAttempts(0)
          setIsLocked(false)
          return true
        }
        
        // Lock after 5 failed attempts
        if (attemptCount >= 5) {
          setIsLocked(true)
          return false
        }
        
        setFailedAttempts(attemptCount)
      }
      
      return true
    } catch (e) {
      return true
    }
  }

  useEffect(() => {
    // Set comprehensive background to prevent over-scroll issues
    const bodyBg = 'linear-gradient(135deg, #030712 0%, #111827 40%, #000000 100%)'
    document.body.style.background = bodyBg
    document.documentElement.style.background = bodyBg
    document.body.style.backgroundAttachment = 'fixed'
    document.documentElement.style.backgroundAttachment = 'fixed'
    
    // Security: Generate device fingerprint
    setDeviceFingerprint(generateDeviceFingerprint())
    
    // Security: Check rate limiting
    checkRateLimit()
    
    // Security: Disable dev tools in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const devtools = { open: false }
      
      const checkDevTools = () => {
        if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
          if (!devtools.open) {
            devtools.open = true
            console.clear()
            console.log('%cSecurity Warning: Developer tools detected!', 'color: red; font-size: 20px; font-weight: bold;')
          }
        } else {
          devtools.open = false
        }
      }
      
      const interval = setInterval(checkDevTools, 500)
      
      // Clean up interval on unmount
      return () => clearInterval(interval)
    }
    
    // Completely disable autofill styling and force normal appearance
    const style = document.createElement('style')
    style.id = 'autofill-override-signup'
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        transition: background-color 5000s ease-in-out 0s !important;
        box-shadow: inset 0 0 20px 20px transparent !important;
        background-color: transparent !important;
      }
      
      /* Force inputs to maintain their original styling */
      .bg-gray-800\\/40:-webkit-autofill,
      .bg-gray-800\\/40:-webkit-autofill:hover,
      .bg-gray-800\\/40:-webkit-autofill:focus,
      .bg-gray-800\\/40:-webkit-autofill:active {
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: white !important;
        transition: background-color 5000s ease-in-out 0s !important;
        box-shadow: inset 0 0 20px 20px rgba(31, 41, 55, 0.4) !important;
      }
      
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      
      /* Remove all focus outlines from select components */
      [role="combobox"],
      [role="combobox"]:focus,
      [role="listbox"],
      [role="listbox"]:focus,
      [role="option"],
      [role="option"]:focus,
      button[role="combobox"],
      button[role="combobox"]:focus {
        outline: none !important;
        box-shadow: none !important;
        ring: none !important;
        ring-offset: none !important;
      }
    `
    document.head.appendChild(style)
    
    // Security: Disable right-click and keyboard shortcuts in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const handleRightClick = (e: MouseEvent) => e.preventDefault()
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85) ||
            (e.ctrlKey && e.keyCode === 83)) {
          e.preventDefault()
        }
      }
      
      document.addEventListener('contextmenu', handleRightClick)
      document.addEventListener('keydown', handleKeyDown)
      
    return () => {
        document.removeEventListener('contextmenu', handleRightClick)
        document.removeEventListener('keydown', handleKeyDown)
        const existingStyle = document.getElementById('autofill-override-signup')
        if (existingStyle) document.head.removeChild(existingStyle)
      }
    }
    
    const urlError = new URLSearchParams(window.location.search).get("error")
    if (urlError) setError("Authentication failed. Please try again.")
    
    return () => {
      document.body.style.background = ''
      document.documentElement.style.background = ''
      document.body.style.backgroundAttachment = ''
      document.documentElement.style.backgroundAttachment = ''
      const existingStyle = document.getElementById('autofill-override-signup')
      if (existingStyle) document.head.removeChild(existingStyle)
    }
  }, [])

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleChange = (field: string, value: string) => {
    // Security: Sanitize input to prevent XSS
    const sanitizedValue = sanitizeInput(value)
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))
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
    // Security: Enhanced validation
    if (!formData.name.trim() || formData.name.length < 2) {
      setError("Name must be at least 2 characters")
      return false
    }
    if (formData.name.length > 50) {
      setError("Name is too long (max 50 characters)")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    if (formData.password.length > 128) {
      setError("Password is too long (max 128 characters)")
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
    // Check for common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123']
    if (commonPasswords.includes(formData.password.toLowerCase())) {
      setError("Please choose a more unique password")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Security: Check rate limiting
    if (isLocked) {
      setError("Too many signup attempts. Please try again later.")
      return
    }

    if (!checkRateLimit()) {
      setError("Too many signup attempts. Please try again later.")
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      // Security: Add progressive delay based on failed attempts
      if (failedAttempts > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, failedAttempts) * 1000))
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Fingerprint": deviceFingerprint,
          "X-Timestamp": Date.now().toString(),
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: formData.role,
          deviceFingerprint,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Security: Track failed attempts
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)
        
        try {
          localStorage.setItem('signup_attempts', newFailedAttempts.toString())
          localStorage.setItem('last_signup_attempt', Date.now().toString())
        } catch (e) {
          // Handle localStorage errors
        }

        if (newFailedAttempts >= 5) {
          setIsLocked(true)
          setError("Account temporarily locked due to too many failed attempts")
        } else {
        setError(data.error || "Something went wrong")
        }

        // Security: Log failed signup attempt
        console.warn(`Failed signup attempt ${newFailedAttempts} for email:`, formData.email)
      } else {
        // Security: Clear failed attempts on success
        setFailedAttempts(0)
        try {
          localStorage.removeItem('signup_attempts')
          localStorage.removeItem('last_signup_attempt')
        } catch (e) {
          // Handle localStorage errors
        }

        setSuccess(true)
        toast({
          title: "Account created successfully!",
          description: "Welcome to ProAcademics. Redirecting to sign in...",
        })

        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.push("/auth/signin")
        }, 2000)
      }
    } catch (error) {
      // Security: Track network errors as failed attempts
      const newFailedAttempts = failedAttempts + 1
      setFailedAttempts(newFailedAttempts)
      
      try {
        localStorage.setItem('signup_attempts', newFailedAttempts.toString())
        localStorage.setItem('last_signup_attempt', Date.now().toString())
      } catch (e) {
        // Handle localStorage errors
      }

      setError("Network error. Please check your connection and try again.")
      console.error("Signup error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = [
    { 
      value: "student", 
      label: "Student", 
      icon: BookOpen, 
      description: "Access personalized learning content and track your progress",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    { 
      value: "parent", 
      label: "Parent", 
      icon: Users, 
      description: "Monitor your child's learning journey and achievements",
      color: "from-green-500 to-emerald-500", 
      bgColor: "bg-green-500/10"
    },
    { 
      value: "teacher", 
      label: "Teacher", 
      icon: Star, 
      description: "Create courses and manage student learning experiences",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10"
    },
  ]

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        {/* Background Elements */}
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Success Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 w-full max-w-md">
          <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
            </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Account Created!</h2>
              <p className="text-gray-300 mb-6 text-sm">
              Welcome to ProAcademics! Your account has been created successfully. 
              Redirecting to sign in...
            </p>
            <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black"
      style={{
        background: 'linear-gradient(135deg, #030712 0%, #111827 40%, #000000 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Extended Background Coverage */}
      <div 
        className="fixed pointer-events-none z-0"
        style={{ 
          top: '-100vh', 
          left: '-50vw', 
          right: '-50vw', 
          bottom: '-100vh',
          background: 'linear-gradient(135deg, #030712 0%, #111827 40%, #000000 100%)'
        }}
      ></div>
      
      {/* Grid Background */}
      <div 
        className="fixed opacity-10 pointer-events-none z-0"
        style={{ 
          top: '-100vh', 
          left: '-50vw', 
          right: '-50vw', 
          bottom: '-100vh'
        }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Enhanced Grid Pattern - More Visible */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none z-0">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 25s linear infinite'
          }}
        />
      </div>

      {/* Enhanced Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((particle) => {
          const colorClasses = {
            green: particle.size === 3 ? 'bg-green-400/60 shadow-lg shadow-green-400/30' : particle.size === 2 ? 'bg-green-400/45' : 'bg-green-400/30',
            emerald: particle.size === 3 ? 'bg-emerald-400/60 shadow-lg shadow-emerald-400/30' : particle.size === 2 ? 'bg-emerald-400/45' : 'bg-emerald-400/30',
            teal: particle.size === 3 ? 'bg-teal-400/60 shadow-lg shadow-teal-400/30' : particle.size === 2 ? 'bg-teal-400/45' : 'bg-teal-400/30'
          }
          
          return (
            <div
              key={particle.id}
              className={`absolute rounded-full transition-all duration-1000 ${
                particle.size === 3 ? 'w-3 h-3' : particle.size === 2 ? 'w-2 h-2' : 'w-1 h-1'
              } ${colorClasses[particle.color as keyof typeof colorClasses]}`}
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `floatEnhanced ${particle.animationDuration}s ease-in-out infinite`,
                animationDelay: `${particle.animationDelay}s`
              }}
            />
          )
        })}
      </div>

      {/* Enhanced Shooting Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animation: `shootingStarEnhanced ${star.duration}s linear infinite ${star.direction}`,
              animationDelay: `${star.animationDelay}s`
            }}
          />
        ))}
      </div>

      {/* Dynamic Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {floatingOrbs.map((orb) => {
          const orbColors = {
            green: 'from-green-500/10 to-green-400/20',
            emerald: 'from-emerald-500/10 to-emerald-400/20',
            teal: 'from-teal-500/10 to-teal-400/20',
            cyan: 'from-cyan-500/10 to-cyan-400/20',
            lime: 'from-lime-500/10 to-lime-400/20',
            mint: 'from-green-500/10 to-emerald-400/20'
          }
          
          return (
            <div
              key={orb.id}
              className={`absolute bg-gradient-to-r ${orbColors[orb.color as keyof typeof orbColors]} rounded-full blur-xl`}
              style={{
                width: `${orb.size}px`,
                height: `${orb.size}px`,
                left: `${orb.left}%`,
                top: `${orb.top}%`,
                animation: `orbFloat ${orb.animationDuration}s ease-in-out infinite`,
                animationDelay: `${orb.animationDelay}s`
              }}
            />
          )
        })}
      </div>

      {/* 3D Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute w-32 h-32 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-2xl"
          style={{
            top: '10%',
            left: '15%',
            animation: 'float3d 6s ease-in-out infinite',
            transform: 'translateZ(0)'
          }}
        />
        <div 
          className="absolute w-24 h-24 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-2xl"
          style={{
            bottom: '20%',
            right: '20%',
            animation: 'float3d 8s ease-in-out infinite reverse',
            transform: 'translateZ(0)'
          }}
        />
        <div 
          className="absolute w-20 h-20 bg-gradient-to-r from-lime-500/20 to-green-500/20 rounded-full blur-xl"
          style={{
            top: '60%',
            left: '5%',
            animation: 'float3d 7s ease-in-out infinite',
            transform: 'translateZ(0)'
          }}
        />
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes floatEnhanced {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); 
            opacity: 0.4;
          }
          25% { 
            transform: translateY(-15px) translateX(10px) rotate(90deg) scale(1.1); 
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-25px) translateX(-5px) rotate(180deg) scale(1.3); 
            opacity: 0.9;
          }
          75% { 
            transform: translateY(-10px) translateX(-15px) rotate(270deg) scale(1.1); 
            opacity: 0.6;
          }
        }
        @keyframes float3d {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) translateZ(0px) scale(1) rotateX(0deg) rotateY(0deg); 
          }
          33% { 
            transform: translateY(-30px) translateX(20px) translateZ(10px) scale(1.1) rotateX(15deg) rotateY(15deg); 
          }
          66% { 
            transform: translateY(-10px) translateX(-15px) translateZ(-5px) scale(0.9) rotateX(-10deg) rotateY(-10deg); 
          }
        }
        @keyframes grid-move {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(12.5px, 12.5px) rotate(0.5deg); }
          50% { transform: translate(25px, 25px) rotate(1deg); }
          75% { transform: translate(37.5px, 37.5px) rotate(0.5deg); }
          100% { transform: translate(50px, 50px) rotate(0deg); }
        }
        @keyframes shootingStarEnhanced {
          0% { 
            transform: translateX(-150px) translateY(0px) scale(0) rotate(0deg);
            opacity: 0;
            box-shadow: none;
          }
          10% { 
            transform: translateX(-100px) translateY(-10px) scale(0.5) rotate(45deg);
            opacity: 0.5;
            box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
          }
          20% { 
            transform: translateX(-50px) translateY(-20px) scale(1) rotate(45deg);
            opacity: 1;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(34, 197, 94, 0.4);
          }
          80% { 
            transform: translateX(100px) translateY(-40px) scale(1) rotate(45deg);
            opacity: 1;
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(16, 185, 129, 0.4);
          }
          90% { 
            transform: translateX(150px) translateY(-50px) scale(0.5) rotate(45deg);
            opacity: 0.5;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
          }
          100% { 
            transform: translateX(200px) translateY(-60px) scale(0) rotate(45deg);
            opacity: 0;
            box-shadow: none;
          }
        }
        @keyframes orbFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1) rotate(0deg); 
            opacity: 0.3;
          }
          25% { 
            transform: translateY(-20px) translateX(15px) scale(1.2) rotate(90deg); 
            opacity: 0.5;
          }
          50% { 
            transform: translateY(-30px) translateX(-10px) scale(1.4) rotate(180deg); 
            opacity: 0.7;
          }
          75% { 
            transform: translateY(-15px) translateX(-25px) scale(1.1) rotate(270deg); 
            opacity: 0.4;
          }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(34, 197, 94, 0.3), inset 0 0 10px rgba(34, 197, 94, 0.1);
          }
          50% { 
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.2);
          }
        }
        @keyframes input-focus {
          0% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
          }
          100% { 
            transform: scale(1.01);
            box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
          }
        }
        @keyframes typing-glow {
          0%, 100% { 
            box-shadow: inset 0 0 10px rgba(34, 197, 94, 0.1);
          }
          50% { 
            box-shadow: inset 0 0 15px rgba(34, 197, 94, 0.3);
          }
        }
      `}</style>

              {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center py-4 sm:py-8">
        <div className="w-full max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Panel - Hero Section */}
            <div className="hidden lg:flex flex-col justify-center space-y-6 py-4">
              
              {/* Logo & Brand */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
          <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
              </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                      <Sparkles className="w-1.5 h-1.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-white">
                      ProAcademics
                    </h1>
                    <p className="text-gray-400 text-xs">Next-Gen Learning Platform</p>
                  </div>
            </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
                Start Your
                    <br />
                    <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Learning Journey
                    </span>
              </h2>
                  <p className="text-base text-gray-300 leading-relaxed max-w-md font-normal">
                    Join thousands of students transforming their education with our AI-powered platform.
              </p>
                </div>
            </div>

              {/* Benefits */}
              <div className="space-y-2">
                {["AI-powered tutoring", "Real-time progress tracking", "Gamified learning experience", "24/7 support"].map((benefit, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 hover:bg-white/5 hover:scale-105 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-green-400 transition-all duration-300 relative z-10 shadow-lg shadow-green-500/30">
                        <Check className="w-2.5 h-2.5 text-white group-hover:scale-125 transition-transform duration-300" />
                  </div>
                      <span className="text-gray-300 text-xs group-hover:text-green-200 transition-colors duration-300 relative z-10">{benefit}</span>
                    </div>
                </div>
              ))}
            </div>

              {/* Stats */}
              <div className="flex items-center space-x-6">
              <div className="text-center">
                  <div className="text-xl font-semibold text-white mb-0.5">10K+</div>
                  <div className="text-gray-400 text-xs">Students</div>
              </div>
              <div className="text-center">
                  <div className="text-xl font-semibold text-white mb-0.5">500+</div>
                  <div className="text-gray-400 text-xs">Teachers</div>
              </div>
              <div className="text-center">
                  <div className="text-xl font-semibold text-white mb-0.5">A+</div>
                  <div className="text-gray-400 text-xs">Avg. Grade</div>
            </div>
          </div>
        </div>

            {/* Right Panel - Signup Form */}
            <div className="flex flex-col justify-center space-y-4 w-full max-w-sm mx-auto lg:mx-0 py-4 sm:py-6">
              
              {/* Mobile Logo */}
              <div className="lg:hidden text-center space-y-2">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                </div>
                  <h1 className="text-xl font-semibold text-white">
                    ProAcademics
                  </h1>
              </div>
                <p className="text-gray-400 text-xs">Create your account</p>
            </div>

            {/* Signup Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 hover:scale-[1.02] hover:bg-gray-900/60 transition-all duration-300">
                  <CardHeader className="text-center space-y-1 pb-4">
                    <CardTitle className="text-xl font-semibold text-white">Create Account</CardTitle>
                    <p className="text-gray-400 text-xs">Enter your information to get started</p>
              </CardHeader>
                <CardContent className="space-y-3">
                  <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                    
                    {/* Name Field */}
                    <div className="space-y-1 group">
                      <Label htmlFor="name" className="text-gray-300 text-xs font-medium transition-all duration-300 group-focus-within:text-green-400 group-focus-within:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                        Full Name
                      </Label>
                      <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter your full name"
                          className="bg-gray-800/40 border-gray-600/50 text-white placeholder-gray-500 h-9 rounded-lg text-xs transition-all duration-300 hover:border-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 hover:bg-gray-800/60 focus:bg-gray-800/70 group-focus-within:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          style={{
                            outline: 'none',
                            boxShadow: 'none',
                            border: '1px solid rgba(75, 85, 99, 0.5)',
                            webkitBoxShadow: '0 0 0 1000px rgba(31, 41, 55, 0.4) inset',
                            webkitTextFillColor: 'white'
                          } as React.CSSProperties}
                          onFocus={(e) => {
                            e.target.style.outline = 'none'
                            e.target.style.boxShadow = 'none'
                            e.target.style.border = '1px solid rgba(34, 197, 94, 0.8)';
                            e.target.style.animation = 'input-focus 0.3s ease-out forwards';
                            (e.target.style as any).webkitBoxShadow = '0 0 0 1000px rgba(31, 41, 55, 0.7) inset';
                            (e.target.style as any).webkitTextFillColor = 'white'
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(75, 85, 99, 0.5)'
                            e.target.style.animation = 'none'
                            e.target.style.transform = 'scale(1)'
                          }}
                          onInput={(e) => {
                            if (e.currentTarget.value.length > 0) {
                              e.currentTarget.style.animation = 'typing-glow 1s ease-in-out infinite'
                            } else {
                              e.currentTarget.style.animation = 'none'
                            }
                          }}
                        disabled={isLoading}
                      />
                        {formData.name && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1 group">
                      <Label htmlFor="email" className="text-gray-300 text-xs font-medium transition-all duration-300 group-focus-within:text-green-400 group-focus-within:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                        Email
                      </Label>
                      <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter your email"
                          className="bg-gray-800/40 border-gray-600/50 text-white placeholder-gray-500 h-9 rounded-lg text-xs transition-all duration-300 hover:border-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 hover:bg-gray-800/60 focus:bg-gray-800/70 group-focus-within:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          style={{
                            outline: 'none',
                            boxShadow: 'none',
                            border: '1px solid rgba(75, 85, 99, 0.5)',
                            webkitBoxShadow: '0 0 0 1000px rgba(31, 41, 55, 0.4) inset',
                            webkitTextFillColor: 'white'
                          } as React.CSSProperties}
                          onFocus={(e) => {
                            e.target.style.outline = 'none'
                            e.target.style.boxShadow = 'none'
                            e.target.style.border = '1px solid rgba(34, 197, 94, 0.8)';
                            e.target.style.animation = 'input-focus 0.3s ease-out forwards';
                            (e.target.style as any).webkitBoxShadow = '0 0 0 1000px rgba(31, 41, 55, 0.7) inset';
                            (e.target.style as any).webkitTextFillColor = 'white'
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(75, 85, 99, 0.5)'
                            e.target.style.animation = 'none'
                            e.target.style.transform = 'scale(1)'
                          }}
                          onInput={(e) => {
                            if (e.currentTarget.value.length > 0) {
                              e.currentTarget.style.animation = 'typing-glow 1s ease-in-out infinite'
                            } else {
                              e.currentTarget.style.animation = 'none'
                            }
                          }}
                        disabled={isLoading}
                      />
                        {formData.email && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1 group">
                      <Label htmlFor="password" className="text-gray-300 text-xs font-medium transition-all duration-300 group-focus-within:text-green-400 group-focus-within:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          placeholder="Create a password"
                          className="bg-gray-800/40 border-gray-600/50 text-white placeholder-gray-500 h-9 rounded-lg text-xs pr-9 transition-all duration-300 hover:border-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 hover:bg-gray-800/60 focus:bg-gray-800/70 group-focus-within:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          style={{
                            outline: 'none',
                            boxShadow: 'none',
                            border: '1px solid rgba(75, 85, 99, 0.5)',
                            webkitBoxShadow: '0 0 0 1000px rgba(31, 41, 55, 0.4) inset',
                            webkitTextFillColor: 'white'
                          } as React.CSSProperties}
                          onFocus={(e) => {
                            e.target.style.outline = 'none'
                            e.target.style.boxShadow = 'none'
                            e.target.style.border = '1px solid rgba(34, 197, 94, 0.8)';
                            e.target.style.animation = 'input-focus 0.3s ease-out forwards';
                            (e.target.style as any).webkitBoxShadow = '0 0 0 1000px rgba(31, 41, 55, 0.7) inset';
                            (e.target.style as any).webkitTextFillColor = 'white'
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(75, 85, 99, 0.5)'
                            e.target.style.animation = 'none'
                            e.target.style.transform = 'scale(1)'
                          }}
                          onInput={(e) => {
                            if (e.currentTarget.value.length > 0) {
                              e.currentTarget.style.animation = 'typing-glow 1s ease-in-out infinite'
                            } else {
                              e.currentTarget.style.animation = 'none'
                            }
                          }}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:bg-gray-700/30 rounded-r-lg group-focus-within:text-green-400"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            background: 'transparent !important',
                            backgroundColor: 'transparent !important',
                            border: 'none !important',
                            outline: 'none !important',
                            boxShadow: 'none !important',
                            backgroundImage: 'none !important'
                          }}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 transition-transform duration-300" /> : <Eye className="h-4 w-4 transition-transform duration-300" />}
                        </button>
                        {formData.password && (
                          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Password Strength */}
                      {formData.password && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Strength:</span>
                            <span className={`text-xs font-medium ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-0.5 rounded-full ${
                                  i < passwordStrength.score
                                    ? passwordStrength.score < 2
                                      ? "bg-red-400"
                                      : passwordStrength.score < 4
                                      ? "bg-yellow-400"
                                      : "bg-green-400"
                                    : "bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1 group">
                      <Label htmlFor="confirmPassword" className="text-gray-300 text-xs font-medium transition-all duration-300 group-focus-within:text-green-400 group-focus-within:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          placeholder="Confirm your password"
                          className="bg-gray-800/40 border-gray-600/50 text-white placeholder-gray-500 h-9 rounded-lg text-xs pr-9 transition-all duration-300 hover:border-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 hover:bg-gray-800/60 focus:bg-gray-800/70 group-focus-within:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          style={{
                            outline: 'none',
                            boxShadow: 'none',
                            border: '1px solid rgba(75, 85, 99, 0.5)',
                            webkitBoxShadow: '0 0 0 1000px rgba(31, 41, 55, 0.4) inset',
                            webkitTextFillColor: 'white'
                          } as React.CSSProperties}
                          onFocus={(e) => {
                            e.target.style.outline = 'none'
                            e.target.style.boxShadow = 'none'
                            e.target.style.border = '1px solid rgba(34, 197, 94, 0.8)';
                            e.target.style.animation = 'input-focus 0.3s ease-out forwards';
                            (e.target.style as any).webkitBoxShadow = '0 0 0 1000px rgba(31, 41, 55, 0.7) inset';
                            (e.target.style as any).webkitTextFillColor = 'white'
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(75, 85, 99, 0.5)'
                            e.target.style.animation = 'none'
                            e.target.style.transform = 'scale(1)'
                          }}
                          onInput={(e) => {
                            if (e.currentTarget.value.length > 0) {
                              e.currentTarget.style.animation = 'typing-glow 1s ease-in-out infinite'
                            } else {
                              e.currentTarget.style.animation = 'none'
                            }
                          }}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:bg-gray-700/30 rounded-r-lg group-focus-within:text-green-400"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            background: 'transparent !important',
                            backgroundColor: 'transparent !important',
                            border: 'none !important',
                            outline: 'none !important',
                            boxShadow: 'none !important',
                            backgroundImage: 'none !important'
                          }}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 transition-transform duration-300" /> : <Eye className="h-4 w-4 transition-transform duration-300" />}
                        </button>
                        {formData.confirmPassword && (
                          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)] ${
                              formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
                                ? 'bg-green-400' 
                                : 'bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                            }`}></div>
                      </div>
                      )}
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-1 group">
                      <Label htmlFor="role" className="text-gray-300 text-xs font-medium transition-all duration-300 group-focus-within:text-green-400 group-focus-within:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                        I am a
                      </Label>
                      <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                        <SelectTrigger 
                          className="bg-gray-800/40 border-gray-600/50 text-white min-h-[3rem] h-auto rounded-lg text-xs hover:border-gray-500 transition-all duration-300 focus:ring-0 focus:ring-offset-0 focus:outline-none py-2 hover:bg-gray-800/60 focus:bg-gray-800/70 group-focus-within:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.01]"
                          style={{
                            outline: 'none',
                            boxShadow: 'none'
                          } as React.CSSProperties}
                        >
                          <div className="flex items-center space-x-3 w-full group-hover:scale-[1.02] transition-transform duration-300">
                            {(() => {
                              const selectedOption = roleOptions.find(opt => opt.value === formData.role)
                              return selectedOption ? (
                                <>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${selectedOption.color} flex-shrink-0 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                                    <selectedOption.icon className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-125" />
                                  </div>
                                  <div className="text-left flex-1 min-w-0">
                                    <div className="font-medium text-white text-xs leading-tight group-hover:text-green-200 transition-colors duration-300">{selectedOption.label}</div>
                                    <div className="text-gray-400 text-xs leading-relaxed mt-0.5 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">{selectedOption.description}</div>
                                  </div>
                                </>
                              ) : (
                          <SelectValue placeholder="Select your role" />
                              )
                            })()}
                          </div>
                        </SelectTrigger>
                        <SelectContent 
                          className="bg-gray-900 border-gray-700 focus:outline-none"
                          style={{
                            outline: 'none',
                            boxShadow: 'none'
                          } as React.CSSProperties}
                        >
                          {roleOptions.map((option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              className="text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none cursor-pointer"
                              style={{
                                outline: 'none',
                                boxShadow: 'none'
                              } as React.CSSProperties}
                            >
                              <div className="flex items-center space-x-3 py-1">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${option.color}`}>
                                  <option.icon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-white text-xs">{option.label}</div>
                                  <div className="text-gray-400 text-xs leading-relaxed max-w-xs">
                                    {option.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>



                    {/* Submit Button */}
                  <Button
                    type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium h-9 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs relative overflow-hidden group shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
                      style={{
                        background: isLoading ? 'linear-gradient(45deg, #22c55e, #10b981, #22c55e)' : undefined,
                        backgroundSize: isLoading ? '200% 200%' : undefined,
                        animation: isLoading ? 'pulse-glow 2s ease-in-out infinite' : undefined
                      }}
                      disabled={isLoading || isLocked}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {isLoading ? (
                        <div className="flex items-center space-x-2 relative z-10">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span className="text-sm">Creating Account...</span>
                        </div>
                      ) : isLocked ? (
                        <div className="flex items-center space-x-2 relative z-10">
                          <span className="text-sm">Account Locked</span>
                          <X className="h-4 w-4" />
                      </div>
                    ) : (
                        <div className="flex items-center space-x-2 relative z-10 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-sm">Create Account</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </form>

                  {/* Sign In Link */}
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">
                    Already have an account?{" "}
                      <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 transition-colors text-xs">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

              {/* Smart Notification System */}
              {(error || failedAttempts > 0 || isLocked) && (
                <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in-0 duration-300 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:w-96">
                  <div className={`backdrop-blur-md border rounded-lg px-4 py-2.5 shadow-xl ${
                    error 
                      ? 'bg-red-500/20 border-red-500/30' 
                      : 'bg-yellow-500/20 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {error ? (
                          <p className="text-red-100 text-sm font-medium truncate">{error}</p>
                        ) : isLocked ? (
                          <p className="text-yellow-100 text-sm font-medium">🔒 Account locked - try again later</p>
                        ) : (
                          <p className="text-yellow-100 text-sm font-medium">⚠️ {failedAttempts}/5 attempts used</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setError("")
                          if (!error) {
                            localStorage.removeItem('signup_attempts')
                            localStorage.removeItem('last_signup_attempt')
                            setFailedAttempts(0)
                            setIsLocked(false)
                          }
                        }}
                        className={`w-5 h-5 hover:scale-105 rounded border flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
                          error 
                            ? 'bg-red-500/20 hover:bg-red-500/40 border-red-500/40' 
                            : 'bg-yellow-500/20 hover:bg-yellow-500/40 border-yellow-500/40'
                        }`}
                      >
                        <X className={`w-2.5 h-2.5 ${error ? 'text-red-200' : 'text-yellow-200'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
