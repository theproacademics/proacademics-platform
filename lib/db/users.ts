import { MongoClient, Db, Collection } from "mongodb"
import bcrypt from "bcryptjs"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export interface User {
  _id?: string
  id: string
  name: string
  email: string
  password: string
  role: "student" | "teacher" | "admin" | "parent"
  avatar?: string
  xp?: number
  level?: number
  predictedGrade?: string
  currentWorkingAverage?: number
  studyStreak?: number
  lastLogin?: Date
  enrolledPrograms?: string[]
  parentId?: string
  weakTopics?: string[]
  strongTopics?: string[]
  recentTopics?: string[]
  permissions?: string[]
  subjects?: string[]
  createdAt: Date
  updatedAt: Date
  isEmailVerified?: boolean
  resetPasswordToken?: string
  resetPasswordExpires?: Date
}

class UserService {
  private async getCollection(): Promise<Collection<User>> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "proacademics")
    return db.collection<User>("users")
  }

  async createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
    const collection = await this.getCollection()
    
    // Check if user already exists
    const existingUser = await collection.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const now = new Date()
    const newUser: User = {
      ...userData,
      password: hashedPassword,
      xp: userData.xp || 0,
      level: userData.level || 1,
      studyStreak: userData.studyStreak || 0,
      currentWorkingAverage: userData.currentWorkingAverage || 0,
      isEmailVerified: false,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(newUser)
    return { ...newUser, _id: result.insertedId.toString() }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ email })
  }

  async findUserById(id: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ id })
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: "after" }
    )
    return result.value
  }

  async updateLastLogin(id: string): Promise<void> {
    const collection = await this.getCollection()
    await collection.updateOne(
      { id },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        } 
      }
    )
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    return user
  }

  // Password reset functionality
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.findUserById(userId)
    if (!user) return false

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isOldPasswordValid) return false

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password
    const collection = await this.getCollection()
    await collection.updateOne(
      { id: userId },
      { 
        $set: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        } 
      }
    )

    return true
  }

  // Admin password reset (without requiring old password)
  async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { id: userId },
      { 
        $set: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        } 
      }
    )

    return result.modifiedCount > 0
  }

  // Generate password reset token
  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findUserByEmail(email)
    if (!user) return null

    // Generate secure random token
    const resetToken = require('crypto').randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    const collection = await this.getCollection()
    await collection.updateOne(
      { email },
      { 
        $set: { 
          resetPasswordToken: await bcrypt.hash(resetToken, 12),
          resetPasswordExpires: resetTokenExpiry,
          updatedAt: new Date()
        } 
      }
    )

    return resetToken // Return plain token for email
  }

  // Verify reset token and change password
  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    const collection = await this.getCollection()
    
    // Find users with active reset tokens
    const users = await collection.find({
      resetPasswordExpires: { $gt: new Date() }
    }).toArray()

    // Check if token matches any user
    for (const user of users) {
      if (user.resetPasswordToken && await bcrypt.compare(token, user.resetPasswordToken)) {
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12)
        
        // Update password and clear reset token
        await collection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              password: hashedNewPassword,
              updatedAt: new Date()
            },
            $unset: {
              resetPasswordToken: "",
              resetPasswordExpires: ""
            }
          }
        )
        
        return true
      }
    }

    return false
  }

  // For development/testing - seed demo users
  async seedDemoUsers(): Promise<void> {
    if (process.env.NODE_ENV !== "development") return

    const collection = await this.getCollection()
    const existingUsers = await collection.countDocuments()
    
    if (existingUsers > 0) return // Already seeded

    const demoUsers = [
      {
        id: "demo-student-1",
        name: "Alex Johnson",
        email: "alex@example.com",
        password: "password123",
        role: "student" as const,
        xp: 2450,
        level: 12,
        predictedGrade: "A*",
        currentWorkingAverage: 87.5,
        studyStreak: 7,
      },
      {
        id: "demo-admin-1",
        name: "Sarah Admin",
        email: "admin@proacademics.com",
        password: "password123",
        role: "admin" as const,
        permissions: ["manage_users", "manage_content", "view_analytics", "manage_system"],
      },
      {
        id: "demo-teacher-1",
        name: "Dr. Emily Watson",
        email: "emily@proacademics.com",
        password: "password123",
        role: "teacher" as const,
        subjects: ["Physics", "Mathematics"],
      },
    ]

    for (const userData of demoUsers) {
      try {
        await this.createUser(userData)
      } catch (error) {
        console.log(`Demo user ${userData.email} already exists`)
      }
    }
  }
}

export const userService = new UserService() 