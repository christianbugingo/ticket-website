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

    // Find the company associated with the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'BUS_OPERATOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find company by contact (assuming user email matches company contact)
    const company = await prisma.busCompany.findUnique({
      where: { contact: session.user.email },
      include: {
        buses: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            capacity: true,
          },
        },
        routes: {
          select: {
            id: true,
            origin: true,
            destination: true,
            distance: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      licenseNumber: company.licenseNumber,
      description: company.description,
      status: company.status,
      contactPersonName: company.contactPersonName,
      contactPersonPhone: company.contactPersonPhone,
      buses: company.buses,
      routes: company.routes,
      createdAt: company.createdAt,
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
