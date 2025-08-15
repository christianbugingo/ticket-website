import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user and verify they are a company owner
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'BUS_OPERATOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find the company
    const company = await prisma.busCompany.findUnique({
      where: { contact: session.user.email },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get all bookings for this company's buses
    const bookings = await prisma.booking.findMany({
      where: {
        schedule: {
          bus: {
            companyId: company.id,
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        schedule: {
          select: {
            departure: true,
            arrival: true,
            price: true,
            bus: {
              select: {
                plateNumber: true,
                model: true,
              },
            },
            route: {
              select: {
                origin: true,
                destination: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching company bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
