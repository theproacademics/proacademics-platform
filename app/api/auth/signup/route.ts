import { NextResponse } from "next/server"
import { createUser, userExists } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { 
      name, 
      nickname, 
      email, 
      phone, 
      dateOfBirth, 
      schoolName, 
      uniqueToken, 
      password, 
      role,
      deviceFingerprint,
      timestamp,
      userAgent,
      timezone
    } = await req.json()

    // Validation
    if (!name || !email || !password || !dateOfBirth || !schoolName || !uniqueToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists
    if (await userExists(email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create user
    const user = await createUser({ 
      name, 
      nickname, 
      email, 
      phone, 
      dateOfBirth, 
      schoolName, 
      uniqueToken, 
      password, 
      role,
      deviceFingerprint,
      userAgent,
      timezone
    })

    return NextResponse.json({ message: "User created successfully", user }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
