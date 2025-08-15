import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface TransformedBooking {
  id: number;
  ticketId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  agency: string;
  agencyLogo: string | null;
  seatNumber: string;
  plateNumber: string;
  createdAt: string;
}

type BookingWithDetails = {
  id: number;
  seatNumber: string;
  status: string;
  createdAt: Date;
  scheduleId: number;
  schedule: {
    departure: Date;
    arrival: Date;
    price: number;
    bus: {
      plateNumber: string;
      company: {
        name: string;
        logoUrl: string | null;
      };
    };
    route: {
      origin: string;
      destination: string;
    } | null;
  };
};

// GET - Get current user's bookings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        schedule: {
          include: {
            bus: {
              include: {
                company: {
                  select: {
                    name: true,
                    logoUrl: true,
                  },
                },
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

    // Transform bookings for frontend
    const transformedBookings: TransformedBooking[] = bookings.map((booking: BookingWithDetails) => {
      const schedule = booking.schedule;
      const now = new Date();
      const departureDate = new Date(schedule.departure);
      
      let status = 'Upcoming';
      if (booking.status === 'CANCELLED') {
        status = 'Cancelled';
      } else if (departureDate < now) {
        status = 'Completed';
      }

      return {
        id: booking.id,
        ticketId: `TKT-${booking.id.toString().padStart(6, '0')}`,
        from: schedule.route?.origin || 'Unknown',
        to: schedule.route?.destination || 'Unknown',
        date: schedule.departure.toISOString().split('T')[0],
        time: schedule.departure.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        amount: schedule.price,
        status,
        agency: schedule.bus.company.name,
        agencyLogo: schedule.bus.company.logoUrl,
        seatNumber: booking.seatNumber,
        plateNumber: schedule.bus.plateNumber,
        createdAt: booking.createdAt.toISOString(),
      };
    });

    // Separate upcoming and all bookings
    const upcomingBookings = transformedBookings.filter((booking: TransformedBooking) => booking.status === 'Upcoming');
    
    return NextResponse.json({
      upcoming: upcomingBookings,
      all: transformedBookings,
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Cancel a booking
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if booking belongs to user and is cancellable
    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(bookingId),
        userId: user.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
        schedule: {
          select: {
            departure: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or cannot be cancelled' },
        { status: 404 }
      );
    }

    // Check if departure is more than 2 hours away
    const now = new Date();
    const departure = new Date(booking.schedule.departure);
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 2) {
      return NextResponse.json(
        { error: 'Cannot cancel booking less than 2 hours before departure' },
        { status: 400 }
      );
    }

    // Cancel the booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    });

    // Update available seats in schedule
    await prisma.schedule.update({
      where: { id: booking.scheduleId },
      data: {
        availableSeats: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
