import { NextResponse } from "next/server"
import { userService } from "@/lib/db/users"

export async function POST(request: Request) {
  try {
    // Only allow this in production setup or if no admin exists
    const { adminEmail, adminPassword, adminName, setupKey } = await request.json()
    
    // Basic security check (you should use a proper setup key)
    if (setupKey !== process.env.ADMIN_SETUP_KEY && setupKey !== "setup-admin-2024") {
      return NextResponse.json({ error: "Invalid setup key" }, { status: 401 })
    }

    // Check if any admin already exists
    const existingAdmins = await userService.getAllUsers()
    const adminExists = existingAdmins.some(user => user.role === "admin")
    
    if (adminExists && process.env.NODE_ENV === "production") {
      return NextResponse.json({ 
        message: "Admin user already exists",
        admins: existingAdmins.filter(u => u.role === "admin").map(u => ({ email: u.email, name: u.name }))
      })
    }

    // Create production admin
    const admin = await userService.createProductionAdmin({
      name: adminName || "Production Admin",
      email: adminEmail || "admin@proacademics.com",
      password: adminPassword || "secure-admin-password-2024"
    })

    if (admin) {
      return NextResponse.json({ 
        success: true,
        message: "Admin user created successfully",
        admin: { email: admin.email, name: admin.name, role: admin.role }
      })
    } else {
      return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
    }

  } catch (error) {
    console.error("Error in admin setup:", error)
    return NextResponse.json({ 
      error: "Failed to setup admin user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if admin users exist
    const users = await userService.getAllUsers()
    const admins = users.filter(user => user.role === "admin")
    
    return NextResponse.json({
      adminExists: admins.length > 0,
      adminCount: admins.length,
      admins: admins.map(admin => ({ 
        email: admin.email, 
        name: admin.name,
        createdAt: admin.createdAt 
      }))
    })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ 
      error: "Failed to check admin status",
      adminExists: false
    }, { status: 500 })
  }
} 