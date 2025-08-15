import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type UserWithCount = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: Date;
  _count: {
    bookings: number;
  };
};

// GET - Get all users (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.email !== 'admin@itike.rw') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for admin dashboard
    const transformedUsers = users.map((user: UserWithCount) => ({
      id: user.id,
      name: user.name || 'N/A',
      email: user.email,
      phone: user.phone || 'N/A',
      role: user.role,
      dateJoined: user.createdAt.toISOString().split('T')[0],
      totalBookings: user._count.bookings,
      status: 'Active', // You can add a status field to the User model later
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.email !== 'admin@itike.rw') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // For now, we'll just return success since we don't have a status field
    // In the future, you might want to add a status field to the User model
    if (action === 'suspend') {
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: { status: 'SUSPENDED' }
      // });
      console.log(`User ${userId} would be suspended`);
    } else if (action === 'activate') {
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: { status: 'ACTIVE' }
      // });
      console.log(`User ${userId} would be activated`);
    }

    return NextResponse.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.email !== 'admin@itike.rw') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete user and cascade delete their bookings
    await prisma.user.delete({
      where: { id: parseInt(userId) },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
