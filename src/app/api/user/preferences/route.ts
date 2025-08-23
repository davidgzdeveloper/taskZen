import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

// Force Node.js runtime for bcryptjs compatibility
export const runtime = 'nodejs'


// GET /api/user/preferences - Fetch user preferences
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const userPayload = token ? await AuthService.verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: userPayload.userId },
    });

    // If preferences don't exist, create them with default values
    if (!preferences) {
      const newPreferences = await prisma.userPreferences.create({
        data: {
          userId: userPayload.userId,
          // Default values are set in the schema, so this is sufficient
        },
      });
      return NextResponse.json(newPreferences);
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('[API PREFERENCES GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const userPayload = token ? await AuthService.verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const updatedPreferences = await prisma.userPreferences.update({
      where: { userId: userPayload.userId },
      data: {
        pomodoroWork: body.pomodoroWork,
        pomodoroBreak: body.pomodoroBreak,
        notifications: body.notifications,
        theme: body.theme,
      },
    });

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('[API PREFERENCES PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
