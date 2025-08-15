import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const SearchQuerySchema = z.object({
  departure: z.string().min(1),
  arrival: z.string().min(1),
  travelDate: z.string().min(1),
  passengers: z.coerce.number().min(1).max(50)
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      departure: searchParams.get('departure'),
      arrival: searchParams.get('arrival'),
      travelDate: searchParams.get('travelDate'),
      passengers: searchParams.get('passengers')
    };

    const validatedQuery = SearchQuerySchema.parse(query);
    
    // Parse and validate the travel date
    let travelDate: Date;
    try {
      travelDate = new Date(validatedQuery.travelDate);
      if (isNaN(travelDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid travel date format. Please use YYYY-MM-DD format.' },
        { status: 400 }
      );
    }
    
    // Set date range for the travel day
    const startOfDay = new Date(travelDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(travelDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find available schedules
    const schedules = await prisma.schedule.findMany({
      where: {
        departure: {
          gte: startOfDay,
          lte: endOfDay
        },
        availableSeats: {
          gte: validatedQuery.passengers
        },
        OR: [
          // If route exists, check route origin/destination
          {
            route: {
              origin: {
                contains: validatedQuery.departure,
                mode: 'insensitive'
              },
              destination: {
                contains: validatedQuery.arrival,
                mode: 'insensitive'
              }
            }
          },
          // Also search by exact match for better results
          {
            route: {
              origin: {
                equals: validatedQuery.departure,
                mode: 'insensitive'
              },
              destination: {
                equals: validatedQuery.arrival,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        bus: {
          include: {
            company: true
          }
        },
        route: true
      },
      orderBy: {
        departure: 'asc'
      }
    });

    // Transform data to match frontend Route type
    const routes = schedules.map((schedule: typeof schedules[0]) => ({
      id: schedule.id.toString(),
      agency: schedule.bus.company.name,
      agencyLogoUrl: schedule.bus.company.logoUrl || "https://placehold.co/40x40.png",
      departureTime: schedule.departure.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      arrivalTime: schedule.arrival.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      duration: calculateDuration(schedule.departure, schedule.arrival),
      price: schedule.price,
      availableSeats: schedule.availableSeats,
      scheduleId: schedule.id,
      busId: schedule.bus.id,
      routeId: schedule.route?.id || null
    }));

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Error searching routes:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

function calculateDuration(departure: Date, arrival: Date): string {
  const diffMs = arrival.getTime() - departure.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours === 0) {
    return `${diffMinutes}m`;
  } else if (diffMinutes === 0) {
    return `${diffHours}h`;
  } else {
    return `${diffHours}h ${diffMinutes}m`;
  }
}
