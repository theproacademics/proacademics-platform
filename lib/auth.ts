import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { userService } from "@/lib/db/users"

// Seed demo users in development
if (process.env.NODE_ENV === "development") {
  userService.seedDemoUsers().catch(console.error)
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required")
          }

          const user = await userService.verifyPassword(credentials.email, credentials.password)

          if (!user) {
            throw new Error("Invalid credentials")
          }

          // Update last login
          await userService.updateLastLogin(user.id)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            userData: user,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.userData = user.userData
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.userData = token.userData as any
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
  debug: process.env.NODE_ENV === "development",
}

// Helper function to create a new user
export async function createUser(userData: {
  name: string
  nickname?: string
  email: string
  phone?: string
  dateOfBirth: string
  schoolName: string
  uniqueToken: string
  password: string
  role?: string
  deviceFingerprint?: string
  userAgent?: string
  timezone?: string
}) {
  const newUser = await userService.createUser({
    id: `user-${Date.now()}`,
    name: userData.name,
    nickname: userData.nickname || "",
    email: userData.email,
    phone: userData.phone || "",
    dateOfBirth: userData.dateOfBirth,
    schoolName: userData.schoolName,
    uniqueToken: userData.uniqueToken,
    password: userData.password,
    role: (userData.role as any) || "student",
    deviceFingerprint: userData.deviceFingerprint || "",
    userAgent: userData.userAgent || "",
    timezone: userData.timezone || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  }
}

// Helper function to check if user exists
export async function userExists(email: string): Promise<boolean> {
  const user = await userService.findUserByEmail(email)
  return !!user
}
