import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const ProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// GET - Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform data for frontend
    const profile = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      initials: user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : user.email[0].toUpperCase(),
      avatarUrl: 'https://placehold.co/100x100.png', // You can add avatar support later
      memberSince: user.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      }),
      totalBookings: user._count.bookings,
      dateOfBirth: '1990-05-15', // You can add this field to User model later
      homeAddress: 'KG 123 St, Kigali', // You can add this field to User model later
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Handle profile update
    if (body.type === 'profile') {
      const validation = ProfileSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const { name, phone } = validation.data;

      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          name,
          ...(phone && { phone }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        id: updatedUser.id,
        name: updatedUser.name || '',
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role,
        initials: updatedUser.name
          ? updatedUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
          : updatedUser.email[0].toUpperCase(),
        avatarUrl: 'https://placehold.co/100x100.png',
        memberSince: updatedUser.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        }),
        message: 'Profile updated successfully',
      });
    }

    // Handle password change
    if (body.type === 'password') {
      const validation = PasswordChangeSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const { currentPassword, newPassword } = validation.data;

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { password: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedNewPassword },
      });

      return NextResponse.json({ message: 'Password updated successfully' });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
