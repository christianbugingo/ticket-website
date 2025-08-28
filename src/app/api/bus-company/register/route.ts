import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      address,
      licenseNumber,
      description,
      contactPersonName,
      contactPersonPhone,
      password,
    } = await request.json();

    // Validate required fields - adjusted for your schema
    if (!name || !licenseNumber || !contactPersonName || !password) {
      return NextResponse.json(
        { error: 'Name, license number, contact person name, and password are required' },
        { status: 400 }
      );
    }

  

   
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the bus company
    const busCompany = await prisma.busCompany.create({
      data: {
        name,
       
       
        description: description || null,
        
        contact: contactPersonPhone || phone || '', // Required field in your schema
        
      },
    });

    // Create a user account for the company owner
    await prisma.user.create({
      data: {
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@company.com`, // Fallback email
        password: hashedPassword,
        name: contactPersonName,
        phone: contactPersonPhone || phone || '',
        role: Role.BUS_OPERATOR, // Use the enum from your schema
        companies: {
          connect: { id: busCompany.id }
        }
      },
    });

    return NextResponse.json({
      message: 'Bus company registration submitted successfully. Please wait for admin approval.',
      companyId: busCompany.id,
    });
  } catch (error) {
    console.error('Error registering bus company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}