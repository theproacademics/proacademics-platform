import { NextResponse } from "next/server"
import { userService } from "@/lib/db/users"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  const health = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    status: "unknown",
    checks: {
      database: false,
      mongodb_uri: false,
      nextauth_secret: false,
      admin_exists: false
    },
    errors: [] as string[]
  }

  try {
    // Check MongoDB URI
    if (process.env.MONGODB_URI) {
      health.checks.mongodb_uri = true
    } else {
      health.errors.push("MONGODB_URI environment variable is missing")
    }

    // Check NextAuth Secret
    if (process.env.NEXTAUTH_SECRET) {
      health.checks.nextauth_secret = true
    } else {
      health.errors.push("NEXTAUTH_SECRET environment variable is missing")
    }

    // Test database connection
    try {
      const client = await clientPromise
      await client.db("admin").command({ ping: 1 })
      health.checks.database = true
    } catch (dbError) {
      health.errors.push(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`)
    }

    // Check if admin user exists
    try {
      const users = await userService.getAllUsers()
      const adminExists = users.some(user => user.role === "admin")
      health.checks.admin_exists = adminExists
      
      if (!adminExists) {
        health.errors.push("No admin users found in database")
      }
    } catch (userError) {
      health.errors.push(`User service failed: ${userError instanceof Error ? userError.message : 'Unknown error'}`)
    }

    // Determine overall status
    const allChecks = Object.values(health.checks)
    if (allChecks.every(check => check)) {
      health.status = "healthy"
    } else if (allChecks.some(check => check)) {
      health.status = "degraded"
    } else {
      health.status = "unhealthy"
    }

    return NextResponse.json(health, { 
      status: health.status === "healthy" ? 200 : 500 
    })

  } catch (error) {
    health.status = "error"
    health.errors.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    return NextResponse.json(health, { status: 500 })
  }
} 