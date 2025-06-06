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
import { Eye, EyeOff, Brain, Trophy, Zap, ArrowRight, Shield, Users, BookOpen, Sparkles, Star, Award, Cpu, Rocket, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
    title: "Neural Learning", 
    desc: "Advanced AI adapts to your learning patterns in real-time", 
    gradient: "from-blue-400 to-cyan-400" 
  },
  { 
    icon: Rocket, 
    title: "Accelerated Growth", 
    desc: "Boost your progress with personalized study paths", 
    gradient: "from-purple-400 to-pink-400" 
  },
  { 
    icon: Globe, 
    title: "Global Community", 
    desc: "Connect with learners worldwide and share insights", 
    gradient: "from-green-400 to-emerald-400" 
  },
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
    // Set comprehensive background to prevent over-scroll issues
    const bodyBg = 'linear-gradient(135deg, #030712 0%, #111827 40%, #000000 100%)'
    document.body.style.background = bodyBg
    document.documentElement.style.background = bodyBg
    document.body.style.backgroundAttachment = 'fixed'
    document.documentElement.style.backgroundAttachment = 'fixed'
    
    const urlError = searchParams.get("error")
    if (urlError) setError("Authentication failed. Please try again.")
    
    return () => {
      document.body.style.background = ''
      document.documentElement.style.background = ''
      document.body.style.backgroundAttachment = ''
      document.documentElement.style.backgroundAttachment = ''
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
      } else if (result?.ok) {
        const session = await getSession() as Session | null
        router.push(session?.user?.role === "admin" ? "/admin" : "/")
        router.refresh()
      }
    } catch (error) {
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

      {/* Subtle Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
                         {/* Left Panel - Hero Section */}
             <div className="hidden lg:flex flex-col justify-center space-y-10">
               
               {/* Logo & Brand */}
               <div className="space-y-8">
                 <div className="flex items-center space-x-3">
                   <div className="relative">
                     <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                       <Brain className="w-6 h-6 text-white" />
                     </div>
                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                       <Sparkles className="w-2 h-2 text-white" />
                     </div>
                   </div>
                   <div>
                     <h1 className="text-2xl font-semibold text-white">
                       ProAcademics
                     </h1>
                     <p className="text-gray-400 text-sm">Next-Gen Learning Platform</p>
                   </div>
                 </div>

                 <div className="space-y-6">
                   <h2 className="text-5xl font-semibold leading-tight tracking-tight text-white">
                     Future of
                     <br />
                     <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                       Education
                     </span>
                   </h2>
                   <p className="text-lg text-gray-300 leading-relaxed max-w-md font-normal">
                     Harness the power of AI to unlock your potential. Experience personalized learning that evolves with you.
                   </p>
                 </div>
               </div>

                                            {/* Enhanced Features */}
               <div className="space-y-3">
                 {FEATURES.map((feature, i) => (
                   <div key={i} className="group">
                     <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                       <div className={`w-10 h-10 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center`}>
                         <feature.icon className="w-5 h-5 text-white" />
                       </div>
                       <div className="flex-1">
                         <h3 className="text-base font-medium text-white mb-1">{feature.title}</h3>
                         <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Trust Indicators */}
               <div className="flex items-center space-x-6">
                 <div className="text-center">
                   <div className="text-2xl font-semibold text-white mb-1">50K+</div>
                   <div className="text-gray-400 text-xs">Students</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-semibold text-white mb-1">98%</div>
                   <div className="text-gray-400 text-xs">Success Rate</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-semibold text-white mb-1">24/7</div>
                   <div className="text-gray-400 text-xs">AI Support</div>
                 </div>
               </div>
            </div>

                         {/* Right Panel - Auth Forms */}
             <div className="flex flex-col justify-center space-y-8 w-full max-w-sm mx-auto lg:mx-0 py-8 lg:py-0">
               
               {/* Mobile Logo */}
               <div className="lg:hidden text-center space-y-3 pt-8">
                 <div className="flex items-center justify-center space-x-3">
                   <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                     <Brain className="w-5 h-5 text-white" />
                   </div>
                   <h1 className="text-2xl font-semibold text-white">
                     ProAcademics
                   </h1>
                 </div>
                 <p className="text-gray-400 text-sm">Welcome back to the future of learning</p>
               </div>

               {/* Login Card */}
               <Card className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50">
                 <CardHeader className="text-center space-y-1 pb-6">
                   <CardTitle className="text-2xl font-semibold text-white">Sign In</CardTitle>
                   <p className="text-gray-400 text-sm">Continue your learning journey</p>
                 </CardHeader>
                                 <CardContent className="space-y-5">
                   <form onSubmit={handleSubmit} className="space-y-4">
                     
                     {/* Email Field */}
                     <div className="space-y-2">
                       <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email</Label>
                       <Input
                         id="email"
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         placeholder="Enter your email"
                         className="bg-gray-800/40 border-gray-600/50 text-white placeholder-gray-500 h-11 rounded-lg text-sm transition-all duration-200 hover:border-gray-500"
                         style={{
                           outline: 'none',
                           boxShadow: 'none',
                           border: '1px solid rgba(75, 85, 99, 0.5)'
                         }}
                         onFocus={(e) => {
                           e.target.style.outline = 'none'
                           e.target.style.boxShadow = 'none'
                           e.target.style.border = '1px solid rgba(75, 85, 99, 0.5)'
                         }}
                         disabled={isLoading}
                       />
                     </div>
                     
                     {/* Password Field */}
                     <div className="space-y-2">
                       <div className="flex justify-between items-center">
                         <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Password</Label>
                         <Link href="/auth/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                           Forgot?
                         </Link>
                       </div>
                       <div className="relative">
                         <Input
                           id="password"
                           type={showPassword ? "text" : "password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="Enter your password"
                           className="bg-gray-800/40 border-gray-600/50 text-white placeholder-gray-500 h-11 rounded-lg text-sm pr-11 transition-all duration-200 hover:border-gray-500"
                           style={{
                             outline: 'none',
                             boxShadow: 'none',
                             border: '1px solid rgba(75, 85, 99, 0.5)'
                           }}
                           onFocus={(e) => {
                             e.target.style.outline = 'none'
                             e.target.style.boxShadow = 'none'
                             e.target.style.border = '1px solid rgba(75, 85, 99, 0.5)'
                           }}
                           disabled={isLoading}
                         />
                         <Button
                           type="button"
                           variant="ghost"
                           size="sm"
                           className="absolute right-0 top-0 h-11 px-3 text-gray-400 hover:text-white"
                           onClick={() => setShowPassword(!showPassword)}
                         >
                           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         </Button>
                       </div>
                     </div>

                    {/* Error Message */}
                    {error && (
                      <div className="text-sm text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                        {error}
                      </div>
                    )}

                                         {/* Submit Button */}
                     <Button
                       type="submit"
                       className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium h-11 rounded-lg transition-all duration-200"
                       disabled={isLoading}
                     >
                       {isLoading ? (
                         <div className="flex items-center space-x-2">
                           <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                           <span className="text-sm">Signing in...</span>
                         </div>
                       ) : (
                         <div className="flex items-center space-x-2">
                           <span className="text-sm">Sign In</span>
                           <ArrowRight className="h-4 w-4" />
                         </div>
                       )}
                     </Button>
                   </form>

                   {/* Sign Up Link */}
                   <div className="text-center">
                     <p className="text-gray-400 text-sm">
                       New here?{" "}
                       <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                         Create Account
                       </Link>
                     </p>
                   </div>
                 </CardContent>
               </Card>

               {/* Demo Accounts */}
               <Card className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30">
                 <CardHeader className="pb-3">
                   <div className="flex items-center space-x-2">
                     <Star className="w-4 h-4 text-yellow-400" />
                     <CardTitle className="text-base text-white font-medium">Demo Access</CardTitle>
                   </div>
                   <p className="text-gray-400 text-xs">Try different user roles</p>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   {DEMO_ACCOUNTS.map((account, i) => (
                     <button
                       key={i}
                       onClick={() => handleDemoLogin(account)}
                       className="w-full p-2.5 bg-gray-800/30 hover:bg-gray-700/40 rounded-lg transition-all duration-200 group flex items-center space-x-3 border border-gray-700/30 hover:border-gray-600/50"
                       disabled={isLoading}
                     >
                       <div className={`w-8 h-8 bg-gradient-to-r ${account.gradient} rounded-lg flex items-center justify-center`}>
                         <account.icon className="w-4 h-4 text-white" />
                       </div>
                       <div className="text-left flex-1">
                         <div className="text-white font-medium text-xs">{account.role}</div>
                         <div className="text-gray-400 text-xs">{account.description}</div>
                       </div>
                       <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                     </button>
                   ))}
                 </CardContent>
               </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}