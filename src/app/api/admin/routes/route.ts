import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const RouteSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  distance: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  companyId: z.number().min(1, 'Company ID is required'),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    const whereClause = companyId ? { companyId: parseInt(companyId) } : {};

    const routes = await prisma.route.findMany({
      where: whereClause,
      include: {
        company: true,
        schedules: {
          include: {
            bus: true
          }
        }
      },
      orderBy: [
        { origin: 'asc' },
        { destination: 'asc' }
      ]
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
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
    const routeData = RouteSchema.parse(body);

    // Verify company exists
    const company = await prisma.busCompany.findUnique({
      where: { id: routeData.companyId }
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

    const route = await prisma.route.create({
      data: routeData,
      include: {
        company: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Route created successfully',
      route
    });

  } catch (error) {
    console.error('Error creating route:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid route data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
