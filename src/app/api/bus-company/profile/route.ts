import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'BUS_OPERATOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const company = await prisma.busCompany.findFirst({
  where: { contact: session.user.email },
  select: {
        id: true,
        name: true,
        
        description: true,
       
        createdAt: true,
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
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
