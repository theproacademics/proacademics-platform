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
    <>
      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-safe-area {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 min-h-screen mobile-safe-area">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
          
          {/* Floating orbs - responsive sizes */}
          <div className={`absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 ${colors.orbs[0]} rounded-full blur-2xl sm:blur-3xl animate-pulse`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 ${colors.orbs[1]} rounded-full blur-2xl sm:blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
          <div className={`absolute top-3/4 left-1/3 w-36 h-36 sm:w-56 sm:h-56 lg:w-72 lg:h-72 ${colors.orbs[2]} rounded-full blur-2xl sm:blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
          
          {/* Animated particles - fewer on mobile */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-0.5 h-0.5 sm:w-1 sm:h-1 ${colors.particles} rounded-full animate-pulse hidden sm:block`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
          
          {/* Mobile-only particles - fewer and positioned better */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`mobile-${i}`}
              className={`absolute w-0.5 h-0.5 ${colors.particles} rounded-full animate-pulse sm:hidden`}
              style={{
                left: `${20 + Math.random() * 60}%`, // Keep particles more centered on mobile
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-lg sm:max-w-xl lg:max-w-4xl mx-auto w-full">
          {/* Logo Container */}
          <div className="mb-8 sm:mb-12">
            <div className="relative">
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.glow} rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl animate-pulse`}></div>
              
              {/* Logo */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-transparent bg-gradient-to-r ${colors.logo} bg-clip-text animate-gradient leading-tight`}>
                  ProAcademics
                </h1>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 sm:mt-4 flex-wrap">
                  <Brain className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${colors.brain} animate-pulse flex-shrink-0`} />
                  <p className="text-sm sm:text-lg lg:text-xl text-slate-300 font-medium text-center">
                    Intelligent Learning Platform
                  </p>
                  <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${colors.sparkles} animate-pulse flex-shrink-0`} />
                </div>
              </div>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="space-y-4 sm:space-y-6">
            {/* Progress Bar */}
            <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg mx-auto">
              <div className="relative h-2 sm:h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/10">
                <div 
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${colors.progress} rounded-full transition-all duration-300 ease-out`}
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-400 mt-2">
                <span>Loading...</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* Loading Text */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex gap-1 flex-shrink-0">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${colors.dots} rounded-full animate-bounce`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-medium text-center">
                {loadingText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 