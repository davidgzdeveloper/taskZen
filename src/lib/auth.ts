import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { prisma } from './prisma';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = '7d';

// The JWT secret needs to be encoded for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);
const alg = 'HS256';

export interface JWTPayload extends jose.JWTPayload {
  userId: string;
  email: string;
}

export class AuthService {
  // In-memory cache for verified tokens (prevents repeated JWT verification)
  private static tokenCache = new Map<string, { payload: JWTPayload; expires: number }>();
  
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static async generateToken(userId: string, email: string): Promise<string> {
    return await new jose.SignJWT({ userId, email })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(secretKey);
  }

  // Verify JWT token with caching
  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      // Check cache first
      const cached = this.tokenCache.get(token);
      if (cached && Date.now() < cached.expires) {
        return cached.payload;
      }

      const { payload } = await jose.jwtVerify(token, secretKey);
      const jwtPayload = payload as JWTPayload;
      
      // Cache for 5 minutes to reduce repeated verification
      const cacheExpiry = Date.now() + (5 * 60 * 1000);
      this.tokenCache.set(token, { payload: jwtPayload, expires: cacheExpiry });
      
      // Clean up expired cache entries periodically
      if (this.tokenCache.size > 100) {
        this.cleanupCache();
      }
      
      return jwtPayload;
    } catch (error) {
      console.error('[AuthService] JWT Verification Error:', error);
      return null;
    }
  }

  // Clean up expired cache entries
  private static cleanupCache(): void {
    const now = Date.now();
    for (const [token, data] of this.tokenCache.entries()) {
      if (now >= data.expires) {
        this.tokenCache.delete(token);
      }
    }
  }

  // Sign up user
  static async signUp(email: string, password: string, fullName: string): Promise<{ user: User; token: string } | { error: string }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return { error: 'User already exists' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
        },
      });

      // Generate token
      const token = await this.generateToken(user.id, user.email);

      return { user, token };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<{ user: User; token: string } | { error: string }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { error: 'Invalid credentials' };
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.password);
      if (!isValidPassword) {
        return { error: 'Invalid credentials' };
      }

      // Generate token
      const token = await this.generateToken(user.id, user.email);

      return { user, token };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Get user from token
  static async getUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = await this.verifyToken(token);
      if (!payload) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Creates a one-time reset token for `email`. Returns the raw token to email,
   * or null when no account matches (callers must not reveal which).
   * Only the token's SHA-256 is stored, so a database leak can't be used to reset passwords.
   */
  static async createPasswordResetToken(email: string): Promise<{ token: string; user: User } | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    // At most one email a minute per account
    if (user.resetTokenExpires && user.resetTokenExpires.getTime() - RESET_TOKEN_TTL_MS + 60_000 > Date.now()) {
      return null;
    }

    const token = randomBytes(32).toString('base64url');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: sha256(token),
        resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });
    return { token, user };
  }

  /** Sets a new password if `token` is valid and unexpired, then burns the token. */
  static async resetPassword(token: string, newPassword: string): Promise<{ ok: true } | { error: string }> {
    const user = await prisma.user.findFirst({ where: { resetTokenHash: sha256(token) } });
    if (!user || !user.resetTokenExpires || user.resetTokenExpires.getTime() < Date.now()) {
      return { error: 'El enlace no es válido o ha caducado. Pide uno nuevo.' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await this.hashPassword(newPassword),
        resetTokenHash: null,
        resetTokenExpires: null,
      },
    });
    return { ok: true };
  }
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/** The user as sent to the browser: never the password hash or reset token. */
export function toPublicUser<T extends Partial<User>>(user: T) {
  const { password, resetTokenHash, resetTokenExpires, ...publicUser } = user;
  return publicUser;
}