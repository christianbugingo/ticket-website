// app/admin/buses/add/page.tsx
import { prisma } from '@/lib/prisma'
import { BusForm } from '@/components/bus-form'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function AddBusPage() {
  const session = await getServerSession(authOptions)
  
  // Only allow admin access
  if (session?.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  async function addBus(formData: FormData) {
    'use server'
    
    try {
      await prisma.bus.create({
        data: {
          plateNumber: formData.get('plateNumber') as string,
          capacity: parseInt(formData.get('capacity') as string),
          companyId: parseInt(formData.get('companyId') as string)
        }
      })
    } catch (error) {
      console.error('Failed to add bus:', error)
      throw error
    }
  }

  const companies = await prisma.busCompany.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Bus</h1>
        <BusForm companies={companies} action={addBus} />
      </div>
    </div>
  )
}