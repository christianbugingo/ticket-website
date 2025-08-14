// app/admin/schedules/page.tsx
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import {ScheduleTable} from '@/components/schedule-table'

export const revalidate = 0 // No caching

export default async function SchedulesPage() {
  const session = await auth()
  
  // Redirect unauthenticated users
  if (!session?.user) {
    redirect('/sign-in')
  }

  // Check admin role
  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  try {
    const [schedules, buses] = await Promise.all([
      prisma.schedule.findMany({
        include: {
          bus: {
            include: {
              company: true
            }
          }
        },
        orderBy: {
          departure: 'asc'
        }
      }),
      prisma.bus.findMany()
    ])

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Manage Schedules</h1>
        <ScheduleTable schedules={schedules} buses={buses} />
      </div>
    )
  } catch (error) {
    console.error('Failed to load schedules:', error)
    return (
      <div className="p-4 text-red-600">
        Failed to load schedule data. Please try again later.
      </div>
    )
  }
}