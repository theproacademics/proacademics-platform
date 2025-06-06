import { NextResponse } from "next/server"
import { createUser, userExists } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    // Validation
    if (!name || !email || !password) {
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
    const user = await createUser({ name, email, password, role })

    return NextResponse.json({ message: "User created successfully", user }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
