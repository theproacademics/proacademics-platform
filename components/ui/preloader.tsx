"use client"

import React, { useState, useEffect } from "react"
import { Brain, Sparkles } from "lucide-react"

interface PreloaderProps {
  isVisible: boolean
  loadingText?: string
  colorScheme?: 'blue' | 'green' | 'purple' | 'default'
}

export const Preloader = ({ 
  isVisible, 
  loadingText = "Loading your experience",
  colorScheme = 'default'
}: PreloaderProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  if (!isVisible) return null

  // Color schemes for different pages
  const colorSchemes = {
    blue: {
      orbs: ['bg-blue-500/10', 'bg-purple-500/10', 'bg-cyan-500/8'],
      particles: 'bg-blue-400/60',
      glow: 'from-blue-500/30 to-purple-500/30',
      logo: 'from-blue-400 via-purple-400 to-cyan-400',
      brain: 'text-blue-400',
      sparkles: 'text-purple-400',
      progress: 'from-blue-500 via-purple-500 to-cyan-500',
      dots: 'bg-blue-400'
    },
    green: {
      orbs: ['bg-green-500/10', 'bg-emerald-500/10', 'bg-teal-500/8'],
      particles: 'bg-green-400/60',
      glow: 'from-green-500/30 to-emerald-500/30',
      logo: 'from-green-400 via-emerald-400 to-teal-400',
      brain: 'text-green-400',
      sparkles: 'text-emerald-400',
      progress: 'from-green-500 via-emerald-500 to-teal-500',
      dots: 'bg-green-400'
    },
    purple: {
      orbs: ['bg-purple-500/10', 'bg-pink-500/10', 'bg-indigo-500/8'],
      particles: 'bg-purple-400/60',
      glow: 'from-purple-500/30 to-pink-500/30',
      logo: 'from-purple-400 via-pink-400 to-indigo-400',
      brain: 'text-purple-400',
      sparkles: 'text-pink-400',
      progress: 'from-purple-500 via-pink-500 to-indigo-500',
      dots: 'bg-purple-400'
    },
    default: {
      orbs: ['bg-blue-500/10', 'bg-purple-500/10', 'bg-cyan-500/8'],
      particles: 'bg-blue-400/60',
      glow: 'from-blue-500/30 to-purple-500/30',
      logo: 'from-blue-400 via-purple-400 to-cyan-400',
      brain: 'text-blue-400',
      sparkles: 'text-purple-400',
      progress: 'from-blue-500 via-purple-500 to-cyan-500',
      dots: 'bg-blue-400'
    }
  }

  const colors = colorSchemes[colorScheme]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        
        {/* Floating orbs */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${colors.orbs[0]} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 ${colors.orbs[1]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-3/4 left-1/3 w-72 h-72 ${colors.orbs[2]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
        
        {/* Animated particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 ${colors.particles} rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo Container */}
        <div className="mb-12">
          <div className="relative">
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${colors.glow} rounded-3xl blur-2xl animate-pulse`}></div>
            
            {/* Logo */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h1 className={`text-6xl md:text-8xl font-black text-transparent bg-gradient-to-r ${colors.logo} bg-clip-text animate-gradient`}>
                ProAcademics
              </h1>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Brain className={`w-6 h-6 ${colors.brain} animate-pulse`} />
                <p className="text-xl text-slate-300 font-medium">Intelligent Learning Platform</p>
                <Sparkles className={`w-6 h-6 ${colors.sparkles} animate-pulse`} />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-80 mx-auto">
            <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden border border-white/10">
              <div 
                className={`absolute left-0 top-0 h-full bg-gradient-to-r ${colors.progress} rounded-full transition-all duration-300 ease-out`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-slate-400 mt-2">
              <span>Loading...</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Loading Text */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 ${colors.dots} rounded-full animate-bounce`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <p className="text-slate-300 text-lg font-medium">
              {loadingText}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 