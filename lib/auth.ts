import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { userService } from "@/lib/db/users"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"

// Define NextAuthOptions type locally since it's not exported in this version
interface NextAuthOptions {
  providers: any[]
  session: {
    strategy: string
    maxAge: number
  }
  callbacks: {
    jwt: (params: { token: JWT; user?: any }) => Promise<JWT>
    session: (params: { session: Session; token: JWT }) => Promise<Session>
    redirect: (params: { url: string; baseUrl: string }) => Promise<string>
  }
  pages: {
    signIn: string
    error: string
  }
  secret: string
  debug: boolean
}

// Seed demo users in development
if (process.env.NODE_ENV === "development") {
  // Delay seeding to avoid blocking NextAuth initialization
  setTimeout(() => {
    userService.seedDemoUsers().catch(console.error)
  }, 1000)
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
            console.log("Missing credentials")
            return null
          }

          console.log("Attempting to verify user:", credentials.email)
          const user = await userService.verifyPassword(credentials.email, credentials.password)

          if (!user) {
            console.log("Invalid credentials for:", credentials.email)
            return null
          }

          console.log("User verified successfully:", user.email)
          
          // Update last login
          try {
            await userService.updateLastLogin(user.id)
          } catch (error) {
            console.error("Error updating last login:", error)
            // Don't fail auth if last login update fails
          }

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
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.userData = user.userData
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.userData = token.userData as any
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
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
