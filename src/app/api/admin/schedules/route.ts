// app/api/admin/schedules/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}