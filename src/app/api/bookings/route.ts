import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const BookingSchema = z.object({
  scheduleId: z.number(),
  seatNumber: z.string(),
  paymentMethod: z.enum(['mtn_mobile_money', 'credit_card']),
  paymentDetails: z.object({
    phoneNumber: z.string().optional(),
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user by email since NextAuth might not provide user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const bookingData = BookingSchema.parse(body);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if schedule exists and has available seats
      const schedule = await tx.schedule.findUnique({
        where: { id: bookingData.scheduleId },
        include: {
          bus: {
            include: {
              company: true
            }
          },
          route: true
        }
      });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      if (schedule.availableSeats < 1) {
        throw new Error('Not enough available seats');
      }

      // Process payment (mock implementation) - assuming 1 passenger per booking
      const paymentResult = await processPayment(
        bookingData.paymentMethod,
        bookingData.paymentDetails,
        schedule.price
      );

      if (!paymentResult.success) {
        throw new Error('Payment failed: ' + paymentResult.message);
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          seatNumber: bookingData.seatNumber,
          status: 'CONFIRMED',
          userId: user.id,
          scheduleId: bookingData.scheduleId
        },
        include: {
          schedule: {
            include: {
              bus: {
                include: {
                  company: true
                }
              },
              route: true
            }
          },
          user: true
        }
      });

      // Update available seats (decrement by 1 for single booking)
      await tx.schedule.update({
        where: { id: bookingData.scheduleId },
        data: {
          availableSeats: {
            decrement: 1
          }
        }
      });

      return booking;
    });

    // Send confirmation email/SMS (mock implementation)
    await sendBookingConfirmation(result);

    return NextResponse.json({
      success: true,
      booking: {
        id: result.id,
        seatNumber: result.seatNumber,
        status: result.status,
        schedule: result.schedule,
        user: {
          email: result.user.email,
          name: result.user.name
        }
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id
      },
      include: {
        schedule: {
          include: {
            bus: {
              include: {
                company: true
              }
            },
            route: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bookings);

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Mock payment processing function
async function processPayment(
  method: 'mtn_mobile_money' | 'credit_card',
  details: { phoneNumber?: string; cardNumber?: string; expiryDate?: string; cvv?: string },
  amount: number
) {
  // In a real implementation, you would integrate with:
  // - MTN Mobile Money API
  // - Stripe or other payment processors
  
  console.log(`Processing ${method} payment for ${amount} RWF`);
  
  // Mock successful payment
  return {
    success: true,
    transactionId: 'TXN_' + Date.now(),
    message: 'Payment processed successfully'
  };
}

// Mock notification function
async function sendBookingConfirmation(booking: {
  id: number;
  user: { email: string; name: string | null };
  schedule: {
    bus: { company: { name: string } };
    route: { origin: string; destination: string } | null;
  };
}) {
  // In a real implementation, you would:
  // - Send email using services like SendGrid, Resend
  // - Send SMS using services like Twilio
  
  console.log(`Sending booking confirmation for booking ${booking.id} to ${booking.user.email}`);
}
