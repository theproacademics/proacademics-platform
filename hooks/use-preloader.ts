"use client"

import { useState, useEffect } from "react"

interface UsePreloaderOptions {
  delay?: number // Duration to show preloader in milliseconds
  dependencies?: any[] // Dependencies to wait for before hiding preloader
}

export const usePreloader = ({ 
  delay = 2000, 
  dependencies = [] 
}: UsePreloaderOptions = {}) => {
  const [showPreloader, setShowPreloader] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Check if all dependencies are loaded
      const allDependenciesReady = dependencies.length === 0 || 
        dependencies.every(dep => dep !== null && dep !== undefined)

      if (allDependenciesReady) {
        const timer = setTimeout(() => {
          setShowPreloader(false)
        }, delay)
        
        return () => clearTimeout(timer)
      }
    }
  }, [mounted, delay, ...dependencies])

  return {
    showPreloader,
    mounted,
    hidePreloader: () => setShowPreloader(false)
  }
} 