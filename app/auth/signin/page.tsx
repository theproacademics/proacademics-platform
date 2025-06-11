"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { signIn, getSession } from "next-auth/react"
import type { Session } from "next-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Brain, ArrowRight, Shield, Users, BookOpen, Sparkles, Star, Cpu, Rocket, Globe, X, Zap, Lock, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Preloader } from "@/components/ui/preloader"
import { usePreloader } from "@/hooks/use-preloader"

const DEMO_ACCOUNTS = [
  { 
    role: "Student", 
    email: "alex@example.com", 
    password: "password123", 
    icon: BookOpen, 
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    description: "Explore learning features"
  },
  { 
    role: "Admin", 
    email: "admin@proacademics.com", 
    password: "password123", 
    icon: Shield, 
    gradient: "from-rose-500 via-pink-500 to-violet-500",
    description: "Access admin dashboard"
  },
  { 
    role: "Teacher", 
    email: "emily@proacademics.com", 
    password: "password123", 
    icon: Users, 
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    description: "Manage student progress"
  },
]

const FEATURES = [
  { 
    icon: Cpu, 
    title: "AI-Powered Learning", 
    desc: "Smart algorithms adapt to your unique style", 
    gradient: "from-blue-400 to-cyan-400" 
  },
  { 
    icon: Zap, 
    title: "Lightning Fast", 
    desc: "Instant feedback and rapid skill development", 
    gradient: "from-yellow-400 to-orange-400" 
  },
  { 
    icon: TrendingUp, 
    title: "Track Progress", 
    desc: "Real-time analytics and achievement system", 
    gradient: "from-green-400 to-emerald-400" 
  },
]

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [deviceFingerprint, setDeviceFingerprint] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
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
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  // Enhanced Memoized particles with more variety
  const particles = useMemo(() => {
    return [...Array(80)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDuration: 2 + Math.random() * 6,
      animationDelay: Math.random() * 4,
      size: Math.random() > 0.7 ? (Math.random() > 0.9 ? 3 : 2) : 1,
      color: Math.random() > 0.6 ? 'blue' : Math.random() > 0.3 ? 'purple' : 'cyan'
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
      color: ['blue', 'purple', 'cyan', 'pink', 'emerald', 'indigo'][i]
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
      const attempts = localStorage.getItem('signin_attempts')
      const lastAttempt = localStorage.getItem('last_attempt')
      const now = Date.now()
      
      if (attempts && lastAttempt) {
        const attemptCount = parseInt(attempts)
        const timeDiff = now - parseInt(lastAttempt)
        
        // Reset after 1 hour
        if (timeDiff > 3600000) {
          localStorage.removeItem('signin_attempts')
          localStorage.removeItem('last_attempt')
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
    style.id = 'autofill-override-signin'
    style.textContent = `
      /* Fix background coverage for all scroll scenarios */
      html, body {
        background: linear-gradient(135deg, #030712 0%, #111827 40%, #000000 100%) !important;
        background-attachment: fixed !important;
        min-height: 100vh !important;
      }
      
      /* Prevent elastic scroll on mobile */
      body {
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
      }
      
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
        const existingStyle = document.getElementById('autofill-override-signin')
        if (existingStyle) document.head.removeChild(existingStyle)
      }
    }
    
    const urlError = searchParams.get("error")
    if (urlError) setError("Authentication failed. Please try again.")
    
    return () => {
      document.body.style.background = ''
      document.documentElement.style.background = ''
      document.body.style.backgroundAttachment = ''
      document.documentElement.style.backgroundAttachment = ''
      const existingStyle = document.getElementById('autofill-override-signin')
      if (existingStyle) document.head.removeChild(existingStyle)
    }
  }, [searchParams])

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Security: Check if account is locked
    if (isLocked) {
      setError("Account temporarily locked due to multiple failed attempts. Please try again later.")
      return
    }
    
    // Security: Sanitize inputs
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)
    
    // Security: Input validation
    if (!sanitizedEmail || !sanitizedPassword) {
      setError("Please fill in all fields")
      return
    }
    
    // Security: Validate email format
    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email address")
      return
    }
    
    // Security: Rate limiting check
    if (!checkRateLimit()) {
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      // Security: Add timestamp and device fingerprint
      const securityData = {
        timestamp: Date.now(),
        deviceFingerprint,
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        platform: navigator.platform
      }
      
      const result = await signIn("credentials", {
        email: sanitizedEmail.trim(),
        password: sanitizedPassword,
        redirect: false,
        securityData: JSON.stringify(securityData)
      })

      if (result?.error) {
        // Security: Track failed attempts
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)
        localStorage.setItem('signin_attempts', newAttempts.toString())
        localStorage.setItem('last_attempt', Date.now().toString())
        
        // Security: Progressive delay for failed attempts
        const delay = Math.min(1000 * Math.pow(2, newAttempts - 1), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        if (newAttempts >= 5) {
          setIsLocked(true)
          setError("Account locked due to multiple failed attempts. Please try again in 1 hour.")
        } else {
        setError("Invalid email or password")
        }
        
        // Security: Log suspicious activity
        console.warn('Failed login attempt:', {
          email: sanitizedEmail,
          attempts: newAttempts,
          timestamp: new Date().toISOString(),
          deviceFingerprint: deviceFingerprint.slice(0, 20) + '...'
        })
        
      } else if (result?.ok) {
        // Security: Clear failed attempts on successful login
        localStorage.removeItem('signin_attempts')
        localStorage.removeItem('last_attempt')
        setFailedAttempts(0)
        setIsLocked(false)
        
        // Security: Log successful login
        console.log('Successful login:', {
          email: sanitizedEmail,
          timestamp: new Date().toISOString(),
          deviceFingerprint: deviceFingerprint.slice(0, 20) + '...'
        })
        
        const session = await getSession() as Session | null
        router.push(session?.user?.role === "admin" ? "/admin" : "/")
        router.refresh()
      }
    } catch (error) {
      console.error('Connection error during login:', error)
      setError("Connection error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError("")
  }

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />
  }

  // Show preloader
  if (showPreloader) {
    return <Preloader isVisible={showPreloader} colorScheme="blue" loadingText="Preparing your sign in experience" />
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative"
      style={{
        background: 'linear-gradient(135deg, #030712 0%, #111827 40%, #000000 100%)',
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
          background: 'linear-gradient(135deg, #030712 0%, #111827 40%, #000000 100%)'
        }}
      />

      {/* Enhanced Grid Pattern - More Visible */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none z-0">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
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
            blue: particle.size === 3 ? 'bg-blue-400/60 shadow-lg shadow-blue-400/30' : particle.size === 2 ? 'bg-blue-400/45' : 'bg-blue-400/30',
            purple: particle.size === 3 ? 'bg-purple-400/60 shadow-lg shadow-purple-400/30' : particle.size === 2 ? 'bg-purple-400/45' : 'bg-purple-400/30',
            cyan: particle.size === 3 ? 'bg-cyan-400/60 shadow-lg shadow-cyan-400/30' : particle.size === 2 ? 'bg-cyan-400/45' : 'bg-cyan-400/30'
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
            blue: 'from-blue-500/10 to-blue-400/20',
            purple: 'from-purple-500/10 to-purple-400/20',
            cyan: 'from-cyan-500/10 to-cyan-400/20',
            pink: 'from-pink-500/10 to-pink-400/20',
            emerald: 'from-emerald-500/10 to-emerald-400/20',
            indigo: 'from-indigo-500/10 to-indigo-400/20'
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
          className="absolute w-32 h-32 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl"
          style={{
            top: '10%',
            left: '15%',
            animation: 'float3d 6s ease-in-out infinite',
            transform: 'translateZ(0)'
          }}
        />
        <div 
          className="absolute w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"
          style={{
            bottom: '20%',
            right: '20%',
            animation: 'float3d 8s ease-in-out infinite reverse',
            transform: 'translateZ(0)'
          }}
        />
        <div 
          className="absolute w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl"
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
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(59, 130, 246, 0.4);
          }
          80% { 
            transform: translateX(100px) translateY(-40px) scale(1) rotate(45deg);
            opacity: 1;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(147, 51, 234, 0.4);
          }
          90% { 
            transform: translateX(150px) translateY(-50px) scale(0.5) rotate(45deg);
            opacity: 0.5;
            box-shadow: 0 0 10px rgba(147, 51, 234, 0.3);
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
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.3), inset 0 0 10px rgba(59, 130, 246, 0.1);
          }
          50% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(59, 130, 246, 0.2);
          }
        }
        @keyframes input-focus {
          0% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
          100% { 
            transform: scale(1.01);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }
        }
        @keyframes typing-glow {
          0%, 100% { 
            box-shadow: inset 0 0 10px rgba(59, 130, 246, 0.1);
          }
          50% { 
            box-shadow: inset 0 0 15px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-16 items-center">
            
            {/* Left Panel - Hero Section */}
            <div className="hidden lg:flex flex-col justify-center space-y-6 py-4">
              
              {/* Logo & Brand */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative group">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                      <Brain className="w-5 h-5 text-white" />
                </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
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
                  <h2 className="text-3xl xl:text-4xl font-semibold leading-tight tracking-tight text-white">
                    Welcome Back to
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Smart Learning
                </span>
              </h2>
                  <p className="text-sm text-gray-300 leading-relaxed max-w-md">
                    Continue your journey with AI-powered education. Your personalized learning experience awaits.
              </p>
                </div>
            </div>

            {/* Enhanced Features */}
              <div className="space-y-2">
              {FEATURES.map((feature, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <div className={`w-8 h-8 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10`}>
                        <feature.icon className="w-4 h-4 text-white group-hover:scale-125 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <h3 className="text-sm font-medium text-white mb-0.5 truncate group-hover:text-blue-200 transition-colors duration-300">{feature.title}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{feature.desc}</p>
                      </div>
                  </div>
                </div>
              ))}
            </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-between max-w-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white mb-0.5">50K+</div>
                  <div className="text-gray-400 text-xs">Students</div>
                  </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white mb-0.5">98%</div>
                  <div className="text-gray-400 text-xs">Success</div>
                  </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white mb-0.5">24/7</div>
                  <div className="text-gray-400 text-xs">Support</div>
                </div>
              </div>
          </div>

            {/* Right Panel - Auth Forms */}
            <div className="flex flex-col justify-center space-y-6 w-full max-w-sm mx-auto lg:ml-8 lg:mr-0 py-4">
            
            {/* Mobile Logo */}
              <div className="lg:hidden text-center space-y-2">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold text-white">
                    ProAcademics
                  </h1>
                </div>
                <p className="text-gray-400 text-xs">Welcome back to smart learning</p>
            </div>

              {/* Login Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-900/60">
                  <CardHeader className="text-center space-y-1 pb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4 text-blue-400" />
                      Sign In
                    </CardTitle>
                    <p className="text-gray-400 text-xs">Continue your learning journey</p>
              </CardHeader>
                  <CardContent className="space-y-3">
                    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                      
                      {/* Email Field */}
                      <div className="space-y-1 group">
                        <Label htmlFor="email" className="text-gray-300 text-xs font-medium transition-all duration-300 group-focus-within:text-blue-400 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                          Email
                        </Label>
                        <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                            onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                      placeholder="Enter your email"
                            className="bg-gray-800/40 border-gray-600/50 text-white placeholder-gray-500 h-9 rounded-lg text-xs transition-all duration-300 hover:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 hover:bg-gray-800/60 focus:bg-gray-800/70 group-focus-within:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
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
                              e.target.style.border = '1px solid rgba(59, 130, 246, 0.8)';
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
                          {email && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                            </div>
                          )}
                        </div>
                  </div>
                  
                      {/* Password Field */}
                      <div className="space-y-1 group">
                    <div className="flex justify-between items-center">
                          <Label htmlFor="password" className="text-gray-300 text-xs font-medium transition-all duration-300 group-focus-within:text-blue-400 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                            Password
                          </Label>
                          <Link href="/auth/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] hover:scale-105">
                            Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                            onChange={(e) => setPassword(sanitizeInput(e.target.value))}
                        placeholder="Enter your password"
                            className="bg-gray-800/40 border-gray-600/50 text-white placeholder-gray-500 h-9 rounded-lg text-xs pr-9 transition-all duration-300 hover:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 hover:bg-gray-800/60 focus:bg-gray-800/70 group-focus-within:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
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
                              e.target.style.border = '1px solid rgba(59, 130, 246, 0.8)';
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
                        onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:bg-gray-700/30 rounded-r-lg group-focus-within:text-blue-400"
                            style={{
                              outline: 'none',
                              boxShadow: 'none'
                            } as React.CSSProperties}
                            onFocus={(e) => {
                              e.target.style.outline = 'none'
                              e.target.style.boxShadow = 'none'
                            }}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 transition-transform duration-300" /> : <Eye className="h-4 w-4 transition-transform duration-300" />}
                          </button>
                          {password && (
                            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                            </div>
                          )}
                    </div>
                  </div>

                      {/* Submit Button */}
                  <Button
                    type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium h-9 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 text-xs relative overflow-hidden group"
                        style={{
                          background: isLoading ? 'linear-gradient(45deg, #3b82f6, #8b5cf6, #3b82f6)' : undefined,
                          backgroundSize: isLoading ? '200% 200%' : undefined,
                          animation: isLoading ? 'pulse-glow 2s ease-in-out infinite' : undefined
                        }}
                        disabled={isLoading || isLocked}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {isLoading ? (
                          <div className="flex items-center justify-center space-x-2 relative z-10">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                            <span className="text-xs">Signing in...</span>
                      </div>
                    ) : (
                          <div className="flex items-center justify-center space-x-2 relative z-10 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-xs">Sign In</span>
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </form>

                    {/* Sign Up Link */}
                <div className="text-center">
                      <p className="text-gray-400 text-xs">
                        New here?{" "}
                        <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-medium">
                      Create Account
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
                              localStorage.removeItem('signin_attempts')
                              localStorage.removeItem('last_attempt')
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

              {/* Demo Accounts */}
              <div className="relative">
                <Card className="relative bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 shadow-lg shadow-gray-900/20 hover:bg-gray-900/60 transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-3 h-3 text-yellow-400 animate-pulse" />
                      <CardTitle className="text-sm text-white font-medium">Quick Demo</CardTitle>
                    </div>
                    <p className="text-gray-400 text-xs">Try different roles</p>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {DEMO_ACCOUNTS.map((account, i) => (
                      <button
                        key={i}
                        onClick={() => handleDemoLogin(account)}
                        className="w-full p-2 bg-gray-800/30 hover:bg-gray-900/60 rounded-lg transition-all duration-300 group/demo flex items-center space-x-2.5 border border-gray-700/30 hover:border-gray-700/50 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden"
                        disabled={isLoading}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/demo:translate-x-full transition-transform duration-700"></div>
                        <div className={`w-6 h-6 bg-gradient-to-r ${account.gradient} rounded-md flex items-center justify-center shadow-sm group-hover/demo:scale-110 transition-transform duration-300 relative z-10`}>
                          <account.icon className="w-3 h-3 text-white transition-transform duration-300 group-hover/demo:rotate-12" />
                        </div>
                        <div className="text-left flex-1 min-w-0 relative z-10">
                          <div className="text-white font-medium text-xs truncate">{account.role}</div>
                          <div className="text-gray-400 text-xs truncate">{account.description}</div>
                    </div>
                        <ArrowRight className="w-2.5 h-2.5 text-gray-400 group-hover/demo:text-white transition-all duration-300 flex-shrink-0 group-hover/demo:translate-x-1 relative z-10" />
                  </button>
                ))}
              </CardContent>
            </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}