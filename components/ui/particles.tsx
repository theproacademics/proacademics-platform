"use client"

import { useEffect, useRef } from "react"

interface ParticlesProps {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  color?: string
  vx?: number
  vy?: number
}

export default function Particles({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<any[]>([])
  const mousePosition = useRef({ x: 0, y: 0 })
  const animationFrame = useRef<number>()

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d")
    }
    initCanvas()
    animate()
    
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        mousePosition.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }
    }

    const handleResize = () => {
      initCanvas()
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const initCanvas = () => {
    if (!canvasContainerRef.current || !canvasRef.current || !context.current) return

    circles.current.length = 0
    
    const canvas = canvasRef.current
    const container = canvasContainerRef.current
    
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight

    for (let i = 0; i < quantity; i++) {
      circles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        translateX: 0,
        translateY: 0,
        size: Math.random() * 2 + size,
        alpha: Math.random() * 0.5 + 0.1,
        targetAlpha: Math.random() * 0.6 + 0.1,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        magnetism: 0.1 + Math.random() * 4,
      })
    }
  }

  const animate = () => {
    if (!context.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = context.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    circles.current.forEach((circle: any, i: number) => {
      // Handle movement
      circle.x += circle.dx
      circle.y += circle.dy

      // Boundary checking
      if (circle.x < 0 || circle.x > canvas.width) circle.dx = -circle.dx
      if (circle.y < 0 || circle.y > canvas.height) circle.dy = -circle.dy

      // Mouse interaction
      const distance = Math.sqrt(
        (mousePosition.current.x - circle.x) ** 2 + (mousePosition.current.y - circle.y) ** 2
      )

      if (distance < 100) {
        const angle = Math.atan2(mousePosition.current.y - circle.y, mousePosition.current.x - circle.x)
        const force = (100 - distance) / 100

        circle.translateX = Math.cos(angle) * force * 10
        circle.translateY = Math.sin(angle) * force * 10
        circle.targetAlpha = 0.8
      } else {
        circle.translateX *= 0.95
        circle.translateY *= 0.95
        circle.targetAlpha = circle.alpha
      }

      // Update alpha with smooth transition
      circle.alpha += (circle.targetAlpha - circle.alpha) * 0.1

      // Draw particle
      ctx.beginPath()
      ctx.arc(
        circle.x + circle.translateX, 
        circle.y + circle.translateY, 
        circle.size, 
        0, 
        Math.PI * 2
      )

      ctx.fillStyle = `rgba(${hexToRgb(color)}, ${circle.alpha})`
      ctx.fill()

      // Draw connecting lines
      circles.current.slice(i + 1).forEach((otherCircle: any) => {
        const dx = circle.x - otherCircle.x
        const dy = circle.y - otherCircle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          ctx.beginPath()
          ctx.moveTo(circle.x + circle.translateX, circle.y + circle.translateY)
          ctx.lineTo(otherCircle.x + otherCircle.translateX, otherCircle.y + otherCircle.translateY)
          
          const opacity = (150 - distance) / 150 * 0.1
          ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${opacity})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })
    })

    animationFrame.current = requestAnimationFrame(animate)
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "255, 255, 255"
  }

  return (
    <div className={className} ref={canvasContainerRef} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
} 