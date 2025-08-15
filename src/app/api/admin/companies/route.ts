import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const BusCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  logoUrl: z.string().url().optional(),
  contact: z.string().min(10, 'Contact must be at least 10 characters'),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const companies = await prisma.busCompany.findMany({
      include: {
        buses: true,
        routes: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
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
    const companyData = BusCompanySchema.parse(body);

    const company = await prisma.busCompany.create({
      data: {
        ...companyData,
        ownerId: user.role === 'BUS_OPERATOR' ? parseInt(session.user.id) : undefined
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      company
    });

  } catch (error) {
    console.error('Error creating company:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid company data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
