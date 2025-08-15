import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const BusSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(100, 'Maximum capacity is 100'),
  model: z.string().optional(),
  companyId: z.number().min(1, 'Company ID is required'),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    const whereClause = companyId ? { companyId: parseInt(companyId) } : {};

    const buses = await prisma.bus.findMany({
      where: whereClause,
      include: {
        company: true,
        schedules: {
          include: {
            route: true
          }
        }
      },
      orderBy: {
        plateNumber: 'asc'
      }
    });

    return NextResponse.json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or bus operator
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'BUS_OPERATOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const busData = BusSchema.parse(body);

    // Verify company exists
    const company = await prisma.busCompany.findUnique({
      where: { id: busData.companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // If user is bus operator, verify they own the company
    if (user.role === 'BUS_OPERATOR' && company.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const bus = await prisma.bus.create({
      data: busData,
      include: {
        company: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Bus created successfully',
      bus
    });

  } catch (error) {
    console.error('Error creating bus:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid bus data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
