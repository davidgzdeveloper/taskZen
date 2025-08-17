import { prisma } from '@/lib/prisma'
import { User } from '@/lib/types'

export class ProfileService {
  // Get user profile data (stored in User model)
  static async getUserProfile(userId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: { fullName?: string; avatarUrl?: string }): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })
  }
}
