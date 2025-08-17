import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { User } from '@/lib/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  // Generate JWT token
  static generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return null
    }
  }

  // Sign up user
  static async signUp(email: string, password: string, fullName: string): Promise<{ user: User; token: string } | { error: string }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return { error: 'User already exists' }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
        }
      })

      // Profile data is now stored directly in User model
      // No need to create separate profile

      // Generate token
      const token = this.generateToken(user.id, user.email)

      return { user, token }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<{ user: User; token: string } | { error: string }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return { error: 'Invalid credentials' }
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.password)
      if (!isValidPassword) {
        return { error: 'Invalid credentials' }
      }

      // Generate token
      const token = this.generateToken(user.id, user.email)

      return { user, token }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Get user from token
  static async getUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = this.verifyToken(token)
      if (!payload) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      })

      return user
    } catch (error) {
      return null
    }
  }
}
