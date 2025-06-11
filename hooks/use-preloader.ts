"use client"

import { useState, useEffect, useRef } from "react"

interface UsePreloaderOptions {
  delay?: number // Minimum duration to show preloader in milliseconds
  dependencies?: any[] // Dependencies to wait for before hiding preloader
  waitForImages?: boolean // Wait for images to load
  waitForFonts?: boolean // Wait for fonts to load
}

export const usePreloader = ({ 
  delay = 1500, 
  dependencies = [],
  waitForImages = true,
  waitForFonts = true
}: UsePreloaderOptions = {}) => {
  const [showPreloader, setShowPreloader] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
    startTimeRef.current = Date.now()
  }, [])

  // Wait for document ready state and various resources
  useEffect(() => {
    if (!mounted) return

    const checkReadiness = async () => {
      try {
        // Check if all dependencies are loaded
        const allDependenciesReady = dependencies.length === 0 || 
          dependencies.every(dep => dep !== null && dep !== undefined)

        if (!allDependenciesReady) return

        // Wait for DOM to be ready
        if (document.readyState === 'loading') return

        // Wait for images if required
        if (waitForImages) {
          const images = Array.from(document.images)
          const imagePromises = images.map(img => {
            if (img.complete) return Promise.resolve()
            return new Promise((resolve) => {
              img.onload = img.onerror = resolve
            })
          })
          await Promise.all(imagePromises)
        }

        // Wait for fonts if required
        if (waitForFonts && 'fonts' in document) {
          await document.fonts.ready
        }

        // Ensure minimum delay has passed
        const elapsedTime = Date.now() - startTimeRef.current
        const remainingDelay = Math.max(0, delay - elapsedTime)

        setTimeout(() => {
          setContentReady(true)
        }, remainingDelay)

      } catch (error) {
        console.warn('Preloader readiness check failed:', error)
        // Fallback to delay-based hiding
        const elapsedTime = Date.now() - startTimeRef.current
        const remainingDelay = Math.max(0, delay - elapsedTime)
        setTimeout(() => {
          setContentReady(true)
        }, remainingDelay)
      }
    }

    checkReadiness()

    // Also listen for document ready state changes
    const handleReadyStateChange = () => {
      if (document.readyState === 'complete') {
        checkReadiness()
      }
    }

    document.addEventListener('readystatechange', handleReadyStateChange)
    
    // Fallback timeout to ensure preloader doesn't stay forever
    const fallbackTimer = setTimeout(() => {
      setContentReady(true)
    }, delay + 2000) // 2 seconds buffer

    return () => {
      document.removeEventListener('readystatechange', handleReadyStateChange)
      clearTimeout(fallbackTimer)
    }
  }, [mounted, delay, waitForImages, waitForFonts, ...dependencies])

  // Hide preloader when content is ready
  useEffect(() => {
    if (contentReady) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setShowPreloader(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [contentReady])

  return {
    showPreloader,
    mounted,
    contentReady,
    hidePreloader: () => {
      setContentReady(true)
      setShowPreloader(false)
    }
  }
} 