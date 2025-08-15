import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const ScheduleSchema = z.object({
  departure: z.string().datetime(),
  arrival: z.string().datetime(),
  price: z.number().positive(),
  availableSeats: z.number().min(1).max(100),
  busId: z.number().min(1),
  routeId: z.number().min(1),
});

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        bus: {
          include: {
            company: true,
          },
        },
        route: true,
      },
      orderBy: {
        departure: 'asc'
      }
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    const scheduleData = ScheduleSchema.parse(body);

    // Verify bus and route exist
    const bus = await prisma.bus.findUnique({
      where: { id: scheduleData.busId },
      include: { company: true }
    });

    const route = await prisma.route.findUnique({
      where: { id: scheduleData.routeId },
      include: { company: true }
    });

    if (!bus || !route) {
      return NextResponse.json(
        { error: 'Bus or route not found' },
        { status: 404 }
      );
    }

    // If user is bus operator, verify they own the company
    if (user.role === 'BUS_OPERATOR' && 
        (bus.company.ownerId !== user.id || route.company.ownerId !== user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate schedule times
    const departureTime = new Date(scheduleData.departure);
    const arrivalTime = new Date(scheduleData.arrival);

    if (departureTime >= arrivalTime) {
      return NextResponse.json(
        { error: 'Arrival time must be after departure time' },
        { status: 400 }
      );
    }

    if (scheduleData.availableSeats > bus.capacity) {
      return NextResponse.json(
        { error: 'Available seats cannot exceed bus capacity' },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        departure: departureTime,
        arrival: arrivalTime,
        price: scheduleData.price,
        availableSeats: scheduleData.availableSeats,
        busId: scheduleData.busId,
        routeId: scheduleData.routeId,
      },
      include: {
        bus: {
          include: {
            company: true
          }
        },
        route: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Schedule created successfully',
      schedule
    });

  } catch (error) {
    console.error('Error creating schedule:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid schedule data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
